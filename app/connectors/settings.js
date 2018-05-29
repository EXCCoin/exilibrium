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
  areSettingsDirty: selectors.settingsChanged
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onAttemptChangePassphrase: controlActions.changePassphraseAttempt,
      onChangeTempSettings: settingsActions.updateStateSettingsChanged,
      onSaveSettings: settingsActions.saveSettings
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
