import { connect } from "react-redux";
import * as selectors from "../selectors";
import { selectorMap } from "../fp";

const mapStateToProps = selectorMap({
  isTestNet: selectors.isTestNet,
  totalBalance: selectors.totalBalance,
  ticketPrice: selectors.ticketPrice
});

export default connect(mapStateToProps);
