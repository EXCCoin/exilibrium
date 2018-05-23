import { SETTINGS_SAVE, SETTINGS_CHANGED, SETTINGS_UNCHANGED } from "../actions/SettingsActions";
import { WALLET_SETTINGS, SELECT_LANGUAGE } from "actions/DaemonActions";
export default function settings(state = {}, action) {
  switch (action.type) {
    case SELECT_LANGUAGE: // eslint-disable-line no-case-declarations
      const { currentSettings } = state;
      currentSettings.locale = action.language;
      return {
        ...state,
        currentSettings,
        tempSettings: currentSettings
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
    case WALLET_SETTINGS: // eslint-disable-line no-case-declarations
      const { currentSettings: settings, tempSettings } = state;
      settings.currencyDisplay = action.currencyDisplay;
      tempSettings.currencyDisplay = action.currencyDisplay;
      settings.gapLimit = action.gapLimit;
      tempSettings.gapLimit = action.gapLimit;
      return {
        ...state,
        currentSettings: settings,
        tempSettings
      };
    default:
      return state;
  }
}
