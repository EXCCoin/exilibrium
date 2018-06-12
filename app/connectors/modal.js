import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as controlActions from "../actions/ControlActions";

const mapStateToProps = selectorMap({});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      modalShown: controlActions.modalShown,
      modalHidden: controlActions.modalHidden
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
