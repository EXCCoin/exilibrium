import {
  TRANSACTIONNTFNS_START,
  TRANSACTIONNTFNS_FAILED,
  TRANSACTIONNTFNS_END,
  ACCOUNTNTFNS_START,
  ACCOUNTNTFNS_DATA,
  ACCOUNTNTFNS_END,
  CLEARUNMINEDMESSAGE
} from "../actions/NotificationActions";
import { QUIT_WALLET } from "actions/DaemonActions";

export default function notifications(state = {}, action) {
  switch (action.type) {
    case TRANSACTIONNTFNS_START:
      return {
        ...state,
        transactionNtfns: action.transactionNtfns,
        transactionNtfnsError: null
      };
    case TRANSACTIONNTFNS_FAILED:
      return {
        ...state,
        transactionNtfns: null,
        transactionNtfnsError: action.error
      };
    case TRANSACTIONNTFNS_END:
      return {
        ...state,
        transactionNtfns: null,
        transactionNtfnsError: null
      };
    case ACCOUNTNTFNS_START:
      return {
        ...state,
        accountNtfns: action.accountNtfns
      };
    case ACCOUNTNTFNS_DATA:
      return {
        ...state,
        accountNtfnsResponse: action.response
      };
    case ACCOUNTNTFNS_END:
      return {
        ...state,
        accountNtfns: action.null
      };
    case CLEARUNMINEDMESSAGE:
      return {
        ...state,
        newUnminedMessage: null
      };
    case QUIT_WALLET:
      return {
        ...state,
        transactionNtfns: null,
        transactionNtfnsError: null,
        accountNtfns: null,
        decodedTransactions: {},
        maturingBlockHeights: {}
      };
    default:
      return state;
  }
}
