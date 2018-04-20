import fs from "fs-extra";
import os from "os";

import * as config from "../config";
import * as paths from "./paths";
import { MAX_LOG_LENGTH } from "./constants";

export default function daemonLauncher(state, daemonPath, appdata, testnet) {
  const { spawn } = require("child_process");
  let args = [];
  let newConfig = {};
  if (appdata) {
    args = [`--appdata=${appdata}`];
    newConfig = config.readExccdConfig(appdata, testnet);
    newConfig.rpc_cert = paths.getExccdRpcCert(appdata);
  } else {
    args = [`--configfile=${paths.exccdCfg(daemonPath)}`];
    newConfig = config.readExccdConfig(daemonPath, testnet);
    newConfig.rpc_cert = paths.getExccdRpcCert();
  }
  if (testnet) {
    args.push("--testnet");
  }
  // Check to make sure that the rpcuser and rpcpass were set in the config
  if (!newConfig.rpc_user || !newConfig.rpc_password) {
    const errorMessage =
      "No " +
      `${!newConfig.rpc_user ? "rpcuser " : ""}` +
      `${!newConfig.rpc_user && !newConfig.rpc_password ? "and " : ""}` +
      `${!newConfig.rpc_password ? "rpcpass " : ""}` +
      "set in " +
      `${appdata ? appdata : paths.getExccdPath()}` +
      "/exccd.conf.  Please set them and restart.";
    state.logger.log("error", errorMessage);
    state.mainWindow.webContents.executeJavaScript('alert("' + `${errorMessage}` + '");');
    state.mainWindow.webContents.executeJavaScript("window.close();");
  }

  const exccdExe = paths.getExecutablePath("exccd", state.argv.customBinPath);
  if (!fs.existsSync(exccdExe)) {
    state.logger.log("error", "The exccd file does not exists");
    return;
  }

  if (os.platform() === "win32") {
    try {
      const util = require("util");
      const win32ipc = require("../node_modules/win32ipc/build/Release/win32ipc.node");
      const pipe = win32ipc.createPipe("out");
      args.push(util.format("--piperx=%d", pipe.readEnd));
    } catch (e) {
      state.logger.log("error", `can't find proper module to launch exccd: ${e}`);
    }
  }

  state.logger.log("info", `Starting ${exccdExe} with ${args}`);

  const exccd = spawn(exccdExe, args, {
    detached: os.platform() === "win32",
    stdio: ["ignore", "pipe", "pipe"]
  });

  exccd.on("error", err => {
    state.logger.log("error", `Error running exccd.  Check logs and restart! ${err}`);
    state.mainWindow.webContents.executeJavaScript(
      `alert("Error running exccd.  Check logs and restart! ${err}");`
    );
    state.mainWindow.webContents.executeJavaScript("window.close();");
  });

  exccd.on("close", code => {
    if (state.daemonIsAdvanced) return;
    if (code !== 0) {
      state.logger.log(
        "error",
        "exccd closed due to an error.  Check exccd logs and contact support if the issue persists."
      );
      state.mainWindow.webContents.executeJavaScript(
        'alert("exccd closed due to an error.  Check exccd logs and contact support if the issue persists.");'
      );
      state.mainWindow.webContents.executeJavaScript("window.close();");
    } else {
      state.logger.log("info", `exccd exited with code ${code}`);
    }
  });

  exccd.stdout.on(
    "data",
    data => (state.exccdLogs = addToLog(process.stdout, state.exccdLogs, data, state.debug))
  );
  exccd.stderr.on(
    "data",
    data => (state.exccdLogs = addToLog(process.stderr, state.exccdLogs, data, state.debug))
  );

  newConfig.pid = exccd.pid;
  state.logger.log("info", `exccd started with pid: ${newConfig.pid}`);

  exccd.unref();
  return newConfig;
}

function addToLog(destIO, destLogBuffer, data, debug) {
  const dataBuffer = Buffer.from(data);
  if (destLogBuffer.length + dataBuffer.length > MAX_LOG_LENGTH) {
    destLogBuffer = destLogBuffer.slice(destLogBuffer.indexOf(os.EOL, dataBuffer.length) + 1);
  }
  debug && destIO.write(data);
  return Buffer.concat([destLogBuffer, dataBuffer]);
}
