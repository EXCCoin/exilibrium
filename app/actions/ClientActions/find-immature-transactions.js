import * as selectors from "selectors";
import { intersect, increment, mapValues, addToSet, last, filterKeys } from "fp";
import { getTransactions as walletGetTransactions } from "wallet/service";
import { MATURINGHEIGHTS_CHANGED } from "./action-types";
import { transactionsMaturingHeights } from "./helpers";

const reduceHeights = (acc, heights) => {
  for (const [height, accounts] of Object.entries(heights)) {
    acc[height] = acc[height] ? addToSet(acc[height], accounts) : new Set(accounts);
  }
  return acc;
};

// Given a list of transactions, returns the maturing heights of all
// stake txs in the list.
export default function findImmatureTransactions() {
  return async (dispatch, getState) => {
    const { currentBlockHeight, walletService } = getState().grpc;
    const chainParams = selectors.chainParams(getState());

    const pageSize = 30;
    const checkHeightDeltas = [
      chainParams.TicketExpiry,
      chainParams.TicketMaturity,
      chainParams.CoinbaseMaturity,
      chainParams.SStxChangeMaturity
    ];
    const immatureHeight = currentBlockHeight - Math.max(...checkHeightDeltas);

    let txs = await walletGetTransactions(
      walletService,
      immatureHeight,
      currentBlockHeight,
      pageSize
    );
    let receivedHashes = new Set(txs.mined.map(tx => tx.txHash));
    let allTxHashesUnique = true;
    let maturingBlockHeights = {};
    const blockHeightFilter = filterKeys(key => parseInt(key) >= currentBlockHeight);
    while (txs.mined.length > 0 && allTxHashesUnique) {
      maturingBlockHeights = reduceHeights(
        maturingBlockHeights,
        blockHeightFilter(transactionsMaturingHeights(txs.mined, chainParams))
      );
      txs = await walletGetTransactions(
        walletService,
        increment(last(txs.mined).height),
        increment(currentBlockHeight),
        pageSize
      );
      const minedHashesBatch = txs.mined.map(tx => tx.txHash);
      if (intersect(receivedHashes, minedHashesBatch)) {
        allTxHashesUnique = false;
      } else {
        receivedHashes = addToSet(receivedHashes, minedHashesBatch);
      }
    }

    dispatch({
      type: MATURINGHEIGHTS_CHANGED,
      maturingBlockHeights: mapValues(maturingBlockHeights, Array.from)
    });
  };
}
