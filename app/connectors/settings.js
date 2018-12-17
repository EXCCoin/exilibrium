import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as settingsActions from "../actions/SettingsActions";
import * as controlActions from "../actions/ControlActions";
import { deleteDaemonData } from "../actions/DaemonActions";

const mapStateToProps = selectorMap({
  currencies: selectors.currencies,
  networks: selectors.networks,
  locales: selectors.sortedLocales,
  tempSettings: selectors.tempSettings,
  areSettingsDirty: selectors.settingsChanged,
  nextAddress: selectors.nextAddress,
  miningEnabled: selectors.miningToggle,
  systemInfo: selectors.systemInfo,
  miningParams: selectors.miningParams,
  getWalletReady: selectors.getWalletReady
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      deleteDaemonData,
      onAttemptChangePassphrase: controlActions.changePassphraseAttempt,
      onChangeTempSettings: settingsActions.updateStateSettingsChanged,
      onSaveSettings: settingsActions.saveSettings,
      toggleMining: settingsActions.toggleMining,
      checkSystemInfo: settingsActions.checkSystemInfo
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
