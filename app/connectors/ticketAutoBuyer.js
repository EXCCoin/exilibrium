import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as controlActions from "../actions/ControlActions";

const mapStateToProps = selectorMap({
  balanceToMaintain: selectors.balanceToMaintain,
  maxFee: selectors.maxFee,
  maxPriceRelative: selectors.maxPriceRelative,
  maxPriceAbsolute: selectors.maxPriceAbsolute,
  maxPerBlock: selectors.maxPerBlock,
  getTicketBuyerConfigResponse: selectors.getTicketBuyerConfigResponse,
  isTicketAutoBuyerEnabled: selectors.isTicketAutoBuyerEnabled,
  currencyDisplay: selectors.currencyDisplay
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      clearStartAutoBuyerSuccess: controlActions.clearStartAutoBuyerSuccess,
      clearStartAutoBuyerError: controlActions.clearStartAutoBuyerError,
      clearStopAutoBuyerSuccess: controlActions.clearStopAutoBuyerSuccess,
      clearStopAutoBuyerError: controlActions.clearStopAutoBuyerError,
      onEnableTicketAutoBuyer: controlActions.startAutoBuyerAttempt,
      onDisableTicketAutoBuyer: controlActions.stopAutoBuyerAttempt,
      onUpdateTicketAutoBuyerConfig: controlActions.setTicketBuyerConfigAttempt
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
