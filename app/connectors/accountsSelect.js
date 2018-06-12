import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  spendingAccounts: selectors.spendingAccounts,
  visibleAccounts: selectors.visibleAccounts,
  defaultSpendingAccount: selectors.defaultSpendingAccount
});

export default connect(mapStateToProps);
