import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import { stopWallet } from "../actions/DaemonActions";

const mapStateToProps = selectorMap({
  expandSideBar: selectors.expandSideBar,
  walletName: selectors.getWalletName,
  hasUnresolvedRequests: selectors.hasUnresolvedRequests
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      stopWallet
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
