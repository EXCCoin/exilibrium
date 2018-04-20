import fs from "fs-extra";

import * as paths from "./paths";
import * as config from "../config";
import daemonLauncher from "./daemon-launcher";
import walletLauncher from "./wallet-launcher";

export function getAvailableWallets(event, network) {
  // Attempt to find all currently available wallet.db's in the respective network direction in each wallets data dir
  const availableWallets = [];

  if (network === "mainnet") {
    const mainnetWalletDirectories = fs.readdirSync(paths.getWalletPath(false));
    for (const i in mainnetWalletDirectories) {
      if (
        fs.pathExistsSync(
          paths.getWalletDBPathFromWallets(false, mainnetWalletDirectories[i].toString())
        )
      ) {
        availableWallets.push({
          network: "mainnet",
          wallet: mainnetWalletDirectories[i],
          finished: true
        });
      } else {
        availableWallets.push({
          network: "mainnet",
          wallet: mainnetWalletDirectories[i],
          finished: false
        });
      }
    }
  } else {
    const testnetWalletDirectories = fs.readdirSync(paths.getWalletPath(true));
    for (const key in testnetWalletDirectories) {
      if (
        fs.pathExistsSync(
          paths.getWalletDBPathFromWallets(true, testnetWalletDirectories[key].toString())
        )
      ) {
        availableWallets.push({
          network: "testnet",
          wallet: testnetWalletDirectories[key],
          finished: true
        });
      } else {
        availableWallets.push({
          network: "testnet",
          wallet: testnetWalletDirectories[key],
          finished: false
        });
      }
    }
  }
  event.returnValue = availableWallets;
}

export function createWallet(event, walletPath, testnet) {
  const newWalletDirectory = paths.getWalletPath(testnet, walletPath);
  if (!fs.pathExistsSync(newWalletDirectory)) {
    fs.mkdirsSync(newWalletDirectory);

    // create new configs for new wallet
    config.initWalletCfg(testnet, walletPath);
    config.newWalletConfigCreation(testnet, walletPath);
  }
  event.returnValue = true;
}

export function removeWallet(event, walletPath, testnet) {
  const removeWalletDirectory = paths.getWalletPath(testnet, walletPath);
  if (fs.pathExistsSync(removeWalletDirectory)) {
    fs.removeSync(removeWalletDirectory);
  }
  event.returnValue = true;
}

export function startWallet(state, event, walletPath, testnet) {
  if (state.exccwPID) {
    state.logger.log("info", `exccwallet already started ${state.exccwPID}`);
    state.mainWindow.webContents.send("exccwallet-port", state.exccwPort);
    event.returnValue = state.exccwPID;
    return;
  }
  try {
    state.exccwPID = walletLauncher(state, walletPath, testnet);
  } catch (e) {
    state.logger.log("error", `error launching exccwallet: ${e}`);
  }
  event.returnValue = config.getWalletCfg(testnet, walletPath);
}

export function startDaemon(state, deps, event, appData, testnet) {
  if (state.exccdPID && state.exccdConfig && !state.daemonIsAdvanced) {
    state.logger.log("info", "Skipping restart of daemon as it is already running");
    event.returnValue = state.exccdConfig;
    return;
  }
  if (appData) {
    state.logger.log("info", "launching exccd with different appdata directory");
  }
  if (state.exccdPID && state.exccdConfig) {
    state.logger.log("info", `exccd already started ${state.exccdPID}`);
    event.returnValue = state.exccdConfig;
    return;
  }
  if (!state.daemonIsAdvanced && !state.primaryInstance) {
    state.logger.log("info", "Running on secondary instance. Assuming exccd is already running.");
    let exccdConfPath = paths.getExccdPath();
    if (!fs.existsSync(config.exccdCfg(exccdConfPath))) {
      exccdConfPath = config.createTempExccdConf();
    }
    state.exccdConfig = config.readExccdConfig(exccdConfPath, testnet);
    state.exccdConfig.rpc_cert = paths.getExccdRpcCert();
    state.exccdConfig.pid = -1;
    event.returnValue = state.exccdConfig;
    return;
  }
  try {
    let exccdConfPath = paths.getExccdPath();
    if (!fs.existsSync(config.exccdCfg(exccdConfPath))) {
      exccdConfPath = config.createTempExccdConf();
    }
    state.exccdConfig = daemonLauncher(state, exccdConfPath, appData, testnet);
    state.exccdPID = state.exccdConfig.pid;
  } catch (e) {
    state.logger.log("error", `error launching exccd: ${e}`);
  }
  event.returnValue = state.exccdConfig;
}

export function checkDaemon(state, event, rpcCreds, testnet) {
  const args = ["getblockcount"];
  let host, port;
  if (!rpcCreds) {
    args.push(`--configfile=${paths.exccctlCfg(paths.appDataDirectory())}`);
  } else if (rpcCreds) {
    if (rpcCreds.rpc_user) {
      args.push(`--rpcuser=${rpcCreds.rpc_user}`);
    }
    if (rpcCreds.rpc_password) {
      args.push(`--rpcpass=${rpcCreds.rpc_password}`);
    }
    if (rpcCreds.rpc_cert) {
      args.push(`--rpccert=${rpcCreds.rpc_cert}`);
    }
    if (rpcCreds.rpc_host) {
      host = rpcCreds.rpc_host;
    }
    if (rpcCreds.rpc_port) {
      port = rpcCreds.rpc_port;
    }
    args.push(`--rpcserver=${host}:${port}`);
  }

  if (testnet) {
    args.push("--testnet");
  }

  const dcrctlExe = paths.getExecutablePath("dcrctl", state.argv.customBinPath);
  if (!fs.existsSync(dcrctlExe)) {
    state.logger.log("error", "The exccctl file does not exists");
  }

  state.logger.log("info", `checking if daemon is ready  with exccctl ${args}`);

  const { spawn } = require("child_process");
  const dcrctl = spawn(dcrctlExe, args, {
    detached: false,
    stdio: ["ignore", "pipe", "pipe", "pipe"]
  });

  dcrctl.stdout.on("data", data => {
    state.currentBlockCount = data.toString();
    state.logger.log("info", data.toString());
    state.mainWindow.webContents.send("check-daemon-response", state.currentBlockCount);
  });
  dcrctl.stderr.on("data", data => {
    state.logger.log("error", data.toString());
    state.mainWindow.webContents.send("check-daemon-response", 0);
  });
}

export function grpcVersionsDetermined(state, event, versions) {
  state.grpcVersions = { ...state.grpcVersions, ...versions };
}

export function getExilibriumLogs(event) {
  event.returnValue = "exilibrium logs!";
}

export function getExccwalletLogs(state, event) {
  event.returnValue = state.exccwalletLogs;
}

export function mainLog(state, event, ...args) {
  state.logger.log(...args);
}

export function getExccdLogs(state, event) {
  event.returnValue = state.exccdLogs;
}

export function setPreviousWallet(state, event, cfg) {
  state.previousWallet = cfg;
  event.returnValue = true;
}

export function getPreviousWallet(state, event) {
  event.returnValue = state.previousWallet;
}
