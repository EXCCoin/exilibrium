import {
  SETTINGS_SAVE,
  SETTINGS_CHANGED,
  SETTINGS_UNCHANGED,
  TOGGLE_MINING,
  SYSTEM_INFO_REQUEST_SUCCESS
} from "../actions/SettingsActions";
import { WALLET_SETTINGS, SELECT_LANGUAGE, QUIT_WALLET } from "actions/DaemonActions";
import { getGlobalCfg } from "config";

export default function settings(state = {}, action) {
  switch (action.type) {
    case SELECT_LANGUAGE:
      return {
        ...state,
        currentSettings: {
          ...state.currentSettings,
          locale: action.language
        },
        tempSettings: {
          ...state.currentSettings,
          locale: action.language
        }
      };
    case SETTINGS_SAVE:
      return {
        ...state,
        currentSettings: action.settings,
        tempSettings: action.settings,
        settingsChanged: false
      };
    case SETTINGS_CHANGED:
      return {
        ...state,
        tempSettings: action.tempSettings,
        settingsChanged: true
      };
    case SETTINGS_UNCHANGED:
      return {
        ...state,
        tempSettings: action.tempSettings,
        settingsChanged: false
      };
    case WALLET_SETTINGS:
      return {
        ...state,
        currentSettings: {
          ...state.currentSettings,
          currencyDisplay: action.currencyDisplay,
          gapLimit: action.gapLimit
        },
        tempSettings: {
          ...state.tempSettings,
          currencyDisplay: action.currencyDisplay,
          gapLimit: action.gapLimit
        }
      };
    case QUIT_WALLET:
      const globalCfg = getGlobalCfg(); // eslint-disable-line no-case-declarations
      return {
        currentSettings: {
          locale: globalCfg.get("locale"),
          daemonStartAdvanced: globalCfg.get("daemon_start_advanced")
        },
        tempSettings: {
          locale: globalCfg.get("locale"),
          daemonStartAdvanced: globalCfg.get("daemon_start_advanced")
        },
        settingsChanged: false
      };
    case TOGGLE_MINING:
      return {
        ...state,
        miningEnabled: action.miningToggle,
        miningParams: action.miningParams
      };
    case SYSTEM_INFO_REQUEST_SUCCESS:
      return {
        ...state,
        systemInfo: action.systemInfo
      };
    default:
      return state;
  }
}
