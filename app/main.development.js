import { app, dialog } from "electron";
import fs from "fs-extra";
import os from "os";
import path from "path";
import parseArgs from "minimist";
import { Buffer } from "buffer";

import {
  OPTIONS,
  USAGE_MESSAGE,
  VERSION_MESSAGE,
  BOTH_CONNECTION_ERR_MESSAGE
} from "./main_dev/constants";
import * as paths from "./main_dev/paths";
import * as ipc from "./main_dev/ipc";
import * as application from "./main_dev/app";
import { createLogger } from "./main_dev/logging";
import * as config from "./config";
import { eql } from "./fp";

// setPath as exilibrium
app.setPath("userData", paths.appDataDirectory());

const argv = parseArgs(process.argv.slice(1), OPTIONS);
const debug = argv.debug || process.env.NODE_ENV === "development";
const globalCfg = config.initGlobalCfg();

const win32Equals = eql("win32");

const state = {
  menu: null,
  template: null,
  mainWindow: null,
  versionWin: null,
  grpcVersions: { requiredVersion: null, walletVersion: null },
  exccdPID: null,
  exccwPID: null,
  exccwPort: null,
  previousWallet: null,
  exccdConfig: {},
  currentBlockCount: null,
  primaryInstance: null,
  exccdLogs: Buffer.from(""),
  exccwalletLogs: Buffer.from(""),
  globalCfg,
  logger: createLogger(debug),
  argv,
  daemonIsAdvanced: globalCfg.get("daemon_start_advanced"),
  walletsDirectory: paths.getWalletsDirectoryPath(),
  defaultTestnetWalletDirectory: paths.getDefaultWalletDirectory(true),
  defaultMainnetWalletDirectory: paths.getDefaultWalletDirectory(false),
  mainnetWalletsPath: paths.getWalletsDirectoryPathNetwork(false),
  testnetWalletsPath: paths.getWalletsDirectoryPathNetwork(true)
};

// Verify that config.json is valid JSON before fetching it, because
// it will silently fail when fetching.
const err = config.validateGlobalCfgFile();
if (err !== null) {
  const errMessage = `There was an error while trying to load the config file, the format is invalid.\n\nFile: ${paths.getGlobalCfgPath()}\nError: ${err}`;
  dialog.showErrorBox("Config File Error", errMessage);
  app.quit();
}

if (state.argv.help) {
  console.log(USAGE_MESSAGE);
  app.exit(0);
}

if (state.argv.version) {
  console.log(VERSION_MESSAGE);
  app.exit(0);
}

// Check if network was set on command line (but only allow one!).
if (state.argv.testnet && state.argv.mainnet) {
  state.logger.log(BOTH_CONNECTION_ERR_MESSAGE);
  app.quit();
}

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support"); // eslint-disable-line
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === "development") {
  const path = require("path"); // eslint-disable-line
  const p = path.join(__dirname, "..", "app", "node_modules"); // eslint-disable-line
  require("module").globalPaths.push(p); // eslint-disable-line
}

// Check that wallets directory has been created, if not, make it.
fs.pathExistsSync(state.walletsDirectory) || fs.mkdirsSync(state.walletsDirectory);
fs.pathExistsSync(state.mainnetWalletsPath) || fs.mkdirsSync(state.mainnetWalletsPath);
fs.pathExistsSync(state.testnetWalletsPath) || fs.mkdirsSync(state.testnetWalletsPath);

if (
  !fs.pathExistsSync(state.defaultMainnetWalletDirectory) &&
  fs.pathExistsSync(paths.getExilibriumWalletDBPath(false))
) {
  fs.mkdirsSync(state.defaultMainnetWalletDirectory);

  // check for existing mainnet directories
  if (fs.pathExistsSync(paths.getExilibriumWalletDBPath(false))) {
    fs.copySync(
      paths.getExilibriumWalletDBPath(false),
      path.join(paths.getDefaultWalletDirectory(false, false), "wallet.db")
    );
  }

  // copy over existing config.json if it exists
  if (fs.pathExistsSync(paths.getGlobalCfgPath())) {
    fs.copySync(paths.getGlobalCfgPath(), paths.getDefaultWalletFilesPath(false, "config.json"));
  }

  // create new configs for default mainnet wallet
  config.initWalletCfg(false, "default-wallet");
  config.newWalletConfigCreation(false, "default-wallet");
}

if (
  !fs.pathExistsSync(state.defaultTestnetWalletDirectory) &&
  fs.pathExistsSync(paths.getExilibriumWalletDBPath(true))
) {
  fs.mkdirsSync(state.defaultTestnetWalletDirectory);

  // check for existing testnet2 directories
  if (fs.pathExistsSync(paths.getExilibriumWalletDBPath(true))) {
    fs.copySync(
      paths.getExilibriumWalletDBPath(true),
      path.join(paths.getDefaultWalletDirectory(true, true), "wallet.db")
    );
  }

  // copy over existing config.json if it exists
  if (fs.pathExistsSync(paths.getGlobalCfgPath())) {
    fs.copySync(paths.getGlobalCfgPath(), paths.getDefaultWalletFilesPath(true, "config.json"));
  }

  // create new configs for default testnet wallet
  config.initWalletCfg(true, "default-wallet");
  config.newWalletConfigCreation(true, "default-wallet");
}

state.logger.log("info", `Using config/data from: ${app.getPath("userData")}`);
state.logger.log(
  "info",
  "Versions: Exilibrium: %s, Electron: %s, Chrome: %s",
  app.getVersion(),
  process.versions.electron,
  process.versions.chrome
);

process.on("uncaughtException", err => {
  state.logger.log("error", "UNCAUGHT EXCEPTION", err);
  throw err;
});

function closeEXCCW() {
  if (require("is-running")(state.exccwPID) && !win32Equals(os.platform())) {
    state.logger.log("info", `Sending SIGINT to exccwallet at pid: ${state.exccwPID}`);
    process.kill(state.exccwPID, "SIGINT");
  }
}

function closeEXCCD() {
  if (require("is-running")(state.exccdPID) && !win32Equals(os.platform())) {
    state.logger.log("info", `Sending SIGINT to exccd at pid: ${state.exccdPID}`);
    process.kill(state.exccdPID, "SIGINT");
  }
}

function closeClis() {
  // shutdown daemon and wallet.
  // Don't try to close if not running.
  if (state.exccdPID && state.exccdPID !== -1) {
    closeEXCCD();
  }
  if (state.exccwPID && state.exccwPID !== -1) {
    closeEXCCW();
  }
}

function cleanShutdown() {
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
    state.logger.log("info", "Closing exilibrium.");

    const shutdownTimer = setInterval(() => {
      const stillRunning = require("is-running")(state.exccdPID) && !win32Equals(os.platform());

      if (!stillRunning) {
        state.logger.log("info", "Final shutdown pause. Quitting app.");
        clearInterval(shutdownTimer);
        if (state.mainWindow) {
          state.mainWindow.webContents.send("daemon-stopped");
          setTimeout(() => {
            state.mainWindow.close();
            app.quit();
          }, 1000);
        } else {
          app.quit();
        }
        resolve(true);
      }
      state.logger.log("info", "Daemon still running in final shutdown pause. Waiting.");
    }, shutDownPause * 1000);
  });
}

const { ipcMain } = require("electron");

function bindState(fn) {
  // this will pass global state variable as a first function parameter
  // no matter what other parameters are
  return fn.bind(null, state);
}

ipcMain.on("get-available-wallets", ipc.getAvailableWallets);
ipcMain.on("start-daemon", bindState(ipc.startDaemon));
ipcMain.on("create-wallet", ipc.createWallet);
ipcMain.on("remove-wallet", ipc.removeWallet);
ipcMain.on("start-wallet", bindState(ipc.startWallet));
ipcMain.on("check-daemon", bindState(ipc.checkDaemon));
ipcMain.on("clean-shutdown", async event => {
  const stopped = await cleanShutdown();
  event.sender.send("clean-shutdown-finished", stopped);
});

ipcMain.on("app-reload-ui", () => {
  state.mainWindow.reload();
});

ipcMain.on("grpc-versions-determined", bindState(ipc.grpcVersionsDetermined));
ipcMain.on("main-log", bindState(ipc.mainLog));
ipcMain.on("get-exccd-logs", bindState(ipc.getExccdLogs));
ipcMain.on("get-exilibrium-logs", ipc.getExilibriumLogs);

ipcMain.on("get-exccwallet-logs", bindState(ipc.getExccwalletLogs));
ipcMain.on("get-previous-wallet", bindState(ipc.getPreviousWallet));
ipcMain.on("set-previous-wallet", bindState(ipc.setPreviousWallet));

state.primaryInstance = !app.makeSingleInstance(() => true);
const stopSecondInstance = !state.primaryInstance && !state.daemonIsAdvanced;
if (stopSecondInstance) {
  state.logger.log("error", "Preventing second instance from running.");
}

app.on("ready", application.ready.bind(null, state, cleanShutdown, stopSecondInstance));

app.on("before-quit", event => {
  state.logger.log("info", "Caught before-quit. Set exilibrium as was closed");
  event.preventDefault();
  cleanShutdown();
  config.setMustOpenForm(true);
  app.exit(0);
});
