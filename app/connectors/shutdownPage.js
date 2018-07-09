import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as daemonActions from "../actions/DaemonActions";

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      cleanShutdown: daemonActions.cleanShutdown
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
);
