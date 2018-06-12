import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as clientActions from "../actions/ClientActions";

const mapStateToProps = selectorMap({
  ticketsPerStatus: selectors.ticketsPerStatus,
  allTickets: selectors.allTickets
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      showTicketList: clientActions.showTicketList
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
