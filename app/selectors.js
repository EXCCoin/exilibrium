import {
  compose,
  reduce,
  filter,
  get,
  not,
  or,
  and,
  eq,
  find,
  bool,
  map,
  apply,
  div,
  identity
} from "./fp";
import { createSelector } from "reselect";
import { appLocaleFromElectronLocale } from "./i18n/locales";
import { reverseHash } from "./helpers/byteActions";
import { TRANSACTION_TYPES } from "wallet/service";
import { MainNetParams, TestNetParams } from "wallet/constants";
import { TicketTypes } from "./helpers/tickets";

export const apiAddress = state => state.api.address;
export const daemonError = get(["daemon", "daemonError"]);
export const walletError = get(["daemon", "walletError"]);
export const appVersion = get(["daemon", "appVersion"]);
export const updateAvailable = get(["daemon", "updateAvailable"]);
export const openForm = get(["daemon", "openForm"]);
export const isDaemonRemote = get(["daemon", "daemonRemote"]);
export const getDaemonStarted = get(["daemon", "daemonStarted"]);
export const getRemoteAppdataError = get(["daemon", "remoteAppdataError"]);
export const getCurrentBlockCount = get(["daemon", "currentBlockCount"]);
export const getNeededBlocks = get(["walletLoader", "neededBlocks"]);
export const getEstimatedTimeLeft = get(["daemon", "timeLeftEstimate"]);
export const getDaemonSynced = get(["daemon", "daemonSynced"]);
export const isAdvancedDaemon = get(["daemon", "daemonAdvanced"]);
export const getWalletReady = get(["daemon", "walletReady"]);
export const maxWalletCount = get(["walletLoader", "maxWalletCount"]);
export const isPrepared = and(getDaemonStarted, getDaemonSynced);
export const getCredentials = get(["daemon", "credentials"]);

const START_STEP_OPEN = 2;
const START_STEP_RPC1 = 3;
const START_STEP_RPC2 = 4;
const START_STEP_DISCOVER = 5;
const START_STEP_FETCH = 6;

export const setLanguage = get(["daemon", "setLanguage"]);
export const showTutorial = get(["daemon", "tutorial"]);
export const versionInvalid = get(["version", "versionInvalid"]);
export const requiredWalletRPCVersion = get(["version", "requiredVersion"]);
export const walletRPCVersion = createSelector(
  get(["version", "getWalletRPCVersionResponse"]),
  response => (response ? response.getVersionString() : null)
);
const walletExistResponse = get(["walletLoader", "walletExistResponse"]);
export const startStepIndex = get(["walletLoader", "stepIndex"]);
export const getVersionServiceError = get(["version", "getVersionServiceError"]);
export const getWalletRPCVersionError = get(["version", "getWalletRPCVersionError"]);
export const getLoaderError = get(["version", "getLoaderError"]);
export const hasExistingWallet = compose(
  response => Boolean(response && response.getExists()),
  walletExistResponse
);
export const confirmNewSeed = get(["walletLoader", "confirmNewSeed"]);
export const existingOrNew = get(["walletLoader", "existingOrNew"]);
export const importCopay = get(["walletLoader", "importCopay"]);
export const versionInvalidError = createSelector(
  versionInvalid,
  get(["version", "versionInvalidError"]),
  (invalid, error) => (invalid ? error || "Unknown Error" : null)
);

const isStartStepOpen = compose(
  eq(START_STEP_OPEN),
  startStepIndex
);
const isStartStepDiscover = compose(
  eq(START_STEP_DISCOVER),
  startStepIndex
);
const isStartStepRPC = compose(
  or(eq(START_STEP_RPC1), eq(START_STEP_RPC2)),
  startStepIndex
);
const isStartStepFetch = compose(
  eq(START_STEP_FETCH),
  startStepIndex
);

const walletExistError = and(get(["walletLoader", "walletExistError"]), isStartStepOpen);
const walletCreateError = and(get(["walletLoader", "walletCreateError"]), isStartStepOpen);
const walletOpenError = and(get(["walletLoader", "walletOpenError"]), isStartStepOpen);
const startRpcError = and(get(["walletLoader", "startRpcError"]), isStartStepRPC);
const discoverAddrError = and(get(["walletLoader", "discoverAddressError"]), isStartStepDiscover);
const fetchHeadersError = and(get(["walletLoader", "fetchHeadersError"]), isStartStepFetch);
export const startupError = or(
  getVersionServiceError,
  getWalletRPCVersionError,
  getLoaderError,
  walletExistError,
  walletCreateError,
  walletOpenError,
  startRpcError,
  discoverAddrError,
  fetchHeadersError
);

const availableWallets = get(["daemon", "availableWallets"]);

export const availableWalletsSelect = createSelector(availableWallets, wallets =>
  wallets.map(wallet => ({
    label: `${wallet.wallet} (${wallet.network})`,
    value: wallet,
    network: wallet.network,
    finished: wallet.finished
  }))
);
export const previousWallet = get(["daemon", "previousWallet"]);
export const getWalletName = get(["daemon", "walletName"]);

const openWalletInputRequest = get(["walletLoader", "openWalletInputRequest"]);
const createWalletInputRequest = get(["walletLoader", "createWalletInputRequest"]);
const discoverAddressInputRequest = get(["walletLoader", "discoverAddressInputRequest"]);
const advancedDaemonInputRequest = get(["walletLoader", "advancedDaemonInputRequest"]);
const selectCreateWalletInputRequest = get(["daemon", "selectCreateWalletInputRequest"]);

export const isInputRequest = or(
  openWalletInputRequest,
  createWalletInputRequest,
  discoverAddressInputRequest,
  and(openForm, isAdvancedDaemon, advancedDaemonInputRequest),
  selectCreateWalletInputRequest
);

export const balances = or(get(["grpc", "balances"]), () => []);
export const walletService = get(["grpc", "walletService"]);
export const agendaService = get(["grpc", "agendaService"]);
export const votingService = get(["grpc", "votingService"]);
export const getBalanceRequestAttempt = get(["grpc", "getBalanceRequestAttempt"]);
export const getAccountsResponse = get(["grpc", "getAccountsResponse"]);
export const getNetworkResponse = get(["grpc", "getNetworkResponse"]);
export const getNetworkError = get(["grpc", "getNetworkError"]);
const accounts = createSelector(
  getAccountsResponse,
  response => (response ? response.getAccountsList() : [])
);

export const sortedAccounts = createSelector(balances, balances =>
  [...balances].sort((a, b) => a.accountNumber - b.accountNumber)
);

export const totalBalance = createSelector(
  balances,
  reduce((exels, { total }) => exels + total, 0)
);

export const spendableTotalBalance = createSelector(
  balances,
  reduce(
    (total, { accountName, spendable }) => (accountName === "imported" ? total : total + spendable),
    0
  )
);

export const lockedBalance = createSelector(
  balances,
  reduce((exels, { lockedByTickets }) => exels + lockedByTickets, 0)
);

export const networks = () => [{ name: "testnet" }, { name: "mainnet" }];
export const network = get(["daemon", "network"]);
export const explorer = get(["explorer"]);
export const isTestNet = compose(
  eq("testnet"),
  network
);
export const isMainNet = not(isTestNet);
export const currencies = () => [{ name: "EXCC" }, { name: "exels" }];
export const currencyDisplay = get(["settings", "currentSettings", "currencyDisplay"]);
export const unitDivisor = compose(
  disp => (disp === "EXCC" ? 100000000 : 1),
  currencyDisplay
);
export const currentLocaleName = get(["settings", "currentSettings", "locale"]);
export const miningToggle = get(["settings", "miningEnabled"]);
export const systemInfo = get(["settings", "systemInfo"]);
export const miningParams = get(["settings", "miningParams"]);
export const defaultLocaleName = createSelector(currentLocaleName, currentLocaleName => {
  return appLocaleFromElectronLocale(currentLocaleName);
});

export const sortedLocales = createSelector(get(["locales"]), locales =>
  [...locales].sort((a, b) => a.description.localeCompare(b.description))
);
export const namedLocales = createSelector([get(["locales"])], locales =>
  reduce((acc, locale) => ({ ...acc, [locale.key]: locale }), {}, locales)
);
export const locale = createSelector(
  namedLocales,
  currentLocaleName,
  (namedLocales, currentLocaleName) => {
    return namedLocales[currentLocaleName] || namedLocales.en;
  }
);

const getTxTypeStr = type => TRANSACTION_TYPES[type];

export const txURLBuilder = createSelector(
  explorer,
  ({ address, slugs }) => `${address}/${slugs.transaction}`
);

export const blockURLBuilder = createSelector(
  explorer,
  ({ address, slugs }) => `${address}/${slugs.block}`
);

export const transactionNormalizer = createSelector(
  accounts,
  txURLBuilder,
  blockURLBuilder,
  (accounts, txURL, blockURL) => {
    const findAccount = num => accounts.find(account => account.getAccountNumber() === num);
    const getAccountName = num => (act => (act ? act.getAccountName() : ""))(findAccount(num));
    // TODO: Remove currying
    return tx => {
      const { blockHash } = tx;
      const type = tx.type || (tx.getTransactionType ? tx.getTransactionType() : null);
      const txInfo = tx.tx ? tx : {};
      let { timestamp } = tx;
      tx = tx.tx || tx;
      timestamp = timestamp || tx.timestamp;
      let totalFundsReceived = 0;
      let totalChange = 0;
      const addressStr = [];
      let debitedAccount;
      let creditedAccount;
      const txInputs = [];
      const txOutputs = [];
      const txHash = reverseHash(Buffer.from(tx.getHash()).toString("hex"));
      const txBlockHash = blockHash ? reverseHash(Buffer.from(blockHash).toString("hex")) : null;
      const fee = tx.getFee();
      const totalDebit = tx.getDebitsList().reduce((total, debit) => {
        debitedAccount = debit.getPreviousAccount();
        const accountName = getAccountName(debitedAccount);
        const amount = debit.getPreviousAmount();
        txInputs.push({ accountName, amount, index: debit.getIndex() });
        return total + amount;
      }, 0);

      tx.getCreditsList().forEach(credit => {
        const amount = credit.getAmount();
        const address = credit.getAddress();
        addressStr.push(address);
        creditedAccount = credit.getAccount();
        const accountName = getAccountName(creditedAccount);
        txOutputs.push({ accountName, amount, address, index: credit.getIndex() });
        if (credit.getInternal()) {
          totalChange += amount;
        } else {
          totalFundsReceived += amount;
        }
      });
      const txDetails =
        totalFundsReceived + totalChange + fee < totalDebit
          ? {
              txDescription: { direction: "Sent", addressStr: null },
              txAmount: totalDebit - fee - totalChange - totalFundsReceived,
              txDirection: "out",
              txAccountName: getAccountName(debitedAccount)
            }
          : totalFundsReceived + totalChange + fee === totalDebit
            ? {
                txDescription: { direction: "Transferred", addressStr },
                txAmount: fee,
                txDirection: "transfer",
                txAccountName: getAccountName(creditedAccount)
              }
            : {
                txDescription: { direction: "Received at:", addressStr },
                // totalChange or totalFundsReceived will be "0" here
                // there is a bug in the wallet,
                // where it accounts output with lesser amount as change
                // 17.00 EXCC   -> 15.9999994 EXCC     (this is real change)
                //              -> 1.00 EXCC           (this is real transferred amount)
                txAmount: totalFundsReceived + totalChange,
                txDirection: "in",
                txAccountName: getAccountName(creditedAccount)
              };

      return {
        txUrl: `${txURL}/${txHash}`,
        txBlockUrl: txBlockHash ? `${blockURL}/${txBlockHash}` : null,
        txHash,
        txHeight: txInfo.height,
        txType: getTxTypeStr(type),
        txTimestamp: timestamp,
        txFee: fee,
        txInputs,
        txOutputs,
        txBlockHash,
        txNumericType: type,
        rawTx: Buffer.from(tx.getTransaction()).toString("hex"),
        ...txDetails
      };
    };
  }
);

export const noMoreTransactions = get(["grpc", "noMoreTransactions"]);
export const transactionsNormalizer = createSelector(transactionNormalizer, map);
export const transactionsFilter = get(["grpc", "transactionsFilter"]);
export const hasUnminedTransactions = compose(
  l => l && l.length > 0,
  get(["grpc", "unminedTransactions"])
);
export const transactions = createSelector(
  transactionsNormalizer,
  get(["grpc", "transactions"]),
  apply
);

export const homeHistoryTransactions = createSelector(
  transactionsNormalizer,
  get(["grpc", "recentRegularTransactions"]),
  apply
);

export const loadingStartupStats = createSelector(
  state => state.statistics.loadingStartupStats,
  identity
);
export const dailyBalancesStats = state => state.statistics.dailyBalances;

export const spendableAndLockedBalance = createSelector(
  dailyBalancesStats,
  unitDivisor,
  (stats, unitDivisor) => {
    const divByUnit = div(unitDivisor);
    return stats.map(({ time, series }) => ({
      time,
      available: divByUnit(series.spendable),
      locked: divByUnit(series.locked + series.lockedNonWallet),
      immature: divByUnit(series.immature + series.immatureNonWallet)
    }));
  }
);

export const balanceSent = createSelector(dailyBalancesStats, balances =>
  balances.reduce((s, b) => s + b.series.sent, 0)
);

export const balanceReceived = createSelector(dailyBalancesStats, balances =>
  balances.reduce((s, b) => s + b.series.received, 0)
);

export const sentAndReceivedTransactions = createSelector(
  dailyBalancesStats,
  unitDivisor,
  (stats, unitDivisor) => {
    const divByUnit = div(unitDivisor);
    return stats.map(({ time, series }) => ({
      time,
      sent: divByUnit(series.sent),
      received: divByUnit(series.received)
    }));
  }
);

//fake data for ticket tab on overview Page
export const totalValueOfLiveTickets = createSelector(dailyBalancesStats, balances => {
  if (!balances) {
    return 0;
  }
  const lastBalance = balances[balances.length - 1];
  if (!lastBalance) {
    return 0;
  }
  return lastBalance.series.locked + lastBalance.series.lockedNonWallet;
});

export const ticketDataChart = createSelector(
  dailyBalancesStats,
  unitDivisor,
  (stats, unitDivisor) => {
    const divByUnit = div(unitDivisor);
    return stats.map(({ time, series }) => ({
      time,
      voted: divByUnit(series.voted),
      revoked: divByUnit(series.revoked),
      ticket: divByUnit(series.ticket),
      locked: divByUnit(series.locked + series.lockedNonWallet),
      immature: divByUnit(series.immature + series.immatureNonWallet)
    }));
  }
);

export const decodedTransactions = state => {
  if (state.grpc && state.grpc.decodedTransactions) {
    return state.grpc.decodedTransactions;
  }
  return [];
};

export const viewedDecodedTransaction = createSelector(
  transactions,
  (
    state,
    {
      match: {
        params: { txHash }
      }
    }
  ) => txHash,
  decodedTransactions,
  (transactions, txHash, decodedTransactions) => decodedTransactions[txHash]
);

// ticket change is anything returned to the wallet on ticket purchase.
const isTicketChange = c => c.getIndex() > 0 && c.getIndex() % 2 === 0;

export const ticketNormalizer = ticket => {
  const hasSpender = Boolean(ticket.spender && ticket.spender.getHash());
  const ticketTx = ticket.ticket;

  let spenderTx = null;
  let spenderHash = null;
  let decodedSpenderTx = null;
  let leaveTimestamp = null;
  let spenderRawTx = null;
  let spenderTxFee = 0;

  const hash = reverseHash(Buffer.from(ticketTx.getHash()).toString("hex"));
  const hasCredits = ticketTx.getCreditsList().length > 0;

  // effective ticket price is the output 0 for the ticket transaction
  // (stakesubmission script class)
  const ticketPrice = hasCredits ? ticketTx.getCreditsList()[0].getAmount() : 0;

  const ticketChange = ticketTx
    .getCreditsList()
    .reduce((s, c) => (s + isTicketChange(c) ? c.getAmount() : 0), 0);

  // ticket investment is the full amount paid by the wallet on the ticket purchase
  const ticketInvestment =
    ticketTx.getDebitsList().reduce((a, v) => a + v.getPreviousAmount(), 0) - ticketChange;

  let ticketReward, ticketROI, ticketReturnAmount, ticketPoolFee, voteChoices;
  if (hasSpender) {
    spenderTx = ticket.spender;
    spenderHash = reverseHash(Buffer.from(spenderTx.getHash()).toString("hex"));
    decodedSpenderTx = decodedTransactions[spenderHash] || null;
    // revocations have a tx fee that influences the ROI calc
    spenderTxFee = spenderTx.getFee();
    // everything returned to the wallet after voting/revoking
    ticketReturnAmount = spenderTx.getCreditsList().reduce((a, v) => a + v.getAmount(), 0);
    leaveTimestamp = spenderTx.getTimestamp();
    spenderRawTx = Buffer.from(spenderTx.getTransaction()).toString("hex");
    // this is liquid from applicable fees (i.e, what the wallet actually made)
    ticketReward = ticketReturnAmount - ticketInvestment;
    ticketROI = ticketReward / ticketInvestment;
  }

  return {
    hash,
    spenderHash,
    ticketTx,
    spenderTx,
    decodedSpenderTx,
    decodedTicketTx: null,
    ticketPrice,
    ticketReward,
    ticketChange,
    ticketInvestment,
    // ticketTxFee is the fee for the transaction where the ticket was bought
    ticketTxFee: ticketTx.getFee(),
    ticketPoolFee,
    ticketROI,
    ticketReturnAmount,
    voteChoices,
    spenderTxFee,
    enterTimestamp: ticketTx.getTimestamp(),
    status: ticket.status,
    ticketRawTx: Buffer.from(ticketTx.getTransaction()).toString("hex"),
    leaveTimestamp,
    spenderRawTx
  };
};

const ticketSorter = (a, b) =>
  (b.leaveTimestamp || b.enterTimestamp) - (a.leaveTimestamp || a.enterTimestamp);

export const allTickets = createSelector(get(["grpc", "tickets"]), tickets =>
  tickets.map(ticketNormalizer).sort(ticketSorter)
);

const recentStakeTransactions = createSelector(
  transactionsNormalizer,
  get(["grpc", "recentStakeTransactions"]),
  (normalizer, stakeTxs) => normalizer(stakeTxs)
);

// aux map from ticket/spender hash => ticket info
const txHashToTicket = createSelector(
  allTickets,
  reduce((acc, ticket) => {
    acc[ticket.hash] = ticket;
    acc[ticket.spenderHash] = ticket;
    return acc;
  }, {})
);

export const homeHistoryTickets = createSelector(
  recentStakeTransactions,
  txHashToTicket,
  (recentStakeTransactions, txHashToTicket) => {
    return recentStakeTransactions
      .map(tx => {
        const decodedTicket = txHashToTicket[tx.txHash];
        if (!decodedTicket) {
          // ordinarily, this shouldn't happen as we should have all tickets purchases
          // and spends (votes/revocations) stored in the allTickets/txHashToTicket
          // selectors. I'm getting some errors here on some wallets while testing
          // split tickets and non-standard voting layouts, so I'm leaving this and
          // the filter for the moment.
          return null;
        }
        tx.ticketPrice = decodedTicket.ticketPrice;
        tx.status = tx.txType;
        tx.enterTimestamp = decodedTicket.enterTimestamp;
        tx.leaveTimestamp = decodedTicket.leaveTimestamp;
        tx.ticketReward = decodedTicket.ticketReward;
        return tx;
      })
      .filter(v => Boolean(v));
  }
);

export const viewableTransactions = createSelector(
  transactions,
  homeHistoryTransactions,
  homeHistoryTickets,
  (transactions, homeTransactions, homeHistoryTickets) => [
    ...transactions,
    ...homeTransactions,
    ...homeHistoryTickets
  ]
);
export const viewedTransaction = createSelector(
  viewableTransactions,
  (
    state,
    {
      match: {
        params: { txHash }
      }
    }
  ) => txHash,
  (transactions, txHash) => find({ txHash }, transactions)
);

export const ticketsPerStatus = createSelector(allTickets, tickets =>
  tickets.reduce(
    (perStatus, ticket) => {
      perStatus[ticket.status].push(ticket);
      return perStatus;
    },
    Array.from(TicketTypes.values()).reduce((a, v) => {
      a[v] = [];
      return a;
    }, {})
  )
);

export const viewedTicketListing = createSelector(
  ticketsPerStatus,
  (
    state,
    {
      match: {
        params: { status }
      }
    }
  ) => status,
  (tickets, status) => tickets[status]
);

const rescanResponse = get(["control", "rescanResponse"]);
export const rescanRequest = get(["control", "rescanRequest"]);
export const getTransactionsRequestAttempt = get(["grpc", "getTransactionsRequestAttempt"]);
export const getTicketsRequestAttempt = get(["grpc", "getTicketsRequestAttempt"]);
export const notifiedBlockHeight = get(["notifications", "currentHeight"]);

export const currentBlockHeight = get(["grpc", "currentBlockHeight"]);

export const rescanEndBlock = currentBlockHeight;
export const rescanStartBlock = compose(
  req => (req ? req.getBeginHeight() : 0),
  rescanRequest
);
export const rescanCurrentBlock = compose(
  response => (response ? response.getRescannedThrough() : 0),
  rescanResponse
);

export const rescanPercentFinished = createSelector(
  rescanCurrentBlock,
  rescanEndBlock,
  (current, end) => ((current / end) * 100).toFixed(2)
);

export const visibleAccounts = createSelector(
  unitDivisor,
  currencyDisplay,
  balances,
  (unitDivisor, currencyDisplay, balances) =>
    reduce(
      (accounts, { accountName, accountNumber, hidden, spendable, ...data }) =>
        accountName === "imported" || hidden
          ? accounts
          : [
              ...accounts,
              {
                value: accountNumber,
                label: `${accountName}: ${spendable / unitDivisor} ${currencyDisplay}`,
                name: accountName,
                spendableAndUnit: `${spendable / unitDivisor} ${currencyDisplay}`,
                spendable,
                hidden,
                ...data
              }
            ],
      [],
      balances
    )
);

export const spendingAccounts = createSelector(
  unitDivisor,
  currencyDisplay,
  balances,
  (unitDivisor, currencyDisplay, balances) =>
    reduce(
      (accounts, { accountName, accountNumber, spendable, ...data }) =>
        accountNumber !== 0 && spendable <= 0
          ? accounts
          : [
              ...accounts,
              {
                value: accountNumber,
                label: `${accountName}: ${spendable / unitDivisor} ${currencyDisplay}`,
                name: accountName,
                spendableAndUnit: `${spendable / unitDivisor} ${currencyDisplay}`,
                spendable,
                ...data
              }
            ],
      [],
      balances
    )
);

const getNextAddressResponse = get(["control", "getNextAddressResponse"]);
const nextAddressAccountNumber = compose(
  response => (response ? response.accountNumber : null),
  getNextAddressResponse
);

export const getNextAddressRequestAttempt = get(["control", "getNextAddressRequestAttempt"]);
export const nextAddressAccount = createSelector(
  visibleAccounts,
  nextAddressAccountNumber,
  (accounts, number) =>
    accounts.find(
      compose(
        eq(number),
        get("value")
      )
    )
);
export const nextAddress = compose(
  response => (response ? response.getAddress() : ""),
  getNextAddressResponse
);

export const defaultSpendingAccount = createSelector(
  spendingAccounts,
  find(
    compose(
      eq(0),
      get("value")
    )
  )
);

const constructTxResponse = get(["control", "constructTxResponse"]);
const constructTxRequestAttempt = get(["control", "constructTxRequestAttempt"]);
const signTransactionRequestAttempt = get(["control", "signTransactionRequestAttempt"]);
export const signTransactionError = get(["control", "signTransactionError"]);
const publishTransactionResponse = get(["control", "publishTransactionResponse"]);
const publishTransactionRequestAttempt = get(["control", "publishTransactionRequestAttempt"]);
const totalOutputAmount = compose(
  response => (response ? response.getTotalOutputAmount() : 0),
  constructTxResponse
);
const totalAmount = compose(
  response => (response ? response.totalAmount : 0),
  constructTxResponse
);
const totalPreviousOutputAmount = compose(
  response => (response ? response.getTotalPreviousOutputAmount() : 0),
  constructTxResponse
);

export const estimatedSignedSize = compose(
  response => (response ? response.getEstimatedSignedSize() : 0),
  constructTxResponse
);

export const unsignedTransaction = createSelector(
  constructTxResponse,
  response => (response ? response.getUnsignedTransaction() : null)
);

export const estimatedFee = compose(
  bytes => (bytes / 1000) * (0.001 * 100000000),
  estimatedSignedSize
);

export const totalSpent = createSelector(
  totalPreviousOutputAmount,
  totalOutputAmount,
  totalAmount,
  (totalPreviousOutputAmount, totalOutputAmount, totalAmount) =>
    totalPreviousOutputAmount - totalOutputAmount + totalAmount
);

export const publishedTransactionHash = compose(
  r => (r ? reverseHash(r.toString("hex")) : null),
  publishTransactionResponse
);

export const isSendingTransaction = bool(
  or(signTransactionRequestAttempt, publishTransactionRequestAttempt)
);

export const isConstructingTransaction = bool(constructTxRequestAttempt);

export const tempSettings = get(["settings", "tempSettings"]);
export const settingsChanged = get(["settings", "settingsChanged"]);
export const changePassphraseError = get(["control", "changePassphraseError"]);
export const changePassphraseSuccess = get(["control", "changePassphraseSuccess"]);

export const isSigningMessage = get(["grpc", "getSignMessageRequestAttempt"]);
export const signMessageError = get(["grpc", "getSignMessageError"]);
export const signMessageResponse = get(["grpc", "getSignMessageResponse"]);
export const signMessageSuccess = compose(
  response => (response ? response.toObject() : null),
  signMessageResponse
);

export const messageVerificationService = get(["grpc", "messageVerificationService"]);
export const isVerifyingMessage = get(["grpc", "getVerifyMessageRequestAttempt"]);
export const verifyMessageError = get(["grpc", "getVerifyMessageError"]);
export const verifyMessageResponse = get(["grpc", "getVerifyMessageResponse"]);
export const verifyMessageSuccess = compose(
  response => (response ? response.toObject() : null),
  verifyMessageResponse
);
export const validateAddressRequestAttempt = get(["control", "validateAddressRequestAttempt"]);
export const validateAddressError = get(["control", "validateAddressError"]);
export const validateAddressResponse = get(["control", "validateAddressResponse"]);
export const validateAddressSuccess = compose(
  response => (response ? response.toObject() : null),
  validateAddressResponse
);

const getStakeInfoResponse = get(["grpc", "getStakeInfoResponse"]);

export const ticketPoolSize = compose(
  response => (response ? response.getPoolSize() : 0),
  getStakeInfoResponse
);
export const votedTicketsCount = compose(
  response => (response ? response.getVoted() : 0),
  getStakeInfoResponse
);
export const allMempoolTicketsCount = compose(
  response => (response ? response.getAllMempoolTix() : 0),
  getStakeInfoResponse
);
export const missedTicketsCount = compose(
  response => (response ? response.getMissed() : 0),
  getStakeInfoResponse
);
export const ownMempoolTicketsCount = compose(
  response => (response ? response.getOwnMempoolTix() : 0),
  getStakeInfoResponse
);
export const revokedTicketsCount = compose(
  response => (response ? response.getRevoked() : 0),
  getStakeInfoResponse
);
export const immatureTicketsCount = compose(
  response => (response ? response.getImmature() : 0),
  getStakeInfoResponse
);
export const expiredTicketsCount = compose(
  response => (response ? response.getExpired() : 0),
  getStakeInfoResponse
);
export const liveTicketsCount = compose(
  response => (response ? response.getLive() : 0),
  getStakeInfoResponse
);
export const totalSubsidy = compose(
  response => (response ? response.getTotalSubsidy() : 0),
  getStakeInfoResponse
);
export const hasTicketsToRevoke = compose(
  response =>
    response ? response.getRevoked() !== response.getExpired() + response.getMissed() : 0,
  getStakeInfoResponse
);

export const ticketBuyerService = get(["grpc", "ticketBuyerService"]);
const startAutoBuyerResponse = get(["control", "startAutoBuyerResponse"]);

export const balanceToMaintain = get(["control", "balanceToMaintain"]);
export const maxFee = get(["control", "maxFee"]);
export const maxPriceRelative = get(["control", "maxPriceRelative"]);
export const maxPriceAbsolute = get(["control", "maxPriceAbsolute"]);
export const maxPerBlock = get(["control", "maxPerBlock"]);
export const getTicketBuyerConfigResponse = get(["control", "getTicketBuyerConfigResponse"]);

const getTicketPriceResponse = get(["grpc", "getTicketPriceResponse"]);

export const ticketPrice = compose(
  response => (response ? response.getTicketPrice() : 0),
  getTicketPriceResponse
);

const getAgendasResponse = get(["grpc", "getAgendasResponse"]);
export const agendas = createSelector(
  getAgendasResponse,
  response => (response ? response.getAgendasList() : [])
);

const requiredStakepoolAPIVersion = get(["grpc", "requiredStakepoolAPIVersion"]);

export const currentStakePoolConfigError = get(["stakepool", "currentStakePoolConfigError"]);
export const currentStakePoolConfigSuccessMessage = get([
  "stakepool",
  "currentStakePoolConfigSuccessMessage"
]);
export const purchaseTicketsError = get(["control", "purchaseTicketsError"]);
export const purchaseTicketsSuccess = get(["control", "purchaseTicketsSuccess"]);
export const revokeTicketsError = get(["control", "revokeTicketsError"]);
export const revokeTicketsSuccess = get(["control", "revokeTicketsSuccess"]);
export const importScriptSuccess = get(["control", "importScriptSuccess"]);
export const importScriptError = get(["control", "importScriptError"]);
export const startAutoBuyerError = get(["control", "startAutoBuyerError"]);
export const startAutoBuyerSuccess = get(["control", "startAutoBuyerSuccess"]);
export const stopAutoBuyerError = get(["control", "stopAutoBuyerError"]);
export const stopAutoBuyerSuccess = get(["control", "stopAutoBuyerSuccess"]);
export const isTicketAutoBuyerEnabled = bool(startAutoBuyerResponse);

export const currentStakePoolConfig = get(["stakepool", "currentStakePoolConfig"]);

const allStakePools = createSelector(
  currentStakePoolConfig,
  requiredStakepoolAPIVersion,
  (pools, requiredVersion) =>
    map(
      pool => ({
        ...pool,
        label: pool.Host,
        value: pool,
        isVersionValid: pool.APIVersionsSupported[1] === requiredVersion
      }),
      pools
    )
);

const networkStakePools = createSelector(allStakePools, pools => pools);

export const configuredStakePools = createSelector(networkStakePools, filter(bool(get("ApiKey"))));

export const unconfiguredStakePools = createSelector(networkStakePools, filter(not(get("ApiKey"))));

export const defaultStakePool = compose(
  get(0),
  configuredStakePools
);
export const selectedStakePool = get(["stakepool", "selectedStakePool"]);

const currentStakePoolConfigRequest = get(["stakepool", "currentStakePoolConfigRequest"]);

const purchaseTicketsRequestAttempt = get(["control", "purchaseTicketsRequestAttempt"]);

const importScriptRequestAttempt = get(["control", "importScriptRequestAttempt"]);

export const isSavingStakePoolConfig = bool(currentStakePoolConfigRequest);
export const isPurchasingTickets = bool(purchaseTicketsRequestAttempt);
export const isImportingScript = bool(importScriptRequestAttempt);

export const newUnminedMessage = get(["notifications", "newUnminedMessage"]);

export const createWalletExisting = get(["walletLoader", "createWalletExisting"]);
export const isCreatingWallet = get(["walletLoader", "walletCreateRequestAttempt"]);
export const isOpeningWallet = get(["walletLoader", "walletOpenRequestAttempt"]);

export const lastBlockTimestamp = get(["grpc", "recentBlockTimestamp"]);

export const getNextAccountSuccess = get(["control", "getNextAccountSuccess"]);
export const getNextAccountError = get(["control", "getNextAccountError"]);
export const getNextAccountRequestAttempt = get(["control", "getNextAccountRequestAttempt"]);
export const hiddenAccounts = get(["daemon", "hiddenAccounts"]);
export const renameAccountError = get(["control", "renameAccountError"]);
export const renameAccountSuccess = get(["control", "renameAccountSuccess"]);
export const renameAccountRequestAttempt = get(["control", "renameAccountRequestAttempt"]);

export const showingSidebar = get(["sidebar", "showingSidebar"]);
export const showingSidebarMenu = get(["sidebar", "showingSidebarMenu"]);
export const expandSideBar = get(["sidebar", "expandSideBar"]);

export const snackbarMessages = get(["snackbar", "messages"]);

export const mainWindow = () => window;

export const shutdownRequested = get(["daemon", "shutdownRequested"]);
export const daemonStopped = get(["daemon", "daemonStopped"]);

export const chainParams = compose(
  isTestNet => (isTestNet ? TestNetParams : MainNetParams),
  isTestNet
);

export const exportingData = get(["control", "exportingData"]);

export const location = get(["routing", "location"]);

export const voteTimeStats = get(["statistics", "voteTime"]);
export const averageVoteTime = createSelector(voteTimeStats, voteTimeStats => {
  if (!voteTimeStats || !voteTimeStats.data.length) {
    return 0;
  }
  const ticketCount = voteTimeStats.data.reduce((s, v) => s + v.series.count, 0);
  let sum = 0;
  for (let i = 0; i < voteTimeStats.data.length; i++) {
    sum += voteTimeStats.data[i].series.count * i;
  }
  return sum / ticketCount;
});
export const medianVoteTime = createSelector(voteTimeStats, voteTimeStats => {
  if (!voteTimeStats || !voteTimeStats.data.length) {
    return 0;
  }
  const ticketCount = voteTimeStats.data.reduce((s, v) => s + v.series.count, 0);
  const ticketLimit = ticketCount * 0.5;
  let sum = 0;
  for (let i = 0; i < voteTimeStats.data.length; i++) {
    sum += voteTimeStats.data[i].series.count;
    if (sum >= ticketLimit) {
      return i;
    }
  }
});
export const ninetyFifthPercentileVoteTime = createSelector(voteTimeStats, voteTimeStats => {
  if (!voteTimeStats || !voteTimeStats.data.length) {
    return 0;
  }
  const ticketCount = voteTimeStats.data.reduce((s, v) => s + v.series.count, 0);
  const ticketLimit = ticketCount * 0.95;
  let sum = 0;
  for (let i = 0; i < voteTimeStats.data.length; i++) {
    sum += voteTimeStats.data[i].series.count;
    if (sum >= ticketLimit) {
      return i;
    }
  }
});
export const getMyTicketsStatsRequest = get(["statistics", "getMyTicketsStatsRequest"]);

export const stakeROIStats = createSelector(
  dailyBalancesStats,
  unitDivisor,
  (stats, unitDivisor) => {
    const divByUnit = div(unitDivisor);
    return stats.map(({ time, series }) => ({
      time,
      stakeRewards: divByUnit(series.stakeRewards),
      stakeFees: divByUnit(series.stakeFees),
      totalStake: divByUnit(series.totalStake),
      stakeRewardROI: series.stakeRewards / series.totalStake,
      stakeFeesROI: series.stakeFees / series.totalStake
    }));
  }
);

export const modalVisible = get(["control", "modalVisible"]);

export const hasUnresolvedRequests = createSelector(
  getBalanceRequestAttempt,
  getTransactionsRequestAttempt,
  getTicketsRequestAttempt,
  getNextAddressRequestAttempt,
  constructTxRequestAttempt,
  signTransactionRequestAttempt,
  publishTransactionRequestAttempt,
  purchaseTicketsRequestAttempt,
  importScriptRequestAttempt,
  getNextAccountRequestAttempt,
  renameAccountRequestAttempt,
  isOpeningWallet,
  isSigningMessage,
  isVerifyingMessage,
  openWalletInputRequest,
  createWalletInputRequest,
  discoverAddressInputRequest,
  selectCreateWalletInputRequest,
  rescanRequest,
  getTransactionsRequestAttempt,
  getTicketsRequestAttempt,
  validateAddressRequestAttempt,
  currentStakePoolConfigRequest,
  purchaseTicketsRequestAttempt,
  shutdownRequested,
  getMyTicketsStatsRequest,
  exportingData,
  loadingStartupStats,
  (...args) => args.filter(Boolean).length > 0
);
