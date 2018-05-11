import Promise from "promise";
import { ipcRenderer } from "electron";
import { isString } from "util";
import { withLog, logOptionNoResponseData } from "./app";

export const checkExilibriumVersion = withLog(
  () => Promise.resolve(ipcRenderer.sendSync("check-version")),
  "Check Exilibrium release version"
);

export const startDaemon = withLog(
  (appData, testnet) =>
    Promise.resolve(ipcRenderer.sendSync("start-daemon", appData, testnet)).then(pid => {
      if (pid) {
        return pid;
      }
      throw "Error starting daemon";
    }),
  "Start Daemon"
);

export const cleanShutdown = () => {
  return new Promise(resolve => {
    ipcRenderer.send("clean-shutdown");
    ipcRenderer.on("clean-shutdown-finished", (event, stopped) => {
      if (!stopped) throw "Error shutting down app";
      resolve(stopped);
    });
  });
};

export const createNewWallet = withLog(
  (walletPath, testnet) =>
    Promise.resolve(ipcRenderer.sendSync("create-wallet", walletPath, testnet)).then(pid => {
      if (pid) {
        return pid;
      }
      throw "Error creating wallet";
    }),
  "Create Wallet"
);

export const removeWallet = withLog(
  (walletPath, testnet) =>
    Promise.resolve(ipcRenderer.sendSync("remove-wallet", walletPath, testnet)).then(pid => {
      if (pid) {
        return pid;
      }
      throw "Error creating wallet";
    }),
  "Remove Wallet"
);

export const stopWallet = withLog(
  () => Promise.resolve(ipcRenderer.sendSync("stop-wallet")).then(stopped => stopped),
  "Stop Wallet"
);

export const startWallet = withLog(
  (walletPath, testnet) =>
    new Promise((resolve, reject) => {
      let pid, port;

      // resolveCheck must be done both on the exccwallet-port event and on the
      // return of the sendSync call because we can't be certain which will happen first
      const resolveCheck = () => (pid && port ? resolve({ pid, port }) : null);

      ipcRenderer.once("exccwallet-port", (e, p) => {
        port = p;
        resolveCheck();
      });
      pid = ipcRenderer.sendSync("start-wallet", walletPath, testnet);
      if (!pid) reject("Error starting wallet");
      resolveCheck();
    }),
  "Start Wallet"
);

export const setPreviousWallet = withLog(
  cfg => Promise.resolve(ipcRenderer.sendSync("set-previous-wallet", cfg)),
  "Set Previous Wallet"
);

export const getPreviousWallet = withLog(
  () => Promise.resolve(ipcRenderer.sendSync("get-previous-wallet")),
  "Get Previous Wallet",
  logOptionNoResponseData()
);

export const getBlockCount = withLog(
  (rpcCreds, testnet) =>
    new Promise(resolve => {
      ipcRenderer.once("check-daemon-response", (e, block) => {
        const blockCount = isString(block) ? parseInt(block.trim()) : block;
        resolve(blockCount);
      });
      ipcRenderer.send("check-daemon", rpcCreds, testnet);
    }),
  "Get Block Count"
);

export const getExccdLogs = withLog(
  () =>
    Promise.resolve(ipcRenderer.sendSync("get-exccd-logs")).then(logs => {
      if (logs) {
        return logs;
      }
      throw "Error getting exccd logs";
    }),
  "Get Exccd Logs",
  logOptionNoResponseData()
);

export const getExccwalletLogs = withLog(
  () =>
    Promise.resolve(ipcRenderer.sendSync("get-exccwallet-logs")).then(logs => {
      if (logs) return logs;
      throw "Error getting exccwallet logs";
    }),
  "Get Exccwallet Logs",
  logOptionNoResponseData()
);

export const getExilibriumLogs = withLog(
  () =>
    Promise.resolve(ipcRenderer.sendSync("get-exilibrium-logs")).then(logs => {
      if (logs) {
        return logs;
      }
      throw "Error getting exilibrium logs";
    }),
  "Get Exilibrium Logs",
  logOptionNoResponseData()
);

export const getAvailableWallets = withLog(
  network =>
    Promise.resolve(ipcRenderer.sendSync("get-available-wallets", network)).then(
      availableWallets => {
        if (availableWallets) return availableWallets;
        throw "Error getting avaiable wallets logs";
      }
    ),
  "Get Available Wallets",
  logOptionNoResponseData()
);
