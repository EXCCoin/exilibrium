import fs from "fs-extra";
import parseArgs from "minimist";
import { app, BrowserWindow, Menu, shell, dialog, globalShortcut } from "electron";
import { initGlobalCfg, validateGlobalCfgFile, setMustOpenForm } from "./config";
import { appLocaleFromElectronLocale, default as locales } from "./i18n/locales";
import { logger, GetExccdLogs, GetExccwalletLogs } from "./main_dev/logging";
import {
  OPTIONS,
  USAGE_MESSAGE,
  VERSION_MESSAGE,
  BOTH_CONNECTION_ERR_MESSAGE
} from "./main_dev/constants";
import {
  getWalletsDirectoryPath,
  getWalletsDirectoryPathNetwork,
  appDataDirectory,
  getGlobalCfgPath,
  getDirectoryLogs,
  checkAndInitWalletCfg,
  getExccdPath,
  getExccwalletPath
} from "./main_dev/paths";
import {
  readExesVersion,
  cleanShutdown,
  closeEXCCD,
  GetExccdPID,
  GetExccwPID
} from "./main_dev/launch";
import {
  getAvailableWallets,
  startDaemon,
  createWallet,
  removeWallet,
  stopWallet,
  startWallet,
  checkDaemon,
  toggleMining,
  getSystemInfo,
  deleteDaemon
} from "./main_dev/ipc";

// setPath as exilibrium
app.setPath("userData", appDataDirectory());

const argv = parseArgs(process.argv.slice(1), OPTIONS);

// Verify that config.json is valid JSON before fetching it, because
// it will silently fail when fetching.
const err = validateGlobalCfgFile();
if (err !== null) {
  const errMessage = `There was an error while trying to load the config file, the format is invalid.\n\nFile: ${getGlobalCfgPath()} \nError: ${err}`;
  dialog.showErrorBox("Config File Error", errMessage);
  app.quit();
}

let menu;
let template;
let mainWindow = null;
let versionWin = null;
let grpcVersions = { requiredVersion: null, walletVersion: null };
let previousWallet = null;
let primaryInstance = false;

const globalCfg = initGlobalCfg();
const daemonIsAdvanced = globalCfg.get("daemon_start_advanced");
const walletsDirectory = getWalletsDirectoryPath();
const mainnetWalletsPath = getWalletsDirectoryPathNetwork(false);
const testnetWalletsPath = getWalletsDirectoryPathNetwork(true);

if (argv.help) {
  console.log(USAGE_MESSAGE);
  app.exit(0);
}

if (argv.version) {
  console.log(VERSION_MESSAGE);
  app.exit(0);
}

// Check if network was set on command line (but only allow one!).
if (argv.testnet && argv.mainnet) {
  logger.log(BOTH_CONNECTION_ERR_MESSAGE);
  app.quit();
}

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === "development") {
  const path = require("path");
  const p = path.join(__dirname, "..", "app", "node_modules");
  require("module").globalPaths.push(p);
}

// Check that wallets directory has been created, if not, make it.
if (!fs.pathExistsSync(walletsDirectory)) {
  fs.mkdirsSync(walletsDirectory);
}
if (!fs.pathExistsSync(mainnetWalletsPath)) {
  fs.mkdirsSync(mainnetWalletsPath);
}
if (!fs.pathExistsSync(testnetWalletsPath)) {
  fs.mkdirsSync(testnetWalletsPath);
}

checkAndInitWalletCfg(true);
checkAndInitWalletCfg(false);

logger.info(`Using config/data from: ${app.getPath("userData")}`);
logger.info(
  `Versions: Exilibrium: ${app.getVersion()}, Electron: ${process.versions.electron}, Chrome: ${
    process.versions.chrome
  }`
);

process.on("uncaughtException", err => {
  logger.error("UNCAUGHT EXCEPTION", err);
  throw err;
});

const installExtensions = async () => {
  if (process.env.NODE_ENV === "development") {
    const installer = require("electron-devtools-installer");

    const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
    const forceDownload = Boolean(process.env.UPGRADE_EXTENSIONS);
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {
        logger.error(`Cannot install extensions: ${e}`);
      }
    }
  }
};

const { ipcMain } = require("electron");

let reactIPC;

ipcMain.on("delete-daemon", (event, appData, testnet) => {
  event.returnValue = deleteDaemon(appData, testnet);
});

ipcMain.on("close-daemon", async event => {
  event.returnValue = await closeEXCCD();
});

ipcMain.on("register-for-errors", event => {
  reactIPC = event.sender;
  event.returnValue = true;
});

ipcMain.on("get-available-wallets", (event, network) => {
  event.returnValue = getAvailableWallets(network);
});

ipcMain.on("start-daemon", (event, appData, testnet) => {
  event.returnValue = startDaemon(
    mainWindow,
    daemonIsAdvanced,
    primaryInstance,
    appData,
    testnet,
    reactIPC
  );
});

ipcMain.on("create-wallet", (event, walletPath, testnet) => {
  event.returnValue = createWallet(testnet, walletPath);
});

ipcMain.on("remove-wallet", (event, walletPath, testnet) => {
  event.returnValue = removeWallet(testnet, walletPath);
});

ipcMain.on("stop-wallet", event => {
  previousWallet = null;
  event.returnValue = stopWallet();
});

ipcMain.on("start-wallet", (event, walletPath, testnet) => {
  event.returnValue = startWallet(mainWindow, daemonIsAdvanced, testnet, walletPath, reactIPC);
});

ipcMain.on("check-daemon", (event, rpcCreds, testnet) => {
  checkDaemon(mainWindow, rpcCreds, testnet);
});

ipcMain.on("toggle-mining", (event, rpcCreds, miningOptions) => {
  toggleMining(rpcCreds, miningOptions);
  event.returnValue = true;
});

ipcMain.on("get-system-information", async event => {
  event.returnValue = await getSystemInfo();
});

ipcMain.on("clean-shutdown", async event => {
  const stopped = await cleanShutdown(mainWindow, app, GetExccdPID(), GetExccwPID());
  event.sender.send("clean-shutdown-finished", stopped);
});

ipcMain.on("app-reload-ui", () => {
  mainWindow.reload();
});

ipcMain.on("grpc-versions-determined", (event, versions) => {
  grpcVersions = { ...grpcVersions, ...versions };
});

ipcMain.on("main-log", (event, level, args) => {
  logger[level](...args);
});

ipcMain.on("get-exccd-logs", event => {
  event.returnValue = GetExccdLogs();
});

ipcMain.on("get-exccwallet-logs", event => {
  event.returnValue = GetExccwalletLogs();
});

ipcMain.on("get-exilibrium-logs", event => {
  event.returnValue = "exilibrium logs!";
});

ipcMain.on("get-previous-wallet", event => {
  event.returnValue = previousWallet;
});

ipcMain.on("set-previous-wallet", (event, cfg) => {
  previousWallet = cfg;
  event.returnValue = true;
});

primaryInstance = app.requestSingleInstanceLock();
const stopSecondInstance = !primaryInstance && !daemonIsAdvanced;
if (stopSecondInstance) {
  logger.error("Preventing second instance from running.");
}

app.on("ready", async () => {
  // when installing (on first run) locale will be empty. Determine the user's
  // OS locale and set that as exilibrium's locale.
  const cfgLocale = globalCfg.get("locale", "");
  let locale = locales.find(value => value.key === cfgLocale);
  if (!locale) {
    const newCfgLocale = appLocaleFromElectronLocale(app.getLocale());
    logger.error(`Locale ${cfgLocale} not found. Switching to locale ${newCfgLocale}.`);
    globalCfg.set("locale", newCfgLocale);
    locale = locales.find(value => value.key === newCfgLocale);
  }

  let windowOpts = {
    show: false,
    width: 1185,
    height: 795,
    page: "app.html",
    webPreferences: {
      webSecurity: false
    }
  };
  if (stopSecondInstance) {
    windowOpts = {
      show: true,
      width: 575,
      height: 275,
      autoHideMenuBar: true,
      resizable: false,
      page: "staticPages/secondInstance.html"
    };
  } else {
    await installExtensions();
  }
  windowOpts.title = `Exilibrium - ${app.getVersion()}`;

  mainWindow = new BrowserWindow(windowOpts);
  mainWindow.loadURL(`file://${__dirname}/${windowOpts.page}`);

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.show();
    mainWindow.focus();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (versionWin !== null) {
      versionWin.close();
    }
    if (stopSecondInstance) {
      app.quit();
      setTimeout(() => {
        app.quit();
      }, 2000);
    }
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.openDevTools();
  }
  if (stopSecondInstance) {
    return;
  }

  mainWindow.webContents.on("context-menu", (e, props) => {
    const { selectionText, isEditable, x, y } = props;
    const inputMenu = [
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { type: "separator" },
      { role: "selectall" }
    ];
    const selectionMenu = [{ role: "copy" }, { type: "separator" }, { role: "selectall" }];
    if (process.env.NODE_ENV === "development") {
      const inspectElement = {
        label: "Inspect element",
        click: () => mainWindow.inspectElement(x, y)
      };
      inputMenu.push(inspectElement);
      selectionMenu.push(inspectElement);
    }
    if (isEditable) {
      Menu.buildFromTemplate(inputMenu).popup(mainWindow);
    } else if (selectionText && selectionText.trim() !== "") {
      Menu.buildFromTemplate(selectionMenu).popup(mainWindow);
    } else if (process.env.NODE_ENV === "development") {
      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => mainWindow.inspectElement(x, y)
        }
      ]).popup(mainWindow);
    }
  });
  let isToolbarVisible = globalCfg.get("toolbar_visible");
  if (process.platform === "darwin") {
    template = [
      {
        label: locale.messages["appMenu.exilibrium"],
        submenu: [
          {
            label: locale.messages["appMenu.aboutExilibrium"],
            selector: "orderFrontStandardAboutPanel:"
          },
          {
            type: "separator"
          },
          {
            label: locale.messages["appMenu.services"],
            submenu: []
          },
          {
            type: "separator"
          },
          {
            label: locale.messages["appMenu.hideExilibrium"],
            accelerator: "Command+H",
            selector: "hide:"
          },
          {
            label: locale.messages["appMenu.hideOthers"],
            accelerator: "Command+Shift+H",
            selector: "hideOtherApplications:"
          },
          {
            label: locale.messages["appMenu.showAll"],
            selector: "unhideAllApplications:"
          },
          {
            type: "separator"
          },
          {
            label: locale.messages["appMenu.quit"],
            accelerator: "Command+Q",
            click() {
              cleanShutdown(mainWindow, app, GetExccdPID(), GetExccwPID());
            }
          }
        ]
      },
      {
        label: locale.messages["appMenu.edit"],
        submenu: [
          {
            label: locale.messages["appMenu.undo"],
            accelerator: "Command+Z",
            selector: "undo:"
          },
          {
            label: locale.messages["appMenu.redo"],
            accelerator: "Shift+Command+Z",
            selector: "redo:"
          },
          {
            type: "separator"
          },
          {
            label: locale.messages["appMenu.cut"],
            accelerator: "Command+X",
            selector: "cut:"
          },
          {
            label: locale.messages["appMenu.copy"],
            accelerator: "Command+C",
            selector: "copy:"
          },
          {
            label: locale.messages["appMenu.paste"],
            accelerator: "Command+V",
            selector: "paste:"
          },
          {
            label: locale.messages["appMenu.selectAll"],
            accelerator: "Command+A",
            selector: "selectAll:"
          }
        ]
      },
      {
        label: locale.messages["appMenu.view"],
        submenu: [
          {
            label: "Toggle Full Screen",
            accelerator: "Ctrl+Command+F",
            click() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        ]
      },
      {
        label: locale.messages["appMenu.window"],
        submenu: [
          {
            label: locale.messages["appMenu.minimize"],
            accelerator: "Command+M",
            selector: "performMiniaturize:"
          },
          {
            label: locale.messages["appMenu.close"],
            accelerator: "Command+W",
            selector: "performClose:"
          },
          {
            type: "separator"
          },
          {
            label: locale.messages["appMenu.bringAllFront"],
            selector: "arrangeInFront:"
          }
        ]
      }
    ];
  } else {
    template = [
      {
        label: locale.messages["appMenu.file"],
        submenu: [
          {
            label: "&Close",
            accelerator: "Ctrl+W",
            click() {
              mainWindow.close();
            }
          }
        ]
      },
      {
        label: locale.messages["appMenu.view"],
        submenu: [
          {
            label: locale.messages["appMenu.toggleFullScreen"],
            accelerator: "F11",
            click() {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
          {
            label: locale.messages["appMenu.appToolbar"],
            accelerator: "CommandOrControl+Shift+g",
            click() {
              Menu.setApplicationMenu(null);
              isToolbarVisible = false;
              globalCfg.set("toolbar_visible", false);
            }
          }
        ]
      }
    ];
  }
  template.push(
    {
      label: locale.messages["appMenu.advanced"],
      submenu: [
        {
          label: locale.messages["appMenu.developerTools"],
          accelerator: "Alt+Ctrl+I",
          click() {
            mainWindow.toggleDevTools();
          }
        },
        {
          label: locale.messages["appMenu.showWalletLog"],
          click() {
            shell.openItem(getDirectoryLogs(getExccwalletPath()));
          }
        },
        {
          label: locale.messages["appMenu.showDaemonLog"],
          click() {
            shell.openItem(getDirectoryLogs(getExccdPath()));
          }
        }
      ]
    },
    {
      label: locale.messages["appMenu.help"],
      submenu: [
        {
          label: locale.messages["appMenu.learnMore"],
          click() {
            shell.openExternal("https://excc.co");
          }
        },
        {
          label: locale.messages["appMenu.documentation"],
          click() {
            shell.openExternal("https://github.com/EXCCoin/exilibrium");
          }
        },
        {
          label: locale.messages["appMenu.communityDiscussions"],
          click() {
            shell.openExternal("https://discordapp.com/invite/pZe2EcH");
          }
        },
        {
          label: locale.messages["appMenu.searchIssues"],
          click() {
            shell.openExternal("https://github.com/EXCCoin/exilibrium/issues");
          }
        },
        {
          label: locale.messages["appMenu.about"],
          click() {
            if (!versionWin) {
              versionWin = new BrowserWindow({
                width: 575,
                height: 325,
                show: false,
                autoHideMenuBar: true,
                resizable: false
              });
              versionWin.on("closed", () => {
                versionWin = null;
              });

              // Load a remote URL
              versionWin.loadURL(`file://${__dirname}/staticPages/version.html`);

              versionWin.once("ready-to-show", () => {
                versionWin.webContents.send("exes-versions", readExesVersion(app, grpcVersions));
                versionWin.show();
              });
            }
          }
        }
      ]
    }
  );
  menu = Menu.buildFromTemplate(template);
  if (isToolbarVisible) {
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }

  globalShortcut.register("CommandOrControl+Shift+G", () => {
    if (isToolbarVisible) {
      Menu.setApplicationMenu(null);
      isToolbarVisible = false;
      globalCfg.set("toolbar_visible", false);
    } else {
      Menu.setApplicationMenu(menu);
      isToolbarVisible = true;
      globalCfg.set("toolbar_visible", true);
    }
  });
});

app.on("before-quit", event => {
  logger.info("Caught before-quit. Set exilibrium as was closed");
  event.preventDefault();
  cleanShutdown(mainWindow, app, GetExccdPID(), GetExccwPID());
  setMustOpenForm(true);
  app.exit(0);
});
