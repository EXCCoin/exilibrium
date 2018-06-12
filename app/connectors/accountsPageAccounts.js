import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap, or, bool } from "../fp";
import * as selectors from "../selectors";
import * as controlActions from "../actions/ControlActions";
import * as clientActions from "../actions/ClientActions";

const mapStateToProps = selectorMap({
  accounts: selectors.sortedAccounts,
  hiddenAccounts: selectors.hiddenAccounts,
  isLoading: bool(or(selectors.getNextAccountRequestAttempt, selectors.renameAccountRequestAttempt))
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onRenameAccount: controlActions.renameAccountAttempt,
      onHideAccount: clientActions.hideAccount,
      onShowAccount: clientActions.showAccount,
      onGetNextAccountAttempt: controlActions.getNextAccountAttempt
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
