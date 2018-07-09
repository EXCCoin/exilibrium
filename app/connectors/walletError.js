import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  getNetworkError: selectors.getNetworkError
});

export default connect(mapStateToProps);
