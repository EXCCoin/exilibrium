import { connect } from "react-redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";

const mapStateToProps = selectorMap({
  balanceSent: selectors.balanceSent,
  balanceReceived: selectors.balanceReceived,
  sentAndReceivedTransactions: selectors.sentAndReceivedTransactions
});

export default connect(mapStateToProps);
