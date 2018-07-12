import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as settingsActions from "../actions/SettingsActions";
import * as controlActions from "../actions/ControlActions";

const mapStateToProps = selectorMap({
  currencies: selectors.currencies,
  networks: selectors.networks,
  locales: selectors.sortedLocales,
  tempSettings: selectors.tempSettings,
  areSettingsDirty: selectors.settingsChanged,
  nextAddress: selectors.nextAddress
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onAttemptChangePassphrase: controlActions.changePassphraseAttempt,
      onChangeTempSettings: settingsActions.updateStateSettingsChanged,
      onSaveSettings: settingsActions.saveSettings,
      toggleMining: settingsActions.toggleMining
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
