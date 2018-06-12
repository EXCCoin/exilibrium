import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as controlActions from "../actions/ControlActions";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  nextAddress: selectors.nextAddress,
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
