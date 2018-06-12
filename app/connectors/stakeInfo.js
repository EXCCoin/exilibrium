import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  ticketPoolSize: selectors.ticketPoolSize,
  votedTicketsCount: selectors.votedTicketsCount,
  allMempoolTicketsCount: selectors.allMempoolTicketsCount,
  missedTicketsCount: selectors.missedTicketsCount,
  ownMempoolTicketsCount: selectors.ownMempoolTicketsCount,
  revokedTicketsCount: selectors.revokedTicketsCount,
  immatureTicketsCount: selectors.immatureTicketsCount,
  expiredTicketsCount: selectors.expiredTicketsCount,
  liveTicketsCount: selectors.liveTicketsCount,
  totalSubsidy: selectors.totalSubsidy
});

export default connect(mapStateToProps);
