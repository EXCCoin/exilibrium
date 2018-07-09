import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as snackbarActions from "../actions/SnackbarActions";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  messages: selectors.snackbarMessages
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onDismissAllMessages: snackbarActions.dismissAllMessages
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
