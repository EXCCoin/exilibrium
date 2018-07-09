import { TransactionDetails } from "middleware/walletrpc/api_pb";
import uniq from "lodash/uniq";
import { add, mapValues, addToSet, compose, filtering } from "fp";

const updateResult = foundAccounts => (acc, height) => ({
  ...acc,
  [height]: addToSet(acc[height], foundAccounts)
});

function getAccountsToUpdate({ tx }) {
  return uniq([
    ...tx.getCreditsList().map(credit => credit.getAccount()),
    ...tx.getDebitsList().map(debit => debit.getPreviousAccount())
  ]);
}

function prepareUpdate(accountsObj, transaction) {
  const addTransactionHeight = add(transaction.height);
  return paramsHeights =>
    paramsHeights
      .map(addTransactionHeight)
      .reduce(updateResult(getAccountsToUpdate(transaction)), accountsObj);
}

export function transactionsMaturingHeights(transactions, chainParams) {
  const result = transactions.reduce((acc, transaction) => {
    const updateHeights = prepareUpdate(acc, transaction);
    switch (transaction.type) {
      case TransactionDetails.TransactionType.TICKET_PURCHASE:
        return updateHeights([
          chainParams.TicketExpiry,
          chainParams.SStxChangeMaturity,
          chainParams.TicketMaturity
        ]);
      case TransactionDetails.TransactionType.VOTE:
      case TransactionDetails.TransactionType.REVOCATION:
        return updateHeights([chainParams.CoinbaseMaturity]);
    }
    return acc;
  }, {});

  return mapValues(result, Array.from);
}

const xTransactionFilter = filterObj =>
  compose(
    filtering(v => (filterObj.types.length ? filterObj.types.indexOf(v.type) > -1 : true)),
    filtering(v => (filterObj.direction ? filterObj.direction === v.direction : true)),
    filtering(
      v =>
        filterObj.search
          ? v.creditAddresses.find(
              address =>
                address.length > 1 &&
                address.toLowerCase().indexOf(filterObj.search.toLowerCase()) !== -1
            ) !== undefined
          : true
    )
  );

export function filterTransactions(filterObj) {
  const xfilter = xTransactionFilter(filterObj);
  return transactions =>
    transactions.reduce(
      xfilter((acc, element) => {
        acc.push(element);
        return acc;
      }),
      []
    );
}
