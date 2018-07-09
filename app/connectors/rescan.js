import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as controlActions from "../actions/ControlActions";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  rescanRequest: selectors.rescanRequest,
  rescanStartBlock: selectors.rescanStartBlock,
  rescanEndBlock: selectors.rescanEndBlock,
  rescanCurrentBlock: selectors.rescanCurrentBlock,
  rescanPercentFinished: selectors.rescanPercentFinished
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      rescanAttempt: controlActions.rescanAttempt,
      rescanCancel: controlActions.rescanCancel
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
