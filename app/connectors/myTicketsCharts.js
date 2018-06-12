import { connect } from "react-redux";
import { selectorMap } from "fp";
import { bindActionCreators } from "redux";
import * as selectors from "selectors";
import * as statisticsActions from "actions/StatisticsActions";

const mapStateToProps = selectorMap({
  voteTimeStats: selectors.voteTimeStats,
  getMyTicketsStatsRequest: selectors.getMyTicketsStatsRequest,
  stakeROIStats: selectors.stakeROIStats,
  dailyBalancesStats: selectors.dailyBalancesStats,
  medianVoteTime: selectors.medianVoteTime,
  averageVoteTime: selectors.averageVoteTime,
  ninetyFifthPercentileVoteTime: selectors.ninetyFifthPercentileVoteTime,
  allTickets: selectors.allTickets
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getMyTicketsStats: statisticsActions.getMyTicketsStats
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
