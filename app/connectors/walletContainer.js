import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  expandSideBar: selectors.expandSideBar
});

export default connect(mapStateToProps);
