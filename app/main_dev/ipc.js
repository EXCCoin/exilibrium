import fs from "fs-extra";
import path from "path";
import parseArgs from "minimist";
import si from "systeminformation";
import { OPTIONS } from "./constants";
import { logger } from "./logging";
import {
  getWalletPath,
  getWalletDBPathFromWallets,
  getExccdPath,
  exccdCfg,
  exccctlCfg,
  appDataDirectory,
  getExecutablePath
} from "./paths";
import { createTempExccdConf, initWalletCfg, newWalletConfigCreation } from "../config";
import {
  launchEXCCD,
  launchEXCCWallet,
  GetExccdPID,
  GetExccwPID,
  closeEXCCW,
  GetExccwPort
} from "./launch";

const argv = parseArgs(process.argv.slice(1), OPTIONS);

export const getAvailableWallets = network => {
  // Attempt to find all currently available wallet.db's in the respective network direction in each wallets data dir
  const availableWallets = [];
  const isTestNet = network !== "mainnet";

  const walletsBasePath = getWalletPath(isTestNet);
  const walletDirs = fs.readdirSync(walletsBasePath);
  walletDirs.forEach(wallet => {
    const walletDirStat = fs.statSync(path.join(walletsBasePath, wallet));

    if (!walletDirStat.isDirectory()) {
      return;
    }

    const walletDbFilePath = getWalletDBPathFromWallets(isTestNet, wallet);
    const finished = fs.pathExistsSync(walletDbFilePath);
    availableWallets.push({ network, wallet, finished });
  });

  return availableWallets;
};

export const startDaemon = (
  mainWindow,
  daemonIsAdvanced,
  primaryInstance,
  appData,
  testnet,
  reactIPC
) => {
  if (GetExccdPID() && GetExccdPID() !== -1) {
    logger.info(`Skipping restart of daemon as it is already running ${GetExccdPID()}`);
    return GetExccdPID();
  }
  if (appData) {
    logger.info("launching exccd with different appdata directory");
  }
  if (!daemonIsAdvanced && !primaryInstance) {
    logger.info("Running on secondary instance. Assuming exccd is already running.");
    let exccdConfPath = getExccdPath();
    if (!fs.existsSync(exccdCfg(exccdConfPath))) {
      exccdConfPath = createTempExccdConf();
    }
    return -1;
  }
  try {
    let exccdConfPath = getExccdPath();
    if (!fs.existsSync(exccdCfg(exccdConfPath))) {
      exccdConfPath = createTempExccdConf();
    }
    return launchEXCCD(mainWindow, daemonIsAdvanced, exccdConfPath, appData, testnet, reactIPC);
  } catch (e) {
    logger.error(`error launching exccd: ${e}`);
  }
};

export const createWallet = (testnet, walletPath) => {
  const newWalletDirectory = getWalletPath(testnet, walletPath);
  try {
    if (!fs.pathExistsSync(newWalletDirectory)) {
      fs.mkdirsSync(newWalletDirectory);

      // create new configs for new wallet
      initWalletCfg(testnet, walletPath);
      newWalletConfigCreation(testnet, walletPath);
    }
    return true;
  } catch (e) {
    logger.error(`error creating wallet: ${e}`);
    return false;
  }
};

export const removeWallet = (testnet, walletPath) => {
  const removeWalletDirectory = getWalletPath(testnet, walletPath);
  try {
    if (fs.pathExistsSync(removeWalletDirectory)) {
      fs.removeSync(removeWalletDirectory);
    }
    return true;
  } catch (e) {
    logger.error(`error creating wallet: ${e}`);
    return false;
  }
};

export const startWallet = (mainWindow, daemonIsAdvanced, testnet, walletPath, reactIPC) => {
  if (GetExccwPID()) {
    logger.info(`exccwallet already started ${GetExccwPID()}`);
    mainWindow.webContents.send("exccwallet-port", GetExccwPort());
    event.returnValue = GetExccwPID();
    return;
  }
  initWalletCfg(testnet, walletPath);
  try {
    return launchEXCCWallet(mainWindow, daemonIsAdvanced, walletPath, testnet, reactIPC);
  } catch (e) {
    logger.error(`error launching exccwallet: ${e}`);
  }
};

export const stopWallet = () => {
  return closeEXCCW(GetExccwPID());
};

export const checkDaemon = (mainWindow, rpcCreds, testnet) => {
  const args = ["getblockcount"];
  let host, port;
  let currentBlockCount;

  if (!rpcCreds) {
    args.push(`--configfile=${exccctlCfg(appDataDirectory())}`);
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

  const exccctlExe = getExecutablePath("exccctl", argv.customBinPath);
  if (!fs.existsSync(exccctlExe)) {
    logger.error("The exccctl file does not exists");
  }

  logger.info(`checking if daemon is ready  with exccctl ${args}`);

  const { spawn } = require("child_process");
  const exccctl = spawn(exccctlExe, args, {
    detached: false,
    stdio: ["ignore", "pipe", "pipe", "pipe"]
  });

  exccctl.stdout.on("data", data => {
    currentBlockCount = data.toString();
    logger.info(data.toString());
    mainWindow.webContents.send("check-daemon-response", currentBlockCount);
  });
  exccctl.stderr.on("data", data => {
    logger.error(data.toString());
    mainWindow.webContents.send("check-daemon-response", 0);
  });
};

export function toggleMining(rpcCreds, { enable = false, CPUCores = 1, miningAddresses = [] }) {
  logger.info(`enable: ${enable}, CPUCores: ${CPUCores}, miningAddresses: ${miningAddresses[0]}`);
  const args = ["setgenerate", `${enable}`, `${CPUCores}`, `${miningAddresses[0]}`];
  let host, port;

  if (!rpcCreds) {
    args.push(`--configfile=${exccctlCfg(appDataDirectory())}`);
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

  const exccctlExe = getExecutablePath("exccctl", argv.customBinPath);

  if (!fs.existsSync(exccctlExe)) {
    logger.error("The exccctl file does not exists");
  }

  const { spawn } = require("child_process");
  const exccctl = spawn(exccctlExe, args, {
    detached: false,
    stdio: ["ignore", "pipe", "pipe", "pipe"]
  });

  exccctl.stdout.on("data", data => {
    logger.info(data.toString());
  });
  exccctl.stderr.on("data", data => {
    logger.error(data.toString());
  });
}

export async function getSystemInfo() {
  logger.info("Requesting CPU & memory info");
  try {
    const [cpuData, memoryData] = await Promise.all([si.cpu(), si.mem()]);
    logger.info(`CPU cores: ${cpuData.cores}, available memory: ${memoryData.available}`);
    return {
      cores: cpuData.cores,
      availableMemory: memoryData.available,
      totalMemory: memoryData.total
    };
  } catch (err) {
    logger.error(err);
    return err;
  }
}
