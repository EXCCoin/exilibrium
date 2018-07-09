import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as decodeMessageActions from "../actions/DecodeMessageActions";

const mapStateToProps = selectorMap({
  walletService: selectors.walletService,
  viewedTransaction: selectors.viewedTransaction,
  viewedDecodedTransaction: selectors.viewedDecodedTransaction
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      decodeRawTransactions: decodeMessageActions.decodeRawTransactions
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
