import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as controlActions from "../actions/ControlActions";

const mapStateToProps = selectorMap({
  account: selectors.nextAddressAccount
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getNextAddressAttempt: controlActions.getNextAddressAttempt
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
