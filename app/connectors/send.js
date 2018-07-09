import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as controlActions from "../actions/ControlActions";

const mapStateToProps = selectorMap({
  defaultSpendingAccount: selectors.defaultSpendingAccount,
  estimatedSignedSize: selectors.estimatedSignedSize,
  unsignedTransaction: selectors.unsignedTransaction,
  estimatedFee: selectors.estimatedFee,
  totalSpent: selectors.totalSpent,
  publishedTransactionHash: selectors.publishedTransactionHash,
  isSendingTransaction: selectors.isSendingTransaction,
  isConstructingTransaction: selectors.isConstructingTransaction,
  nextAddress: selectors.nextAddress,
  nextAddressAccount: selectors.nextAddressAccount,
  unitDivisor: selectors.unitDivisor,
  hasUnminedTransactions: selectors.hasUnminedTransactions
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onAttemptConstructTransaction: controlActions.constructTransactionAttempt,
      onAttemptSignTransaction: controlActions.signTransactionAttempt,
      onClearTransaction: controlActions.clearTransaction,
      getNextAddressAttempt: controlActions.getNextAddressAttempt,
      validateAddress: controlActions.validateAddress,
      publishUnminedTransactions: controlActions.publishUnminedTransactionsAttempt
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
