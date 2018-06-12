import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  walletReady: selectors.getWalletReady,
  isDaemonRemote: selectors.isDaemonRemote,
  isDaemonStarted: selectors.getDaemonStarted
});

export default connect(mapStateToProps);
