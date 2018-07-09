import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  modalVisible: selectors.modalVisible
});

export default connect(mapStateToProps);
