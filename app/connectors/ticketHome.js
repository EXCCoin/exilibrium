import { connect } from "react-redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";

const mapStateToProps = selectorMap({
  sentAndReceivedTransactions: selectors.sentAndReceivedTransactions,
  totalValueOfLiveTickets: selectors.totalValueOfLiveTickets,
  earnedStakingReward: selectors.totalSubsidy,
  liveTicketsCount: selectors.liveTicketsCount,
  votedTicketsCount: selectors.votedTicketsCount,
  ticketDataChart: selectors.ticketDataChart
});

export default connect(mapStateToProps);
