import fs from "fs";
import Store from "electron-store";
import ini from "ini";
import { stakePoolInfo } from "./middleware/stakepoolapi";
import {
  appDataDirectory,
  getGlobalCfgPath,
  exccdCfg,
  getWalletPath,
  exccwalletCfg,
  getExccdRpcCert
} from "./main_dev/paths";

export function getGlobalCfg() {
  const config = new Store();
  return config;
}

export function getWalletCfg(testnet, walletPath) {
  const config = new Store({ cwd: getWalletPath(testnet, walletPath) });
  return config;
}

export function initWalletCfg(testnet, walletPath) {
  const config = new Store({ cwd: getWalletPath(testnet, walletPath) });
  if (!config.has("wallet_start_advanced")) {
    config.set("wallet_start_advanced", false);
  }
  if (!config.has("enableticketbuyer")) {
    config.set("enableticketbuyer", "0");
  }
  if (!config.has("balancetomaintain")) {
    config.set("balancetomaintain", "0");
  }
  if (!config.has("maxfee")) {
    config.set("maxfee", "0.1");
  }
  if (!config.has("maxpricerelative")) {
    config.set("maxpricerelative", "1.25");
  }
  if (!config.has("maxpriceabsolute")) {
    config.set("maxpriceabsolute", "0");
  }
  if (!config.has("maxperblock")) {
    config.set("maxperblock", "5");
  }
  if (!config.has("currency_display")) {
    config.set("currency_display", "EXCC");
  }
  if (!config.has("hiddenaccounts")) {
    const hiddenAccounts = Array();
    config.set("hiddenaccounts", hiddenAccounts);
  }
  if (!config.has("discoveraccounts")) {
    config.set("discoveraccounts", true);
  }
  if (!config.has("remote_credentials")) {
    const credentialKeys = {
      rpc_user: "",
      rpc_password: "",
      rpc_cert: "",
      rpc_host: "",
      rpc_port: ""
    };
    config.set("remote_credentials", credentialKeys);
  }
  if (!config.has("appdata_path")) {
    config.set("appdata_path", "");
  }
  if (!config.has("gaplimit")) {
    config.set("gaplimit", "20");
  }
  stakePoolInfo(foundStakePoolConfigs => {
    if (foundStakePoolConfigs !== null) {
      updateStakePoolConfig(config, foundStakePoolConfigs);
    }
  }, `https://api.excc.co/v1/${testnet ? "testnet" : "mainnet"}`);
  return config;
}

export function initGlobalCfg() {
  const config = new Store();
  if (!config.has("daemon_start_advanced")) {
    config.set("daemon_start_advanced", false);
  }
  if (!config.has("must_open_form")) {
    config.set("must_open_form", true);
  }
  if (!config.has("locale")) {
    config.set("locale", "");
  }
  if (!config.has("network")) {
    config.set("network", "mainnet");
  }
  if (!config.has("set_language")) {
    config.set("set_language", "true");
  }
  if (!config.has("show_tutorial")) {
    config.set("show_tutorial", "true");
  }
  return config;
}

export function validateGlobalCfgFile() {
  let fileContents;
  try {
    fileContents = fs.readFileSync(getGlobalCfgPath(), "utf8");
  } catch (err) {
    return null;
  }

  try {
    JSON.parse(fileContents);
  } catch (err) {
    console.error(err);
    return err;
  }

  return null;
}

export function getWalletCert(certPath) {
  let cert;
  certPath = getExccdRpcCert(certPath);
  try {
    cert = fs.readFileSync(certPath);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`${certPath} does not exist`);
    } else if (err.code === "EACCES") {
      console.log(`${certPath} permission denied`);
    } else {
      console.error(`${certPath} ${err}`);
    }
  }

  return cert;
}

export function readExccdConfig(configPath, testnet) {
  try {
    if (!fs.existsSync(exccdCfg(configPath))) {
      return;
    }
    const readCfg = ini.parse(Buffer.from(fs.readFileSync(exccdCfg(configPath))).toString());
    const newCfg = {};
    newCfg.rpc_host = "127.0.0.1";
    if (testnet) {
      newCfg.rpc_port = "19109";
    } else {
      newCfg.rpc_port = "9109";
    }
    let userFound,
      passFound = false;
    // Look through all top level config entries
    for (const [key, value] of Object.entries(readCfg)) {
      if (key === "rpcuser") {
        newCfg.rpc_user = value;
        userFound = true;
      }
      if (key === "rpcpass") {
        newCfg.rpc_password = value;
        passFound = true;
      }
      if (key === "rpclisten") {
        const splitListen = value.split(":");
        if (splitListen.length >= 2) {
          const [rpc_host, rpc_port] = splitListen;
          newCfg.rpc_host = rpc_host;
          newCfg.rpc_port = rpc_port;
        }
      }
      if (!userFound && !passFound) {
        // If user and pass aren't found on the top level, look through all
        // next level config entries
        for (const [key2, value2] of Object.entries(value)) {
          if (key2 === "rpcuser") {
            newCfg.rpc_user = value2;
            userFound = true;
          }
          if (key2 === "rpcpass") {
            newCfg.rpc_password = value2;
            passFound = true;
          }
          if (key2 === "rpclisten") {
            const splitListen = value2.split(":");
            if (splitListen.length >= 2) {
              const [rpc_host, rpc_port] = splitListen;
              newCfg.rpc_host = rpc_host;
              newCfg.rpc_port = rpc_port;
            }
          }
        }
      }
    }
    return newCfg;
  } catch (err) {
    console.error(err);
  }
}

export function getExccdCert(exccdCertPath) {
  if (exccdCertPath) {
    if (fs.existsSync(exccdCertPath)) {
      return fs.readFileSync(exccdCertPath);
    }
  }
  const certPath = getExccdRpcCert();

  const cert = fs.readFileSync(certPath);
  return cert;
}

export function updateStakePoolConfig(config, foundStakePoolConfigs) {
  const currentStakePoolConfigs =
    config.has("stakepools") && Array.isArray(config.get("stakepools"))
      ? config.get("stakepools")
      : [];

  const currentConfigsByHost = currentStakePoolConfigs.reduce((l, s) => {
    l[s.Host] = s;
    return l;
  }, {});

  if (foundStakePoolConfigs !== null) {
    const newStakePoolConfigs = foundStakePoolConfigs.map(s => {
      const current = currentConfigsByHost[s.Host];
      delete currentConfigsByHost[s.Host];
      return current ? { ...current, ...s } : s;
    });
    Object.keys(currentConfigsByHost).forEach(v =>
      newStakePoolConfigs.push(currentConfigsByHost[v])
    );
    config.set("stakepools", newStakePoolConfigs);
  }
}

export function getAppdataPath(testnet, walletPath) {
  const config = getWalletCfg(testnet, walletPath);
  return config.get("appdata_path");
}

export function setAppdataPath(testnet, appdataPath, walletPath) {
  const config = getWalletCfg(testnet, walletPath);
  const credentialKeys = {
    rpc_user: "",
    rpc_password: "",
    rpc_cert: "",
    rpc_host: "",
    rpc_port: ""
  };
  config.set("remote_credentials", credentialKeys);
  return config.set("appdata_path", appdataPath);
}

export function getRemoteCredentials(testnet, walletPath) {
  const config = getWalletCfg(testnet, walletPath);
  return config.get("remote_credentials");
}

export function setRemoteCredentials(testnet, walletPath, key, value) {
  const config = getWalletCfg(testnet, walletPath);
  config.set("appdata_path", "");
  const credentials = config.get("remote_credentials");
  credentials[key] = value;
  return config.set("remote_credentials", credentials);
}

export function setMustOpenForm(openForm) {
  const config = getGlobalCfg();
  return config.set("must_open_form", openForm);
}

function makeRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function createTempExccdConf() {
  if (!fs.existsSync(exccdCfg(appDataDirectory()))) {
    const rpcUser = makeRandomString(10);
    const rpcPass = makeRandomString(10);

    const exccdConf = {
      "Application Options": {
        rpcuser: rpcUser,
        rpcpass: rpcPass,
        rpclisten: "127.0.0.1:9109"
      }
    };
    fs.writeFileSync(exccdCfg(appDataDirectory()), ini.stringify(exccdConf));
  }
  return appDataDirectory();
}

export function newWalletConfigCreation(testnet, walletPath) {
  // TODO: set random user/password
  const exccwConf = {
    "Application Options": {
      tlscurve: "P-256",
      noinitialload: "1",
      onetimetlskey: "1",
      grpclisten: "127.0.0.1:0",
      appdata: getWalletPath(testnet, walletPath),
      testnet: testnet ? "1" : "0",
      nolegacyrpc: "1"
    }
  };
  fs.writeFileSync(exccwalletCfg(getWalletPath(testnet, walletPath)), ini.stringify(exccwConf));
}
