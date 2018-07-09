import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  requiredWalletRPCVersion: selectors.requiredWalletRPCVersion,
  walletRPCVersion: selectors.walletRPCVersion
});

export default connect(mapStateToProps);
