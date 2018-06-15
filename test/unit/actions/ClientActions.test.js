import { getTransactions } from "../../../app/actions/ClientActions";
import { getTransactions as walletGetTransactions } from "../../../app/wallet/service";

jest.mock("../../../app/wallet/service");
jest.mock("../../../app/middleware/walletrpc/api_pb");

function getMockedGrpcState(overrideProps = {}) {
  const defaultState = {
    currentBlockHeight: 2,
    getTransactionsRequestAttempt: false,
    transactionsFilter: {
      listDirection: "desc",
      types: [0],
      direction: null
    },
    walletService: jest.fn(),
    maximumTransactionCount: 10,
    recentTransactionCount: 8,
    noMoreTransactions: false,
    lastTransaction: null,
    minedTransactions: [],
    recentRegularTransactions: undefined,
    recentStakeTransactions: undefined
  };
  return { grpc: { ...defaultState, ...overrideProps } };
}

// const defaultState = {
//   currentBlockHeight: 2,
//   getTransactionsRequestAttempt: false,
//   transactionsFilter: {
//     listDirection: "desc",
//     types: [0],
//     direction: null
//   },
//   walletService: jest.fn(),
//   maximumTransactionCount: 10,
//   recentTransactionCount: 8,
//   noMoreTransactions: false,
//   lastTransaction: {
//     amount: 30000000000,
//     creditAddresses: [
//       "22tv7nd31sMmD8BpcVRJAWQLqYCjaCuqpWpz",
//       "22u4VtFDzXDT517DFfCLRM8i5t814pZXePBK"
//     ],
//     creditAmounts: 30000000000,
//     txHash: "933bb306b3e71ac0d7c89f8dd2884f9190a1b7049e0632ae5201e1fb59377849",
//     txType: "Coinbase",
//     type: 4,
//     index: 0
//   },
//   minedTransactions: [],
//   recentRegularTransactions: undefined,
//   recentStakeTransactions: undefined
// };

describe("getTransactions", () => {
  test("it should return void when 'getTransactionsRequestAttempt' or 'noMoreTransactions' is true", async () => {
    walletGetTransactions.mockResolvedValue({
      unmined: [],
      mined: []
    });
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    const [firstCase, secondCase, thirdCase] = [
      { getTransactionsRequestAttempt: true, noMoreTransactions: false },
      { getTransactionsRequestAttempt: false, noMoreTransactions: true },
      { getTransactionsRequestAttempt: true, noMoreTransactions: true }
    ].map(getMockedGrpcState);

    _getState // each call of getTransactions calls getState twice
      .mockReturnValueOnce(firstCase)
      .mockReturnValueOnce(firstCase)
      .mockReturnValueOnce(secondCase)
      .mockReturnValueOnce(secondCase)
      .mockReturnValueOnce(thirdCase)
      .mockReturnValueOnce(thirdCase);

    const invoked = getTransactions();
    await invoked(_dispatch, _getState);
    await invoked(_dispatch, _getState);
    await invoked(_dispatch, _getState);
    expect(_dispatch.mock.calls.length).toBe(0);
  });

  // test("it should work", async () => {
  //   walletGetTransactions.mockResolvedValue({
  //     unmined: [],
  //     mined: []
  //   });
  //   const _getState = jest.fn();
  //   const _dispatch = jest.fn();
  //   _getState.mockReturnValue(getMockedGrpcState());
  //   await getTransactions()(_dispatch, _getState);
  //   expect(_dispatch.mock.calls.length).toBe(2);
  //   expect(_dispatch.mock.calls[0][0]).toEqual({ type: "GETTRANSACTIONS_ATTEMPT" });
  // });
});
