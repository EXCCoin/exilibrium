import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  txURLBuilder: selectors.txURLBuilder
});

export default connect(mapStateToProps);
