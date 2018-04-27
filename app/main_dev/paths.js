import path from "path";
import os from "os";

// In all the functions below the Windows path is constructed based on
// os.homedir() rather than using process.env.LOCALAPPDATA because in my tests
// that was available when using the standalone node but not there when using
// electron in production mode.
export function appDataDirectory() {
  if (os.platform() === "win32") {
    return path.join(os.homedir(), "AppData", "Local", "Decrediton");
  } else if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "decrediton");
  }
  return path.join(os.homedir(), ".config", "decrediton");
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

export function getWalletPath(testnet, walletPath = "", testnet2) {
  const testnetStr = testnet ? "testnet" : "mainnet";
  const testnet2Str = testnet2 === true ? "testnet2" : testnet2 === false ? "mainnet" : "";
  return path.join(getWalletsDirectoryPath(), testnetStr, walletPath, testnet2Str);
}

export function getDefaultWalletDirectory(testnet, testnet2) {
  return getWalletPath(testnet, "default-wallet", testnet2);
}

export function getDefaultWalletFilesPath(testnet, filePath = "") {
  return path.join(getDefaultWalletDirectory(testnet), filePath);
}

export function getWalletDBPathFromWallets(testnet, walletPath) {
  const network = testnet ? "testnet" : "mainnet";
  const networkFolder = testnet ? "testnet2" : "mainnet";
  return path.join(getWalletsDirectoryPath(), network, walletPath, networkFolder, "wallet.db");
}

export function getExilibriumWalletDBPath(testnet) {
  return path.join(appDataDirectory(), testnet ? "testnet2" : "mainnet", "wallet.db");
}

export function exccctlCfg(configPath) {
  return path.resolve(configPath, "dcrctl.conf");
}

export function exccdCfg(configPath) {
  return path.resolve(configPath, "dcrd.conf");
}

export function exccwalletCfg(configPath) {
  return path.resolve(configPath, "dcrwallet.conf");
}

export function getExccdPath() {
  if (os.platform() === "win32") {
    return path.join(os.homedir(), "AppData", "Local", "Dcrd");
  } else if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "dcrd");
  }
  return path.join(os.homedir(), ".dcrd");
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
  let execName =
    os.platform() !== "win32"
      ? name
      : os.arch() === "x64"
        ? name + "64.exe"
        : os.arch() === "ia32"
          ? name + "32.exe"
          : name + ".exe";

  return path.join(binPath, execName);
}

export function getDirectoryLogs(dir) {
  return path.join(dir, "logs");
}
