import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  walletService: selectors.walletService
});

export default connect(mapStateToProps);
