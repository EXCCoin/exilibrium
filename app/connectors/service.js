import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  walletService: selectors.walletService,
  ticketBuyerService: selectors.ticketBuyerService,
  isMainNet: selectors.isMainNet,
  isTestNet: selectors.isTestNet
});

export default connect(mapStateToProps);
