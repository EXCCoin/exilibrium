import { getTransactions } from "../../../../app/actions/ClientActions";
import { getTransactions as walletGetTransactions } from "../../../../app/wallet/service";
import { mockedTransactions, unminedMockedTransactions } from "../get-transactions.data";

jest.mock("../../../../app/wallet/service");
jest.mock("../../../../app/middleware/walletrpc/api_pb");
jest.mock("../../../../app/selectors");

function getMockedTransactions(height) {
  return [...mockedTransactions].map(tx => ({ ...tx, height }));
}
function range(numberOfElements) {
  return [...Array(numberOfElements).keys()];
}
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
    recentRegularTransactions: [],
    recentStakeTransactions: []
  };
  return { grpc: { ...defaultState, ...overrideProps } };
}

function getMockedWalletGetTransactionResponse(options = {}) {
  if (options.empty) {
    return {
      mined: [],
      unmined: []
    };
  }
  const { height = 1 } = options;
  return {
    unmined: [],
    mined: [
      {
        amount: 30000000000,
        creditAddresses: [
          "22tv7nd31sMmD8BpcVRJAWQLqYCjaCuqpWpz",
          "22u4VtFDzXDT517DFfCLRM8i5t814pZXePBK"
        ],
        creditAmounts: 30000000000,
        txHash: "933bb306b3e71ac0d7c89f8dd2884f9190a1b7049e0632ae5201e1fb59377849",
        txType: "Coinbase",
        type: 4,
        index: 0,
        height
      }
    ]
  };
}

describe("ClientActions > getTransactions", () => {
  test("it shouldn't dispatch any action when 'getTransactionsRequestAttempt' or 'noMoreTransactions' is true", async () => {
    walletGetTransactions.mockResolvedValue(getMockedWalletGetTransactionResponse({ empty: true }));
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    const [firstCase, secondCase, thirdCase] = [[true, false], [false, true], [true, true]]
      .map(([getTransactionsRequestAttempt, noMoreTransactions]) => ({
        getTransactionsRequestAttempt,
        noMoreTransactions
      }))
      .map(getMockedGrpcState);

    _getState // each call of getTransactions calls getState twice
      .mockReturnValueOnce(firstCase)
      .mockReturnValueOnce(firstCase)
      .mockReturnValueOnce(secondCase)
      .mockReturnValueOnce(secondCase)
      .mockReturnValueOnce(thirdCase)
      .mockReturnValueOnce(thirdCase);

    const invoked = getTransactions();
    await Promise.all([
      invoked(_dispatch, _getState),
      invoked(_dispatch, _getState),
      invoked(_dispatch, _getState)
    ]);
    expect(_dispatch.mock.calls.length).toBe(0);
    walletGetTransactions.mockReset();
  });

  test("it should call dispatch twice in case when noMoreTransactions condition is fulfilled", async () => {
    walletGetTransactions
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse())
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse({ empty: true }));
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(getMockedGrpcState());
    await getTransactions()(_dispatch, _getState);
    expect(_dispatch.mock.calls.length).toBe(2);
    expect(_dispatch.mock.calls[0][0]).toEqual({ type: "GETTRANSACTIONS_ATTEMPT" });
    expect(_dispatch.mock.calls[1][0]).toHaveProperty("type", "GETTRANSACTIONS_COMPLETE");
    expect(walletGetTransactions.mock.calls.length).toBe(2);
    walletGetTransactions.mockReset();
  });

  test("it should correctly dispatch actions in infinite loop case", async () => {
    walletGetTransactions.mockResolvedValue(getMockedWalletGetTransactionResponse());
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(getMockedGrpcState());
    await getTransactions()(_dispatch, _getState);
    expect(_dispatch.mock.calls.length).toBe(2);
    expect(walletGetTransactions.mock.calls.length).toBe(3);
    expect(_dispatch.mock.calls[0][0]).toEqual({ type: "GETTRANSACTIONS_ATTEMPT" });
    expect(_dispatch.mock.calls[1][0]).toHaveProperty("type", "GETTRANSACTIONS_COMPLETE");
    walletGetTransactions.mockReset();
  });

  test("it should correctly dispatch actions in case of 'walletGetTransactions' error & break request flow immediately in infinite loop case", async () => {
    walletGetTransactions
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse({ empty: true }))
      .mockRejectedValueOnce("GENERIC ERROR")
      .mockResolvedValue(getMockedWalletGetTransactionResponse());
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(getMockedGrpcState());
    await getTransactions()(_dispatch, _getState);
    expect(_dispatch.mock.calls.length).toBe(2);
    expect(_dispatch.mock.calls[0][0]).toEqual({ type: "GETTRANSACTIONS_ATTEMPT" });
    expect(_dispatch.mock.calls[1][0]).toHaveProperty("type", "GETTRANSACTIONS_FAILED");
    walletGetTransactions.mockReset();
  });

  test("it should call walletGetTransactions with correct arguments in infinite loop case", async () => {
    walletGetTransactions
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse({ empty: true }))
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse({ height: 2 }))
      .mockResolvedValue(getMockedWalletGetTransactionResponse());
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(getMockedGrpcState());
    await getTransactions()(_dispatch, _getState);
    expect(walletGetTransactions.mock.calls.length).toBe(3);
    const [firstCall, secondCall, thirdCall] = walletGetTransactions.mock.calls;
    // unmined transactions
    expect(firstCall[1]).toBe(-1);
    expect(firstCall[2]).toBe(-1);
    expect(firstCall[3]).toBe(0);

    expect(secondCall[1]).toBe(2);
    expect(secondCall[2]).toBe(1);
    expect(secondCall[3]).toBe(10);

    expect(thirdCall[1]).toBe(1);
    expect(thirdCall[2]).toBe(1);
    expect(thirdCall[3]).toBe(10);

    walletGetTransactions.mockReset();
  });

  test("should call walletGetTransactions 3 times when filtered transactions length condition is fulfilled", async () => {
    walletGetTransactions.mockResolvedValueOnce(
      getMockedWalletGetTransactionResponse({ empty: true })
    );
    // 12 subsequent calls
    for (const num of range(12)) {
      walletGetTransactions.mockReturnValueOnce({
        unmined: [],
        mined: getMockedTransactions(641 - num + 1)
      });
    }
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(
      getMockedGrpcState({
        currentBlockHeight: 641,
        transactionsFilter: {
          listDirection: "desc",
          types: [2],
          direction: null
        }
      })
    );
    const result = await getTransactions()(_dispatch, _getState);
    expect(_dispatch.mock.calls.length).toBe(2);
    expect(walletGetTransactions.mock.calls.length).toBe(3);
    const [firstCall, secondCall, thirdCall] = walletGetTransactions.mock.calls;

    expect(firstCall[1]).toBe(-1);
    expect(firstCall[2]).toBe(-1);
    expect(firstCall[3]).toBe(0);

    expect(secondCall[1]).toBe(641);
    expect(secondCall[2]).toBe(1);
    expect(secondCall[3]).toBe(10);

    expect(thirdCall[1]).toBe(640);
    expect(thirdCall[2]).toBe(1);
    expect(thirdCall[3]).toBe(10);

    expect(result.unminedTransactions.length).toBe(0);
    expect(result.minedTransactions.length).toBe(5);
    expect(result.recentRegularTransactions.length).toBe(0);
    expect(result.recentStakeTransactions.length).toBe(5);
    walletGetTransactions.mockReset();
  });

  test("should return correct state change shape with 'REGULAR' type transaction filter", async () => {
    walletGetTransactions
      .mockResolvedValueOnce({
        unmined: unminedMockedTransactions,
        mined: []
      })
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse())
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse({ empty: true }));
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(getMockedGrpcState());
    const result = await getTransactions()(_dispatch, _getState);
    expect(walletGetTransactions.mock.calls.length).toBe(3);
    expect(_dispatch.mock.calls.length).toBe(2);
    expect(result.unminedTransactions.length).toBe(1);
    expect(result.minedTransactions.length).toBe(0);
    expect(result.recentRegularTransactions.length).toBe(1);
    expect(result.lastTransaction).toEqual({
      amount: 30000000000,
      creditAddresses: [
        "22tv7nd31sMmD8BpcVRJAWQLqYCjaCuqpWpz",
        "22u4VtFDzXDT517DFfCLRM8i5t814pZXePBK"
      ],
      creditAmounts: 30000000000,
      txHash: "933bb306b3e71ac0d7c89f8dd2884f9190a1b7049e0632ae5201e1fb59377849",
      txType: "Coinbase",
      type: 4,
      index: 0,
      height: 1
    });
    walletGetTransactions.mockReset();
  });
  test("should return correct state change shape with 'VOTE' type transaction filter", async () => {
    walletGetTransactions
      .mockResolvedValueOnce({
        unmined: unminedMockedTransactions,
        mined: []
      })
      .mockResolvedValueOnce({
        unmined: [],
        mined: mockedTransactions
      })
      .mockResolvedValueOnce(getMockedWalletGetTransactionResponse({ empty: true }));
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    _getState.mockReturnValue(
      getMockedGrpcState({
        currentBlockHeight: 641,
        transactionsFilter: {
          listDirection: "desc",
          types: [2],
          direction: null
        }
      })
    );
    const result = await getTransactions()(_dispatch, _getState);
    expect(_dispatch.mock.calls.length).toBe(2);
    expect(walletGetTransactions.mock.calls.length).toBe(3);
    const [firstCall, secondCall, thirdCall] = walletGetTransactions.mock.calls;

    expect(firstCall[1]).toBe(-1);
    expect(firstCall[2]).toBe(-1);
    expect(firstCall[3]).toBe(0);

    expect(secondCall[1]).toBe(641);
    expect(secondCall[2]).toBe(1);
    expect(secondCall[3]).toBe(10);

    expect(thirdCall[1]).toBe(640);
    expect(thirdCall[2]).toBe(1);
    expect(thirdCall[3]).toBe(10);

    expect(result.unminedTransactions.length).toBe(1);
    expect(result.minedTransactions.length).toBe(5);
    expect(result.recentRegularTransactions.length).toBe(0);
    expect(result.recentStakeTransactions.length).toBe(6);
    expect(result.lastTransaction).toEqual(mockedTransactions[mockedTransactions.length - 1]);
    walletGetTransactions.mockReset();
  });
});
