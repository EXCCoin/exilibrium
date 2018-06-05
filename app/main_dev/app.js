import fs from "fs-extra";
import path from "path";
import { app, BrowserWindow, Menu, shell } from "electron";
import { appLocaleFromElectronLocale, default as locales } from "../i18n/locales";

import * as paths from "./paths";

export async function ready(state, cleanShutdown, stopSecondInstance) {
  // when installing (on first run) locale will be empty. Determine the user's
  // OS locale and set that as exilibrium's locale.
  const cfgLocale = state.globalCfg.get("locale", "");
  let locale = locales.find(value => value.key === cfgLocale);
  if (!locale) {
    const newCfgLocale = appLocaleFromElectronLocale(app.getLocale());
    state.logger.log(
      "error",
      `Locale ${cfgLocale} not found. Switching to locale ${newCfgLocale}.`
    );
    state.globalCfg.set("locale", newCfgLocale);
    locale = locales.find(value => value.key === newCfgLocale);
  }

  let windowOpts = { show: false, width: 1178, height: 790, page: "app.html" };
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

  state.mainWindow = new BrowserWindow(windowOpts);
  if (process.env.NODE_ENV === "development") {
    state.mainWindow.loadURL(`file://${path.resolve(__dirname, "..")}/${windowOpts.page}`);
  } else {
    state.mainWindow.loadURL(`file://${__dirname}/${windowOpts.page}`);
  }

  state.mainWindow.webContents.on("did-finish-load", () => {
    state.mainWindow.show();
    state.mainWindow.focus();
  });
  state.mainWindow.on("closed", () => {
    state.mainWindow = null;
    if (state.versionWin !== null) {
      state.versionWin.close();
    }
    if (stopSecondInstance) {
      app.quit();
      setTimeout(() => {
        app.quit();
      }, 2000);
    }
  });

  if (process.env.NODE_ENV === "development") {
    state.mainWindow.openDevTools();
  }
  if (stopSecondInstance) {
    return;
  }

  state.mainWindow.webContents.on("context-menu", (e, props) => {
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
        click: () => state.mainWindow.inspectElement(x, y)
      };
      inputMenu.push(inspectElement);
      selectionMenu.push(inspectElement);
    }
    if (isEditable) {
      Menu.buildFromTemplate(inputMenu).popup(state.mainWindow);
    } else if (selectionText && selectionText.trim() !== "") {
      Menu.buildFromTemplate(selectionMenu).popup(state.mainWindow);
    } else if (process.env.NODE_ENV === "development") {
      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => state.mainWindow.inspectElement(x, y)
        }
      ]).popup(state.mainWindow);
    }
  });

  if (process.platform === "darwin") {
    state.template = [
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
              cleanShutdown();
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
              state.mainWindow.setFullScreen(!state.mainWindow.isFullScreen());
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
    state.template = [
      {
        label: locale.messages["appMenu.file"],
        submenu: [
          {
            label: "&Close",
            accelerator: "Ctrl+W",
            click() {
              state.mainWindow.close();
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
              state.mainWindow.setFullScreen(!state.mainWindow.isFullScreen());
            }
          },
          {
            label: locale.messages["appMenu.reloadUI"],
            accelerator: "F5",
            click() {
              state.mainWindow.webContents.send("app-reload-requested", state.mainWindow);
            }
          }
        ]
      }
    ];
  }
  state.template.push(
    {
      label: locale.messages["appMenu.advanced"],
      submenu: [
        {
          label: locale.messages["appMenu.developerTools"],
          accelerator: "Alt+Ctrl+I",
          click() {
            state.mainWindow.toggleDevTools();
          }
        },
        {
          label: locale.messages["appMenu.showWalletLog"],
          click() {
            shell.openItem(paths.getDirectoryLogs(paths.appDataDirectory()));
          }
        },
        {
          label: locale.messages["appMenu.showDaemonLog"],
          click() {
            shell.openItem(paths.getDirectoryLogs(paths.getExccdPath()));
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
            shell.openExternal("https://forum.excc.co");
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
            if (!state.versionWin) {
              state.versionWin = new BrowserWindow({
                width: 575,
                height: 275,
                show: false,
                autoHideMenuBar: true,
                resizable: false
              });
              state.versionWin.on("closed", () => {
                state.versionWin = null;
              });

              // Load a remote URL
              state.versionWin.loadURL(`file://${__dirname}/staticPages/version.html`);

              state.versionWin.once("ready-to-show", () => {
                state.versionWin.webContents.send("exes-versions", readExesVersion());
                state.versionWin.show();
              });
            }
          }
        }
      ]
    }
  );
  state.menu = Menu.buildFromTemplate(state.template);
  Menu.setApplicationMenu(state.menu);
}

async function installExtensions() {
  if (process.env.NODE_ENV === "development") {
    const installer = require("electron-devtools-installer"); // eslint-disable-line global-require

    const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
}

function readExesVersion(state) {
  const spawn = require("child_process").spawnSync;
  const args = ["--version"];
  const exes = ["exccd", "exccwallet", "exccctl"];
  const versions = {
    grpc: state.grpcVersions,
    exilibrium: app.getVersion()
  };

  for (const exe of exes) {
    const exePath = paths.getExecutablePath("exccd", state.argv.customBinPath);
    if (!fs.existsSync(exePath)) {
      state.logger.log("error", "The exccd file does not exists");
    }

    const proc = spawn(exePath, args, { encoding: "utf8" });
    if (proc.error) {
      state.logger.log("error", `Error trying to read version of ${exe}: ${proc.error}`);
      continue;
    }

    const versionLine = proc.stdout.toString();
    if (!versionLine) {
      state.logger.log("error", `Empty version line when reading version of ${exe}`);
      continue;
    }

    const decodedLine = versionLine.match(/\w+ version ([^\s]+)/);
    if (decodedLine !== null) {
      versions[exe] = decodedLine[1]; // eslint-disable-line
    } else {
      state.logger.log("error", `Unable to decode version line ${versionLine}`);
    }
  }

  return versions;
}
