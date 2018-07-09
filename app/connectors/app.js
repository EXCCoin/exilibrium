import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as daemonActions from "actions/DaemonActions";
import * as clientActions from "actions/ClientActions";

const mapStateToProps = selectorMap({
  locale: selectors.locale,
  window: selectors.mainWindow,
  daemonStopped: selectors.daemonStopped,
  shutdownRequested: selectors.shutdownRequested
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      shutdownApp: daemonActions.shutdownApp,
      listenForAppReloadRequest: clientActions.listenForAppReloadRequest
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
