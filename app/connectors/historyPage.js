import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as clientActions from "../actions/ClientActions";

const mapStateToProps = selectorMap({
  walletService: selectors.walletService,
  totalBalance: selectors.totalBalance,
  transactions: selectors.transactions,
  transactionsFilter: selectors.transactionsFilter,
  noMoreTransactions: selectors.noMoreTransactions,
  window: selectors.mainWindow
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getTransactions: clientActions.getTransactions,
      changeTransactionsFilter: clientActions.changeTransactionsFilter
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
