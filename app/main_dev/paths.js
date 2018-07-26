import path from "path";
import os from "os";
import fs from "fs-extra";
import { initWalletCfg, newWalletConfigCreation } from "../config";

// In all the functions below the Windows path is constructed based on
// os.homedir() rather than using process.env.LOCALAPPDATA because in my tests
// that was available when using the standalone node but not there when using
// electron in production mode.
export function appDataDirectory() {
  if (os.platform() === "win32") {
    return path.join(os.homedir(), "AppData", "Local", "Exilibrium");
  } else if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "exilibrium");
  }
  return path.join(os.homedir(), ".config", "exilibrium");
}

export function getGlobalCfgPath() {
  return path.resolve(appDataDirectory(), "config.json");
}

export function getWalletsDirectoryPath() {
  return path.join(appDataDirectory(), "wallets");
}

export function getWalletsDirectoryPathNetwork(testnet) {
  return path.join(appDataDirectory(), "wallets", testnet ? "testnet" : "mainnet");
}

export function getWalletPath(testnet, walletPath = "") {
  const testnetStr = testnet ? "testnet" : "mainnet";
  return path.join(getWalletsDirectoryPath(), testnetStr, walletPath);
}

export function getDefaultWalletDirectory(testnet) {
  return getWalletPath(testnet, "default-wallet");
}

export function getDefaultWalletFilesPath(testnet, filePath = "") {
  return path.join(getDefaultWalletDirectory(testnet), filePath);
}

export function getWalletDBPathFromWallets(testnet, walletPath) {
  const network = testnet ? "testnet" : "mainnet";
  const networkFolder = testnet ? "testnet" : "mainnet";
  return path.join(getWalletsDirectoryPath(), network, walletPath, networkFolder, "wallet.db");
}

export function getExilibriumWalletDBPath(testnet) {
  return path.join(appDataDirectory(), testnet ? "testnet" : "mainnet", "wallet.db");
}

export function exccctlCfg(configPath) {
  return path.resolve(configPath, "exccctl.conf");
}

export function exccdCfg(configPath) {
  return path.resolve(configPath, "exccd.conf");
}

export function exccwalletCfg(configPath) {
  return path.resolve(configPath, "exccwallet.conf");
}

export function getExccdPath() {
  if (os.platform() === "win32") {
    return path.join(os.homedir(), "AppData", "Local", "Exccd");
  } else if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "exccd");
  }
  return path.join(os.homedir(), ".exccd");
}

export function getExccwalletPath() {
  if (os.platform() === "win32") {
    return path.join(os.homedir(), "AppData", "Local", "Exccwallet");
  } else if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "exccwallet");
  }
  return path.join(os.homedir(), ".exccwallet");
}

export function getExccdRpcCert(appDataPath) {
  return path.resolve(appDataPath ? appDataPath : getExccdPath(), "rpc.cert");
}

export function getExecutablePath(name, customBinPath) {
  const binPath = customBinPath
    ? customBinPath
    : process.env.NODE_ENV === "development"
      ? path.join(__dirname, "..", "..", "bin")
      : path.join(process.resourcesPath, "bin");
  const execName =
    os.platform() !== "win32"
      ? name
      : os.arch() === "x64"
        ? `${name}64.exe`
        : os.arch() === "ia32"
          ? `${name}32.exe`
          : `${name}32.exe`;

  return path.join(binPath, execName);
}

export function getDirectoryLogs(dir) {
  return path.join(dir, "logs");
}

export function checkAndInitWalletCfg(testnet) {
  const walletDirectory = getDefaultWalletDirectory(testnet);

  if (
    !fs.pathExistsSync(walletDirectory) &&
    fs.pathExistsSync(getExilibriumWalletDBPath(testnet))
  ) {
    fs.mkdirsSync(walletDirectory);

    // check for existing mainnet directories
    if (fs.pathExistsSync(getExilibriumWalletDBPath(testnet))) {
      fs.copySync(
        getExilibriumWalletDBPath(testnet),
        path.join(getDefaultWalletDirectory(testnet), "wallet.db")
      );
    }

    // copy over existing config.json if it exists
    if (fs.pathExistsSync(getGlobalCfgPath())) {
      fs.copySync(getGlobalCfgPath(), getDefaultWalletFilesPath(testnet, "config.json"));
    }

    // create new configs for default mainnet wallet
    initWalletCfg(testnet, "default-wallet");
    newWalletConfigCreation(testnet, "default-wallet");
  }
}
