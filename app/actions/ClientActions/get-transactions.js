import {
  GETTRANSACTIONS_ATTEMPT,
  GETTRANSACTIONS_FAILED,
  GETTRANSACTIONS_COMPLETE
} from "./action-types";
import { increment, decrement, intersect } from "fp";
import { getTransactions as walletGetTransactions } from "wallet/service";
import { TransactionDetails } from "middleware/walletrpc/api_pb";
import { filterTransactions } from "./helpers";

function getDirection(listDirection, currentBlockHeight) {
  switch (listDirection) {
    case "desc":
      return lastTransaction => ({
        start: lastTransaction ? decrement(lastTransaction.height) : currentBlockHeight,
        end: 1
      });
    default:
      return lastTransaction => ({
        start: lastTransaction ? increment(lastTransaction.height) : 1,
        end: currentBlockHeight
      });
  }
}

// getTransactions loads a list of transactions from the wallet, given the
// current grpc state.
//
// Every call to getTransactions() tries to get `grpc.maximumTransactionCount`
// transactions from the wallet, given the current filter for transactions.
// Note that more than that amount of transactions may be obtained, as the
// iteration of transactions on the wallet is done by block height.
//
// When no more transactions are available given the current filter,
// `grpc.noMoreTransactions` is set to true.
export default function getTransactions() {
  return async (dispatch, getState) => {
    const {
      currentBlockHeight,
      getTransactionsRequestAttempt,
      transactionsFilter,
      walletService,
      maximumTransactionCount,
      recentTransactionCount
    } = getState().grpc;
    let {
      noMoreTransactions,
      lastTransaction,
      minedTransactions,
      recentRegularTransactions,
      recentStakeTransactions
    } = getState().grpc;
    if (getTransactionsRequestAttempt || noMoreTransactions) {
      return;
    }

    if (!currentBlockHeight) {
      // Wait a little then re-dispatch this call since we have no starting height yet
      setTimeout(() => {
        dispatch(getTransactions());
      }, 1000);
      return;
    }
    dispatch({ type: GETTRANSACTIONS_ATTEMPT });

    // Amount of transactions to obtain at each walletService.getTransactions request (a "page")
    const pageCount = maximumTransactionCount;

    // List of transactions found after filtering
    const filtered = [];
    const receivedHashes = [];
    const filterTx = filterTransactions(transactionsFilter);

    // first, request unmined transactions. They always come first in exilibrium.
    const { unmined } = await walletGetTransactions(walletService, -1, -1, 0);
    const unminedTransactions = filterTx(unmined);
    const direction = getDirection(transactionsFilter.listDirection, currentBlockHeight);

    while (!noMoreTransactions && filtered.length < maximumTransactionCount) {
      const { start, end } = direction(lastTransaction);
      try {
        const { mined } = await walletGetTransactions(walletService, start, end, pageCount);
        lastTransaction = mined[mined.length - 1] || lastTransaction;
        const minedHashesBatch = mined.map(tx => tx.txHash);
        if (mined.length === 0 || intersect(receivedHashes, minedHashesBatch)) {
          noMoreTransactions = true;
        } else {
          filtered.push(...filterTx(mined));
          receivedHashes.push(...minedHashesBatch);
        }
      } catch (error) {
        dispatch({ type: GETTRANSACTIONS_FAILED, error });
        return;
      }
    }

    minedTransactions = [...minedTransactions, ...filtered];

    // reduce transactions visibility in "Overview page" to 8 items
    const { types } = transactionsFilter;
    const recentTransactions = [...unminedTransactions, ...minedTransactions].slice(
      0,
      recentTransactionCount
    );
    if (types.includes(TransactionDetails.TransactionType.REGULAR)) {
      recentRegularTransactions = [...recentTransactions];
    } else if (types.includes(TransactionDetails.TransactionType.VOTE)) {
      recentStakeTransactions = [...recentTransactions];
    }

    const stateChange = {
      unminedTransactions,
      minedTransactions,
      noMoreTransactions,
      lastTransaction,
      recentRegularTransactions,
      recentStakeTransactions,
      type: GETTRANSACTIONS_COMPLETE
    };
    dispatch(stateChange);
    return stateChange;
  };
}
