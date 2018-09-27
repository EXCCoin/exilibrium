import {
  GETSTARTUPSTATS_ATTEMPT,
  GETSTARTUPSTATS_SUCCESS,
  GETSTARTUPSTATS_FAILED,
  GETMYTICKETSSTATS_ATTEMPT,
  GETMYTICKETSSTATS_SUCCESS,
  GETMYTICKETSSTATS_FAILED
} from "actions/StatisticsActions";
import { QUIT_WALLET } from "actions/DaemonActions";
export default function statistics(state = {}, action) {
  switch (action.type) {
    case GETSTARTUPSTATS_ATTEMPT:
      return {
        ...state,
        loadingStartupStats: true
      };
    case GETSTARTUPSTATS_SUCCESS:
      return {
        ...state,
        loadingStartupStats: false,
        dailyBalances: action.dailyBalances,
        fullBalances: action.fullBalances
      };
    case GETSTARTUPSTATS_FAILED:
      return {
        ...state,
        loadingStartupStats: false
      };
    case GETMYTICKETSSTATS_ATTEMPT:
      return {
        ...state,
        getMyTicketsStatsRequest: true
      };
    case GETMYTICKETSSTATS_SUCCESS:
      return {
        ...state,
        getMyTicketsStatsRequest: false,
        voteTime: action.voteTime
      };
    case GETMYTICKETSSTATS_FAILED:
      return {
        ...state,
        getMyTicketsStatsRequest: false
      };
    case QUIT_WALLET:
      return {
        ...state,
        loadingStartupStats: false,
        dailyBalances: [],
        fullBalances: []
      };
    default:
      return state;
  }
}
