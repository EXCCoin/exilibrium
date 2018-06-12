import { connect } from "react-redux";
import * as selectors from "../selectors";
import {
  signMessageAttempt,
  validateAddress,
  signMessageCleanStore
} from "../actions/ControlActions";
import { selectorMap } from "../fp";

const mapStateToProps = selectorMap({
  signMessageError: selectors.signMessageError,
  signMessageSuccess: selectors.signMessageSuccess,
  isSigningMessage: selectors.isSigningMessage,
  walletService: selectors.walletService
});

export default connect(
  mapStateToProps,
  {
    signMessageAttempt,
    validateAddress,
    signMessageCleanStore
  }
);
