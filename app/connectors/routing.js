import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as clientActions from "../actions/ClientActions";

const mapStateToProps = selectorMap({
  location: selectors.location
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      goBackHistory: clientActions.goBackHistory
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
