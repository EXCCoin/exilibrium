import {
  exccwalletCfg,
  getWalletPath,
  getExecutablePath,
  exccdCfg,
  getExccdRpcCert
} from "./paths";
import { getWalletCfg, readExccdConfig } from "../config";
import {
  logger,
  AddToExccdLog,
  AddToExccwalletLog,
  GetExccdLogs,
  GetExccwalletLogs,
  lastErrorLine
} from "./logging";
import parseArgs from "minimist";
import { OPTIONS } from "./constants";
import os from "os";
import fs from "fs-extra";
import stringArgv from "string-argv";
import { concat, isString } from "lodash";
import taskkill from "taskkill";

const argv = parseArgs(process.argv.slice(1), OPTIONS);
const debug = argv.debug || process.env.NODE_ENV === "development";

let exccdPID;
let exccwPID;
let exccdWindowsClosing = false;
let exccwWindowsClosing = false;
let exccwPort;

function closeClis() {
  // shutdown daemon and wallet.
  // Don't try to close if not running.
  if (exccdPID && exccdPID !== -1) {
    closeEXCCD(exccdPID);
  }
  if (exccwPID && exccwPID !== -1) {
    closeEXCCW(exccwPID);
  }
}

export async function closeEXCCD() {
  try {
    const processRunning = require("is-running")(exccdPID);
    if (processRunning && os.platform() !== "win32") {
      logger.info(`Sending SIGINT to exccd at pid:${exccdPID}`);
      process.kill(exccdPID, "SIGINT");
      return true;
    } else if (processRunning && os.platform() === "win32") {
      logger.info(`Attempting to kill exccd at pid:${exccdPID}`);
      exccdWindowsClosing = true;
      await taskkill(exccdPID, { force: true });
      logger.info(`Forcefully killed exccd process`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`error closing daemon ${e}`);
    return false;
  }
}

export const closeEXCCW = async () => {
  try {
    const processRunning = require("is-running")(exccwPID);
    if (processRunning && os.platform() !== "win32") {
      logger.info(`Sending SIGINT to exccwallet at pid:${exccwPID}`);
      process.kill(exccwPID, "SIGINT");
    } else if (processRunning && os.platform() === "win32") {
      logger.info(`Attempting to kill exccwallet at pid: ${exccwPID}`);
      exccwWindowsClosing = true;
      await taskkill(exccwPID, { force: true });
      logger.info(`Forcefully killed exccwwallet process`);
    }
    exccwPID = null;
    return true;
  } catch (e) {
    logger.error(`error closing wallet: ${e}`);
    return false;
  }
};

export function cleanShutdown(mainWindow, app) {
  // Attempt a clean shutdown.
  return new Promise(resolve => {
    const cliShutDownPause = 2; // in seconds.
    const shutDownPause = 3; // in seconds.
    closeClis();
    // Sent shutdown message again as we have seen it missed in the past if they
    // are still running.
    setTimeout(() => {
      closeClis();
    }, cliShutDownPause * 1000);
    logger.info("Closing exilibrium.");

    const shutdownTimer = setInterval(() => {
      const stillRunning = require("is-running")(exccdPID) && os.platform() !== "win32";

      if (!stillRunning) {
        logger.info("Final shutdown pause. Quitting app.");
        clearInterval(shutdownTimer);
        if (mainWindow) {
          mainWindow.webContents.send("daemon-stopped");
          setTimeout(() => {
            mainWindow.close();
            app.quit();
          }, 1000);
        } else {
          app.quit();
        }
        resolve(true);
      }
      logger.info("Daemon still running in final shutdown pause. Waiting.");
    }, shutDownPause * 1000);
  });
}

export const launchEXCCD = (
  mainWindow,
  daemonIsAdvanced,
  daemonPath,
  appdata,
  testnet,
  reactIPC
) => {
  const { spawn } = require("child_process");
  let args = [];
  let newConfig = {};
  if (appdata) {
    args = [`--appdata=${appdata}`];
    newConfig = readExccdConfig(appdata, testnet);
    newConfig.rpc_cert = getExccdRpcCert(appdata);
  } else {
    args = [`--configfile=${exccdCfg(daemonPath)}`];
    newConfig = readExccdConfig(daemonPath, testnet);
    newConfig.rpc_cert = getExccdRpcCert();
  }
  if (testnet) {
    args.push("--testnet");
  }

  const exccdExe = getExecutablePath("exccd", argv.customBinPath);
  if (!fs.existsSync(exccdExe)) {
    logger.error("The exccd file does not exists");
    return;
  }

  logger.info(`Starting ${exccdExe} with ${args}`);

  const exccd = spawn(exccdExe, args, {
    stdio: ["ignore", "pipe", "pipe"]
  });

  exccd.on("error", err => {
    logger.error(`Error running exccd.  Check logs and restart! ${err}`);
    if (!exccdWindowsClosing) {
      mainWindow.webContents.executeJavaScript(
        `alert("Error running exccd.  Check logs and restart! '${err}'");`
      );
      mainWindow.webContents.executeJavaScript("window.close();");
    }
  });

  exccd.on("close", code => {
    if (daemonIsAdvanced) {
      return;
    }
    if (code !== 0) {
      const lastExccdErr = lastErrorLine(GetExccdLogs());
      logger.error("exccd closed due to an error: ", lastExccdErr);
      if (!exccdWindowsClosing) {
        reactIPC.send("error-received", true, lastExccdErr);
      }
      exccdWindowsClosing = false;
    } else {
      logger.info(`exccd exited with code ${code}`);
    }
  });

  exccd.stdout.on("data", data => AddToExccdLog(process.stdout, data, debug));
  exccd.stderr.on("data", data => AddToExccdLog(process.stderr, data, debug));

  newConfig.pid = exccd.pid;
  exccdPID = exccd.pid;
  logger.info(`exccd started with pid:${newConfig.pid}`);

  if (os.platform() !== "win32") {
    exccd.unref();
  }
  return newConfig;
};

// DecodeDaemonIPCData decodes messages from an IPC message received from exccd/
// exccwallet using their internal IPC protocol.
// NOTE: very simple impl for the moment, will break if messages get split
// between data calls.
const DecodeDaemonIPCData = (logger, data, cb) => {
  let i = 0;
  while (i < data.length) {
    if (data[i++] !== 0x01) {
      throw "Wrong protocol version when decoding IPC data";
    }
    const mtypelen = data[i++];
    const mtype = data.slice(i, i + mtypelen).toString("utf-8");
    i += mtypelen;
    const psize = data.readUInt32LE(i);
    i += 4;
    const payload = data.slice(i, i + psize);
    i += psize;
    cb(mtype, payload);
  }
};

export const launchEXCCWallet = (mainWindow, daemonIsAdvanced, walletPath, testnet, reactIPC) => {
  const { spawn } = require("child_process");
  let args = [`--configfile=${exccwalletCfg(getWalletPath(testnet, walletPath))}`];

  const cfg = getWalletCfg(testnet, walletPath);

  const gaplimit = parseInt(cfg.get("gaplimit"));

  if (gaplimit && !isNaN(gaplimit) && gaplimit !== 20) {
    logger.info(`Using custom gap limit: ${gaplimit}`);
    args.push(`--gaplimit=${gaplimit}`);
  }

  args.push(`--ticketbuyer.balancetomaintainabsolute=${cfg.get("balancetomaintain")}`);
  args.push(`--ticketbuyer.maxfee=${cfg.get("maxfee")}`);
  args.push(`--ticketbuyer.maxpricerelative=${cfg.get("maxpricerelative")}`);
  args.push(`--ticketbuyer.maxpriceabsolute=${cfg.get("maxpriceabsolute")}`);
  args.push(`--ticketbuyer.maxperblock=${cfg.get("maxperblock")}`);

  const exccwExe = getExecutablePath("exccwallet", argv.customBinPath);
  if (!fs.existsSync(exccwExe)) {
    logger.error("The exccwallet file does not exists");
    return;
  }

  if (os.platform() !== "win32") {
    args.push("--rpclistenerevents");
    args.push("--pipetx=4");
  }

  // Add any extra args if defined.
  if (argv.extrawalletargs !== undefined && isString(argv.extrawalletargs)) {
    args = concat(args, stringArgv(argv.extrawalletargs));
  }

  logger.info(`Starting ${exccwExe} with ${args}`);

  const exccwallet = spawn(exccwExe, args, {
    stdio: ["ignore", "pipe", "pipe", "ignore", "pipe"]
  });

  const notifyGrpcPort = port => {
    exccwPort = port;
    logger.info("wallet grpc running on port", port);
    mainWindow.webContents.send("exccwallet-port", port);
  };

  exccwallet.stdio[4].on("data", data =>
    DecodeDaemonIPCData(logger, data, (mtype, payload) => {
      if (mtype === "grpclistener") {
        const intf = payload.toString("utf-8");
        const matches = intf.match(/^.+:(\d+)$/);
        if (matches) {
          notifyGrpcPort(matches[1]);
        } else {
          logger.error(`GRPC port not found on IPC channel to exccwallet: ${intf}`);
        }
      }
    })
  );

  exccwallet.on("error", err => {
    logger.error(`Error running wallet.  Check logs and restart! ${err}`);
    if (!exccwWindowsClosing) {
      mainWindow.webContents.executeJavaScript(
        `alert("Error running exccwallet.  Check logs and restart! '${err}'");`
      );
      mainWindow.webContents.executeJavaScript("window.close();");
    }
  });

  exccwallet.on("close", code => {
    if (daemonIsAdvanced) {
      return;
    }
    if (code !== 0) {
      const lastExccwalletErr = lastErrorLine(GetExccwalletLogs());
      logger.error(`exccwallet closed due to an error: ${lastExccwalletErr}, code: ${code}}`);
      if (!exccwWindowsClosing) {
        reactIPC.sendSync("error-received", false, lastExccwalletErr);
      }
      exccwWindowsClosing = false;
    } else {
      logger.info(`exccwallet exited with code ${code}`);
    }
  });

  const addStdoutToLogListener = data => AddToExccwalletLog(process.stdout, data, debug);

  // waitForGrpcPortListener is added as a stdout on("data") listener only on
  // win32 because so far that's the only way we found to get back the grpc port
  // on that platform. For linux/macOS users, the --pipetx argument is used to
  // provide a pipe back to exilibrium, which reads the grpc port in a secure and
  // reliable way.
  const waitForGrpcPortListener = data => {
    const matches = /EXCCW: gRPC server listening on [^ ]+:(\d+)/.exec(data);
    if (matches) {
      notifyGrpcPort(matches[1]);
      // swap the listener since we don't need to keep looking for the port
      exccwallet.stdout.removeListener("data", waitForGrpcPortListener);
      exccwallet.stdout.on("data", addStdoutToLogListener);
    }
    AddToExccwalletLog(process.stdout, data, debug);
  };

  exccwallet.stdout.on(
    "data",
    os.platform() === "win32" ? waitForGrpcPortListener : addStdoutToLogListener
  );
  exccwallet.stderr.on("data", data => {
    AddToExccwalletLog(process.stderr, data, debug);
  });

  exccwPID = exccwallet.pid;
  logger.info(`exccwallet started with pid:${exccwPID}`);

  if (os.platform() !== "win32") {
    exccwallet.unref();
  }
  return exccwPID;
};

export const GetExccwPort = () => exccwPort;

export const GetExccdPID = () => exccdPID;

export const GetExccwPID = () => exccwPID;

export const readExesVersion = (app, grpcVersions) => {
  const { spawnSync: spawn } = require("child_process");
  const args = ["--version"];
  const exes = ["exccd", "exccwallet", "exccctl"];
  const versions = {
    grpc: grpcVersions,
    exilibrium: app.getVersion()
  };

  for (const exe of exes) {
    const exePath = getExecutablePath("exccd", argv.customBinPath);
    if (!fs.existsSync(exePath)) {
      logger.error("The exccd file does not exists");
    }

    const proc = spawn(exePath, args, { encoding: "utf8" });
    if (proc.error) {
      logger.error(`Error trying to read version of ${exe}: ${proc.error}`);
      continue;
    }

    const versionLine = proc.stdout.toString();
    if (!versionLine) {
      logger.error(`Empty version line when reading version of ${exe}`);
      continue;
    }

    const decodedLine = versionLine.match(/\w+ version ([^\s]+)/);
    if (decodedLine !== null) {
      versions[exe] = decodedLine[1]; // eslint-disable-line prefer-destructuring
    } else {
      logger.error(`Unable to decode version line ${versionLine}`);
    }
  }

  return versions;
};
