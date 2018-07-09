import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";
import * as controlActions from "actions/ControlActions";
import * as clientActions from "actions/ClientActions";

const mapStateToProps = selectorMap({
  getTransactionsRequestAttempt: selectors.getTransactionsRequestAttempt,
  getTicketsRequestAttempt: selectors.getTicketsRequestAttempt,
  getAccountsResponse: selectors.getAccountsResponse,
  spendableTotalBalance: selectors.spendableTotalBalance,
  transactions: selectors.homeHistoryTransactions,
  tickets: selectors.homeHistoryTickets,
  revokeTicketsError: selectors.revokeTicketsError,
  revokeTicketsSuccess: selectors.revokeTicketsSuccess,
  hasTicketsToRevoke: selectors.hasTicketsToRevoke,
  totalBalance: selectors.totalBalance
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onRevokeTickets: controlActions.revokeTicketsAttempt,
      onClearRevokeTicketsError: controlActions.clearRevokeTicketsError,
      onClearRevokeTicketsSuccess: controlActions.clearRevokeTicketsSuccess,
      goToMyTickets: clientActions.goToMyTickets,
      goToTransactionHistory: clientActions.goToTransactionHistory
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
