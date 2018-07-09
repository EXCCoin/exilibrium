import findImmatureTransactions from "../../../../app/actions/ClientActions/find-immature-transactions";
import { MATURINGHEIGHTS_CHANGED } from "../../../../app/actions/ClientActions/action-types";
import { getTransactions as walletGetTransactions } from "../../../../app/wallet/service";
import { chainParams } from "../../../../app/selectors";
import { MainNetParams } from "../chain-params.data";

jest.mock("../../../../app/wallet/service");
jest.mock("../../../../app/middleware/walletrpc/api_pb");
jest.mock("../../../../app/selectors");

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

describe("ClientActions > findImmatureTransactions", () => {
  test("should dispatch 'MATURINGHEIGHTS_CHANGED' action with empty array when mined transactions array is empty", async () => {
    walletGetTransactions.mockResolvedValue({ mined: [], unmined: [] });
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    chainParams.mockReturnValue(MainNetParams);
    _getState.mockReturnValue(getMockedGrpcState());
    await findImmatureTransactions()(_dispatch, _getState);
    expect(_getState.mock.calls.length).toBe(2);
    expect(_dispatch.mock.calls.length).toBe(1);
    expect(_dispatch.mock.calls[0][0]).toEqual({
      maturingBlockHeights: {},
      type: MATURINGHEIGHTS_CHANGED
    });
    walletGetTransactions.mockReset();
    chainParams.mockReset();
  });
  test("should work in infinite loop case", async () => {
    walletGetTransactions.mockResolvedValue({
      mined: [
        {
          txHash: "933bb306b3e71ac0d7c89f8dd2884f9190a1b7049e0632ae5201e1fb59377849",
          type: 4,
          height: 1,
          tx: getTx([0, 1, 3], [7])
        }
      ],
      unmined: []
    });
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    chainParams.mockReturnValue(MainNetParams);
    _getState.mockReturnValue(getMockedGrpcState());
    await findImmatureTransactions()(_dispatch, _getState);
    expect(_getState.mock.calls.length).toBe(2);
    expect(_dispatch.mock.calls.length).toBe(1);
    expect(_dispatch.mock.calls[0][0]).toEqual({
      maturingBlockHeights: {},
      type: MATURINGHEIGHTS_CHANGED
    });
    walletGetTransactions.mockReset();
    chainParams.mockReset();
  });
  test("should in more complex case", async () => {
    walletGetTransactions
      .mockResolvedValueOnce({
        mined: [
          {
            txHash: "133bb306b3e71ac0d7c89f8dd2884f9190a1b7049e0632ae5201e1fb59377849",
            txType: "Coinbase",
            type: 4,
            index: 0,
            height: 100,
            tx: getTx([0, 1, 3], [7])
          },
          {
            txHash: "233bb306b3e71ac0d7c89f8dn2884f9190a1b7049e0632ae5201e1fb59377849",
            txType: "Ticket",
            type: 2,
            index: 0,
            height: 155,
            tx: getTx([3])
          }
        ]
      })
      .mockReturnValueOnce({
        mined: [
          {
            txHash: "333bb306b3e71ac0d7c89f8dd2884f9190a1b7045e0632ae5201e1fb59377849",
            type: 2,
            height: 163,
            tx: getTx([0], [9])
          },
          {
            txHash: "433bb306b3e71ac0d7c89f8dd2884f9190a1b7045e0632ae5201e1fb59877849",
            type: 1,
            height: 163,
            tx: getTx([0, 1, 3], [8])
          }
        ]
      })
      .mockResolvedValueOnce({
        mined: [
          {
            txHash: "533bb300b3e71ac0d7c89f8dd2884f9190a1b7045e0632ae5201e1fb59877849",
            type: 1,
            height: 163,
            tx: getTx([4], [0])
          },
          {
            txHash: "533bb300b3e71ac0d7c89f8dd2884f9190a1b7045e0632ae5201e1fb59877849",
            type: 1,
            height: 1200,
            tx: getTx([4], [0])
          }
        ]
      })
      .mockResolvedValue({ mined: [] });
    const _getState = jest.fn();
    const _dispatch = jest.fn();
    chainParams.mockReturnValue(MainNetParams);
    _getState.mockReturnValue(getMockedGrpcState());
    await findImmatureTransactions()(_dispatch, _getState);
    expect(_getState.mock.calls.length).toBe(2);
    expect(_dispatch.mock.calls.length).toBe(1);
    expect(_dispatch.mock.calls[0][0].maturingBlockHeights).toEqual({
      "1201": [4, 0],
      "1216": [4, 0],
      "164": [0, 1, 3, 8, 4],
      "171": [3, 0],
      "179": [0, 9, 1, 3, 8, 4],
      "6307": [0, 1, 3, 8, 4],
      "7344": [4, 0]
    });
    walletGetTransactions.mockReset();
    chainParams.mockReset();
  });
});
