import {
  filterTransactions,
  transactionsMaturingHeights
} from "../../../../app/actions/ClientActions/helpers";
import {
  TRANSACTION_DIR_SENT,
  TRANSACTION_DIR_RECEIVED,
  TRANSACTION_DIR_TRANSFERED
} from "../../../../app/wallet/service";
import { mockedTransactions } from "../get-transactions.data";

jest.mock("../../../../app/wallet/service");
jest.mock("../../../../app/middleware/walletrpc/api_pb");
jest.mock("../../../../app/selectors");

function getTx(creditAccounts = [0], debitAccounts = [0]) {
  return {
    getCreditsList() {
      return creditAccounts.map(a => ({
        getAccount() {
          return a;
        }
      }));
    },
    getDebitsList() {
      return debitAccounts.map(a => ({
        getPreviousAccount() {
          return a;
        }
      }));
    }
  };
}

describe("ClientActions > helpers > transactionFilter", () => {
  function getTransactionFilter(overrides = {}) {
    const defaults = {
      types: [],
      direction: "",
      search: null
    };
    return { ...defaults, ...overrides };
  }
  test("returns array with the same length when none of filtering cases were fulfilled", () => {
    const filter = filterTransactions(getTransactionFilter());
    expect(filter(mockedTransactions).length).toBe(mockedTransactions.length);
  });
  test("returns array filtered by type condition", () => {
    const voteFilter = filterTransactions(getTransactionFilter({ types: [2] }));
    const combinedFilter = filterTransactions(getTransactionFilter({ types: [0, 2, 4] }));
    const notAppearingFilter = filterTransactions(getTransactionFilter({ types: [3] }));
    const stakeVotesTransactionsLength = 5;
    const coinbaseTransactionsLength = 1;
    const regularTransactionsLength = 1;
    expect(voteFilter(mockedTransactions).length).toBe(stakeVotesTransactionsLength);
    expect(combinedFilter(mockedTransactions).length).toBe(
      stakeVotesTransactionsLength + coinbaseTransactionsLength + regularTransactionsLength
    );
    expect(notAppearingFilter(mockedTransactions).length).toBe(0);
  });
  test("returns array filtered by direction condition", () => {
    const directionFilter1 = filterTransactions(
      getTransactionFilter({ direction: TRANSACTION_DIR_SENT })
    );
    const directionFilter2 = filterTransactions(
      getTransactionFilter({ direction: TRANSACTION_DIR_RECEIVED })
    );
    const directionFilter3 = filterTransactions(
      getTransactionFilter({ direction: TRANSACTION_DIR_TRANSFERED })
    );
    expect(directionFilter1(mockedTransactions).length).toBe(0);
    expect(directionFilter2(mockedTransactions).length).toBe(0);
    expect(directionFilter3(mockedTransactions).length).toBe(1);
  });
  test("returns array filtered by search address condition when letter cases are matching", () => {
    const filter1 = filterTransactions(
      getTransactionFilter({ search: "22u7jtCJiN6HeyZDm3xMBpCjKwgEnq3VxPAB" })
    );
    const filter2 = filterTransactions(
      getTransactionFilter({ search: "22u58ndt3CoUPWSCyabSToqa2HEycrSqSr4B" })
    );
    expect(filter1(mockedTransactions).length).toBe(3);
    expect(filter2(mockedTransactions).length).toBe(1);
  });
  test("returns array filtered by search address condition when letter cases aren't matching", () => {
    const filter1 = filterTransactions(
      getTransactionFilter({ search: "22U7JTCJIN6HEYZDM3XMBPCJKWGENQ3VXPAB" })
    );
    const filter2 = filterTransactions(
      getTransactionFilter({ search: "22U58NDT3COUPWSCYABSTOQA2HEYCRSQSR4B" })
    );
    expect(filter1(mockedTransactions).length).toBe(3);
    expect(filter2(mockedTransactions).length).toBe(1);
  });
  test("returns array filtered by combined conditions", () => {
    const filter1 = filterTransactions(
      getTransactionFilter({
        types: [0, 1, 2],
        search: "22U7JTCJIN6HEYZDM3XMBPCJKWGENQ3VXPAB"
      })
    );
    const filter2 = filterTransactions(
      getTransactionFilter({
        types: [0, 1],
        search: "22U7JTCJIN6HEYZDM3XMBPCJKWGENQ3VXPAB"
      })
    );
    const filter3 = filterTransactions(
      getTransactionFilter({
        direction: "transfer",
        search: "22U58NDT3COUPWSCYABSTOQA2HEYCRSQSR4B"
      })
    );
    expect(filter1(mockedTransactions).length).toBe(3);
    expect(filter2(mockedTransactions).length).toBe(0);
    expect(filter3(mockedTransactions).length).toBe(1);
  });
});

describe("ClientActions > helpers > transactionsMaturingHeights", () => {
  test("should return object with 3 transaction maturing heights when all txs have the same heights", () => {
    const result = transactionsMaturingHeights(mockedTransactions, {
      TicketExpiry: 1000,
      SStxChangeMaturity: 1,
      TicketMaturity: 10,
      CoinbaseMaturity: 10
    });
    // mocked transactions height is 641
    expect(result).toEqual({ "642": [0], "651": [0], "1641": [0] });
  });
  test("should return object with 1 transaction maturing height when there is no ticket purchase type available", () => {
    const filteredMockedTransactions = mockedTransactions.filter(tx => tx.type !== 1);
    const result = transactionsMaturingHeights(filteredMockedTransactions, {
      TicketExpiry: 1000,
      SStxChangeMaturity: 1,
      TicketMaturity: 10,
      CoinbaseMaturity: 10
    });
    // mocked transactions height is 641
    expect(result).toEqual({ "651": [0] });
  });
  test("should return correct accounts", () => {
    const mockedTransactions = [
      {
        height: 100,
        type: 1,
        tx: getTx([0, 1], [2])
      },
      {
        height: 500,
        type: 2,
        tx: getTx([3, 4], [5])
      }
    ];
    const result = transactionsMaturingHeights(mockedTransactions, {
      TicketExpiry: 1000,
      SStxChangeMaturity: 1,
      TicketMaturity: 10,
      CoinbaseMaturity: 10
    });
    expect(result).toEqual({
      "1100": [0, 1, 2],
      "110": [0, 1, 2],
      "101": [0, 1, 2],
      "510": [3, 4, 5]
    });
  });
});
