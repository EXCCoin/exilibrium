import { getWalletCfg, getGlobalCfg } from "config";
import { isTestNet } from "selectors";
import { ipcRenderer } from "electron";

export const SETTINGS_SAVE = "SETTINGS_SAVE";
export const SETTINGS_CHANGED = "SETTINGS_CHANGED";
export const SETTINGS_UNCHANGED = "SETTINGS_UNCHANGED";
export const TOGGLE_MINING = "TOGGLE_MINING";
export const SYSTEM_INFO_REQUEST_SUCCESS = "SYSTEM_INFO_REQUEST_SUCCESS";

export const saveSettings = settings => (dispatch, getState) => {
  const {
    daemon: { walletName }
  } = getState();

  const config = getGlobalCfg();
  config.set("locale", settings.locale);
  config.set("daemon_start_advanced", settings.daemonStartAdvanced);

  const walletConfig = getWalletCfg(isTestNet(getState()), walletName);
  walletConfig.set("currency_display", settings.currencyDisplay);
  walletConfig.set("gaplimit", settings.gapLimit);

  dispatch({ settings, type: SETTINGS_SAVE });
};

export function updateStateSettingsChanged(settings) {
  return (dispatch, getState) => {
    const { tempSettings, currentSettings } = getState().settings;
    const newSettings = { ...tempSettings, ...settings };
    const settingsFields = Object.keys(tempSettings);
    const newDiffersFromTemp = settingsFields.reduce(
      (d, f) => d || newSettings[f] !== tempSettings[f],
      false
    );

    if (newDiffersFromTemp) {
      const newDiffersFromCurrent = settingsFields.reduce(
        (d, f) => d || newSettings[f] !== currentSettings[f],
        false
      );
      if (newDiffersFromCurrent) {
        dispatch({ tempSettings: newSettings, type: SETTINGS_CHANGED });
      } else {
        dispatch({ tempSettings: currentSettings, type: SETTINGS_UNCHANGED });
      }
    }
  };
}

export const updateStateVoteSettingsChanged = settings => (dispatch, getState) => {
  const {
    settings: { tempSettings, currentSettings }
  } = getState();
  const {
    daemon: { walletName }
  } = getState();
  if (settings.enableTicketBuyer !== tempSettings.enableTicketBuyer) {
    const config = getWalletCfg(isTestNet(getState()), walletName);
    config.set("enableticketbuyer", settings.enableTicketBuyer);
    dispatch({ tempSettings: settings, type: SETTINGS_CHANGED });
  } else {
    dispatch({ tempSettings: currentSettings, type: SETTINGS_UNCHANGED });
  }
};

export const toggleMining = (enable, cores, address) => (dispatch, getState) => {
  const {
    daemon: { credentials }
  } = getState();
  ipcRenderer.sendSync("toggle-mining", credentials, {
    enable,
    CPUCores: cores,
    miningAddresses: [address]
  });
  dispatch({ miningParams: { cores, address }, miningToggle: enable, type: TOGGLE_MINING });
};

export const checkSystemInfo = () => dispatch => {
  const systemInfo = ipcRenderer.sendSync("get-system-information");
  dispatch({ type: SYSTEM_INFO_REQUEST_SUCCESS, systemInfo });
};
