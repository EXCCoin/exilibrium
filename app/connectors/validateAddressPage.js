import { connect } from "react-redux";
import * as selectors from "../selectors";
import { validateAddress, validateAddressCleanStore } from "actions/ControlActions";
import { selectorMap } from "fp";

const mapStateToProps = selectorMap({
  validateAddressError: selectors.validateAddressError,
  validateAddressSuccess: selectors.validateAddressSuccess,
  validateAddressRequestAttempt: selectors.validateAddressRequestAttempt
});

export default connect(
  mapStateToProps,
  { validateAddress, validateAddressCleanStore }
);
