import fs from "fs-extra";
import os from "os";
import { concat, isString } from "lodash";
import stringArgv from "string-argv";

import * as paths from "./paths";
import * as config from "../config";
import { MAX_LOG_LENGTH } from "./constants";

export default function walletLauncher(state, walletPath, testnet) {
  const { spawn } = require("child_process");
  let args = [`--configfile=${paths.exccwalletCfg(paths.getWalletPath(testnet, walletPath))}`];

  const cfg = config.getWalletCfg(testnet, walletPath);

  args.push(`--ticketbuyer.balancetomaintainabsolute=${cfg.get("balancetomaintain")}`);
  args.push(`--ticketbuyer.maxfee=${cfg.get("maxfee")}`);
  args.push(`--ticketbuyer.maxpricerelative=${cfg.get("maxpricerelative")}`);
  args.push(`--ticketbuyer.maxpriceabsolute=${cfg.get("maxpriceabsolute")}`);
  args.push(`--ticketbuyer.maxperblock=${cfg.get("maxperblock")}`);

  const exccwExe = paths.getExecutablePath("dcrwallet", state.argv.customBinPath);
  if (!fs.existsSync(exccwExe)) {
    state.logger.log("error", "The exccwallet file does not exists");
    return;
  }

  if (os.platform() === "win32") {
    try {
      const util = require("util");
      const win32ipc = require("../node_modules/win32ipc/build/Release/win32ipc.node");
      const pipe = win32ipc.createPipe("out");
      args.push(util.format("--piperx=%d", pipe.readEnd));
    } catch (e) {
      state.logger.log("error", `can't find proper module to launch exccwallet: ${e}`);
    }
  } else {
    args.push("--rpclistenerevents");
    args.push("--pipetx=4");
  }

  // Add any extra args if defined.
  if (state.argv.extrawalletargs !== undefined && isString(state.argv.extrawalletargs)) {
    args = concat(args, stringArgv(state.argv.extrawalletargs));
  }

  state.logger.log("info", `Starting ${exccwExe} with ${args}`);

  const exccwallet = spawn(exccwExe, args, {
    detached: os.platform() === "win32",
    stdio: ["ignore", "pipe", "pipe", "ignore", "pipe"]
  });

  const notifyGrpcPort = port => {
    state.exccwPort = port;
    state.logger.log("info", "wallet grpc running on port", port);
    state.mainWindow.webContents.send("dcrwallet-port", port);
  };

  exccwallet.stdio[4].on("data", data =>
    decodeDaemonIPCData(data, (mtype, payload) => {
      if (mtype === "grpclistener") {
        const intf = payload.toString("utf-8");
        const matches = intf.match(/^.+:(\d+)$/);
        if (matches) {
          notifyGrpcPort(matches[1]);
        } else {
          state.logger.log("error", `GRPC port not found on IPC channel to exccwallet: ${intf}`);
        }
      }
    })
  );

  exccwallet.on("error", err => {
    state.logger.log("error", `Error running exccwallet.  Check logs and restart! ${err}`);
    state.mainWindow.webContents.executeJavaScript(
      `alert("Error running exccwallet.  Check logs and restart! ${err}");`
    );
    state.mainWindow.webContents.executeJavaScript("window.close();");
  });

  exccwallet.on("close", code => {
    if (state.daemonIsAdvanced) {
      return;
    }
    if (code !== 0) {
      state.logger.log(
        "error",
        "exccwallet closed due to an error.  Check exccwallet logs and contact support if the issue persists."
      );
      state.mainWindow.webContents.executeJavaScript(
        'alert("exccwallet closed due to an error.  Check exccwallet logs and contact support if the issue persists.");'
      );
      state.mainWindow.webContents.executeJavaScript("window.close();");
    } else {
      state.logger.log("info", `exccwallet exited with code ${code}`);
    }
  });

  const addStdoutToLogListener = data =>
    (state.exccwalletLogs = addToLog(process.stdout, state.exccwalletLogs, data, state.debug));

  // waitForGrpcPortListener is added as a stdout on("data") listener only on
  // win32 because so far that's the only way we found to get back the grpc port
  // on that platform. For linux/macOS users, the --pipetx argument is used to
  // provide a pipe back to exilibrium, which reads the grpc port in a secure and
  // reliable way.
  const waitForGrpcPortListener = data => {
    const matches = /DCRW: gRPC server listening on [^ ]+:(\d+)/.exec(data);
    if (matches) {
      notifyGrpcPort(matches[1]);
      // swap the listener since we don't need to keep looking for the port
      exccwallet.stdout.removeListener("data", waitForGrpcPortListener);
      exccwallet.stdout.on("data", addStdoutToLogListener);
    }
    state.exccwalletLogs = addToLog(process.stdout, state.exccwalletLogs, data, state.debug);
  };

  exccwallet.stdout.on(
    "data",
    os.platform() === "win32" ? waitForGrpcPortListener : addStdoutToLogListener
  );
  exccwallet.stderr.on(
    "data",
    data =>
      (state.exccwalletLogs = addToLog(process.stderr, state.exccwalletLogs, data, state.debug))
  );

  state.exccwPID = exccwallet.pid;
  state.logger.log("info", `exccwallet started with pid:${state.exccwPID}`);

  exccwallet.unref();
  return state.exccwPID;
}

function addToLog(destIO, destLogBuffer, data, debug) {
  const dataBuffer = Buffer.from(data);
  if (destLogBuffer.length + dataBuffer.length > MAX_LOG_LENGTH) {
    destLogBuffer = destLogBuffer.slice(destLogBuffer.indexOf(os.EOL, dataBuffer.length) + 1);
  }
  debug && destIO.write(data);
  return Buffer.concat([destLogBuffer, dataBuffer]);
}

// DecodeDaemonIPCData decodes messages from an IPC message received from exccd/
// exccwallet using their internal IPC protocol.
// NOTE: very simple impl for the moment, will break if messages get split
// between data calls.
function decodeDaemonIPCData(data, cb) {
  let i = 0;
  while (i < data.length) {
    if (data[i++] !== 0x01) throw "Wrong protocol version when decoding IPC data";
    const mtypelen = data[i++];
    const mtype = data.slice(i, i + mtypelen).toString("utf-8");
    i += mtypelen;
    const psize = data.readUInt32LE(i);
    i += 4;
    const payload = data.slice(i, i + psize);
    i += psize;
    cb(mtype, payload);
  }
}
