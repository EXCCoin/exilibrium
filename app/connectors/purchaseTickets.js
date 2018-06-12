import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as controlActions from "../actions/ControlActions";

const mapStateToProps = selectorMap({
  ticketPrice: selectors.ticketPrice,
  spendingAccounts: selectors.spendingAccounts,
  rescanRequest: selectors.rescanRequest,
  hasTicketsToRevoke: selectors.hasTicketsToRevoke
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onPurchaseTickets: controlActions.purchaseTicketsAttempt
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
