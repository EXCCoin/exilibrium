import { connect } from "react-redux";
import * as selectors from "../selectors";
import {
  verifyMessageAttempt,
  verifyMessageCleanStore,
  validateAddress
} from "../actions/ControlActions";
import { getMessageVerificationServiceAttempt } from "../actions/ClientActions";
import { selectorMap } from "../fp";

const mapStateToProps = selectorMap({
  messageVerificationService: selectors.messageVerificationService,
  verifyMessageError: selectors.verifyMessageError,
  verifyMessageSuccess: selectors.verifyMessageSuccess,
  isVerifyingMessage: selectors.isVerifyingMessage
});

export default connect(
  mapStateToProps,
  {
    verifyMessageAttempt,
    verifyMessageCleanStore,
    validateAddress,
    getMessageVerificationServiceAttempt
  }
);
