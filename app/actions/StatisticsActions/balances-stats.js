/* eslint no-case-declarations: off */
import * as wallet from "wallet";
import { chainParams as chainParamsSelector } from "selectors";
import { endOfDay, tsToDate, reverseRawHash } from "helpers";
import { neg } from "fp";

const differentDays = (d1, d2) =>
  d1.getYear() !== d2.getYear() || d1.getMonth() !== d2.getMonth() || d1.getDate() !== d2.getDate();

// changes in an sstx are the even-numbered, > 0 txouts
const isTicketChange = c => c.getIndex() > 0 && c.getIndex() % 2 === 0;

// a ticket "belongs" to the wallet when the wallet has the private key
// that can be used to vote/revoke the ticket (ie: if the wallet considers the
// txout with index === 0 a credit).
const isWalletTicket = tx =>
  tx.getCreditsList().length > 0 && tx.getCreditsList()[0].getIndex() === 0;

const VALUE_TYPE_EXELAMOUNT = "VALUE_TYPE_EXELAMOUNT";

export const dailyBalancesStats = (newlyMinedTransactions = []) => opts => {
  const { progressFunction, endFunction, startFunction, lastDayBalance } = opts;

  let lastDate = null;
  let balance = {
    spendable: 0,
    locked: 0,
    total: 0,
    sent: 0,
    received: 0,
    voted: 0,
    revoked: 0,
    ticket: 0
  };

  if (lastDayBalance) {
    lastDate = lastDayBalance.time;
    balance = lastDayBalance.series;
  }

  const aggStartFunction = opts => {
    opts.series = [
      ...opts.series,
      { name: "sent", type: VALUE_TYPE_EXELAMOUNT },
      { name: "received", type: VALUE_TYPE_EXELAMOUNT },
      { name: "voted", type: VALUE_TYPE_EXELAMOUNT },
      { name: "revoked", type: VALUE_TYPE_EXELAMOUNT },
      { name: "ticket", type: VALUE_TYPE_EXELAMOUNT },
      { name: "stakeRewards", type: VALUE_TYPE_EXELAMOUNT },
      { name: "stakeFees", type: VALUE_TYPE_EXELAMOUNT },
      { name: "totalStake", type: VALUE_TYPE_EXELAMOUNT }
    ];
    startFunction(opts);
  };

  const aggProgressFunction = (time, series) => {
    if (!lastDate) {
      lastDate = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    } else if (differentDays(time, lastDate)) {
      progressFunction(endOfDay(lastDate), balance);
      balance = { ...balance, sent: 0, received: 0, voted: 0, revoked: 0, ticket: 0 };
      lastDate = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    }
    const { delta } = series;
    balance = {
      ...series,
      sent: balance.sent + delta.sent,
      received: balance.received + delta.received,
      voted: balance.voted + delta.voted,
      revoked: balance.revoked + delta.revoked,
      ticket: balance.ticket + delta.ticket
    };
  };

  const aggEndFunction = () => {
    console.log("dailyBalancesStats - aggEndFunction");
    progressFunction(endOfDay(lastDate), balance);
    endFunction();
  };

  return balancesStats({
    ...opts,
    progressFunction: aggProgressFunction,
    endFunction: aggEndFunction,
    startFunction: aggStartFunction,
    newlyMinedTransactions,
    lastDayBalanceSeries: lastDayBalance ? lastDayBalance.series : null
  });
};

export function balancesStats(opts) {
  return (dispatch, getState) => {
    const {
      progressFunction,
      startFunction,
      endFunction,
      errorFunction,
      newlyMinedTransactions = [],
      lastDayBalanceSeries
    } = opts;

    const {
      currentBlockHeight,
      walletService,
      decodeMessageService,
      recentBlockTimestamp
    } = getState().grpc;

    const chainParams = chainParamsSelector(getState());

    startFunction({
      series: [
        { name: "spendable", type: VALUE_TYPE_EXELAMOUNT },
        { name: "immature", type: VALUE_TYPE_EXELAMOUNT },
        { name: "locked", type: VALUE_TYPE_EXELAMOUNT },
        { name: "immatureNonWallet", type: VALUE_TYPE_EXELAMOUNT },
        { name: "lockedNonWallet", type: VALUE_TYPE_EXELAMOUNT },
        { name: "total", type: VALUE_TYPE_EXELAMOUNT },
        { name: "stakeRewards", type: VALUE_TYPE_EXELAMOUNT },
        { name: "stakeFees", type: VALUE_TYPE_EXELAMOUNT },
        { name: "totalStake", type: VALUE_TYPE_EXELAMOUNT }
      ]
    });

    const liveTickets = {}; // live by hash
    const maturingTickets = {}; // maturing by height
    const recordTicket = (tx, commitAmount, isWallet) => {
      liveTickets[tx.txHash] = { tx, commitAmount, isWallet };
      const ticketMatureHeight = tx.height + chainParams.TicketMaturity;
      maturingTickets[ticketMatureHeight] = maturingTickets[ticketMatureHeight] || [];
      maturingTickets[ticketMatureHeight].push({ tx, commitAmount, isWallet });
    };

    // return the balance deltas from recorded tickets that matured in the
    // interval fromHeight..toHeight
    const matureTicketDeltas = (fromHeight, toHeight, fromTimestamp, toTimestamp) => {
      // largeStakeTimeDiff === true when the time+height difference to calculate
      // the maturity is so large that it's better to estimate the maturity time
      // using chainParams.TargetTimePerBlock instead of linearly interpolating
      // the time between fromTimestamp...toTimestamp
      const largeStakeTimeDiff =
        toHeight - fromHeight > chainParams.TicketMaturity &&
        toTimestamp - fromTimestamp > (toHeight - fromHeight) * chainParams.TargetTimePerBlock;

      const res = [];
      for (let h = fromHeight; h <= toHeight; h++) {
        if (!maturingTickets[h]) {
          continue;
        }
        maturingTickets[h].forEach(({ tx, commitAmount, isWallet }) => {
          let timestamp;
          if (fromHeight === toHeight) {
            // fromHeigh === toHeight === h, so toTimestamp is already the block
            // maturation timestamp
            timestamp = toTimestamp;
          } else if (largeStakeTimeDiff) {
            // this way of estimating the timestamp is better when the differences
            // between fromHeight/toHeight are bigger than the maturity period, so
            // we don't have information more accurate than TargetTimePerBlock
            timestamp = fromTimestamp + (h - fromHeight) * chainParams.TargetTimePerBlock;
          } else {
            // the next transactions all happen after after toTimestamp, so the
            // stake amount *definitely* matured on a block between these times.
            // Since we don't have a good index of blockHeight => timestamp to use,
            // estimate the maturation timestamp by linearly interpolating the
            // times as if the blocks between fromHeight...toHeight were mined in
            // regular intervals
            const blockInterval = (toTimestamp - fromTimestamp) / (toHeight - fromHeight);
            timestamp = fromTimestamp + (h - fromHeight) * blockInterval;
          }
          res.push({
            spendable: 0,
            immature: isWallet ? -commitAmount : 0,
            immatureNonWallet: isWallet ? 0 : -commitAmount,
            voted: 0,
            revoked: 0,
            sent: 0,
            received: 0,
            ticket: 0,
            locked: isWallet ? commitAmount : 0,
            lockedNonWallet: isWallet ? 0 : commitAmount,
            stakeRewards: 0,
            stakeFees: 0,
            totalStake: 0,
            timestamp,
            tx
          });
        });
      }
      return res;
    };
    // closure that calcs how much each tx affects each balance type.
    // Ticket and vote/revoke delta calculation assumes *a lot* about how tickets
    // are encoded (1st txout === ticket, odds are commitments, etc). If consensus
    // rules change the "shape" of a ticket tx in the future, this will need to be
    // heavily revised.
    const txBalancesDelta = tx => {
      // tx.amount is negative in sends/tickets/transfers already
      switch (tx.txType) {
        case wallet.TRANSACTION_TYPE_TICKET_PURCHASE:
          const change = tx.tx
            .getCreditsList()
            .reduce((s, c) => (s + isTicketChange(c) ? c.getAmount() : 0), 0);
          const isWallet = isWalletTicket(tx.tx);
          const debitsSum = tx.tx.getDebitsList().reduce((s, d) => s + d.getPreviousAmount(), 0);
          const commitAmount = debitsSum - change - (isWallet ? tx.tx.getFee() : 0);
          const spentAmount = commitAmount + (isWallet ? tx.fee : 0);
          recordTicket(tx, commitAmount, isWallet);
          const purchaseFees = debitsSum - commitAmount;
          return Promise.resolve({
            spendable: -spentAmount,
            immature: isWallet ? commitAmount : 0,
            immatureNonWallet: isWallet ? 0 : commitAmount,
            voted: 0,
            revoked: 0,
            sent: 0,
            received: 0,
            ticket: commitAmount,
            locked: 0,
            lockedNonWallet: 0,
            stakeRewards: 0,
            stakeFees: purchaseFees,
            totalStake: spentAmount,
            timestamp: tx.timestamp,
            tx
          });
        case wallet.TRANSACTION_TYPE_VOTE:
        case wallet.TRANSACTION_TYPE_REVOCATION:
          const isVote = tx.txType === wallet.TRANSACTION_TYPE_VOTE;
          return wallet
            .decodeTransaction(decodeMessageService, tx.tx.getTransaction())
            .then(async decodedSpender => {
              const spenderInputs = decodedSpender.getTransaction().getInputsList();
              const ticketHash = reverseRawHash(
                spenderInputs[spenderInputs.length - 1].getPreviousTransactionHash()
              );
              let ticket = liveTickets[ticketHash];
              if (!ticket) {
                try {
                  // try to request ticket transaction
                  const previousTxHash = spenderInputs[
                    spenderInputs.length - 1
                  ].getPreviousTransactionHash();
                  const response = await wallet.getSingleTransaction(walletService, previousTxHash);
                  const ticketTx = response.getTransaction();
                  const change = ticketTx
                    .getCreditsList()
                    .reduce((s, c) => (s + isTicketChange(c) ? c.getAmount() : 0), 0);
                  const isWallet = isWalletTicket(ticketTx);
                  const debitsSum = ticketTx
                    .getDebitsList()
                    .reduce((s, d) => s + d.getPreviousAmount(), 0);
                  const commitAmount = debitsSum - change - (isWallet ? ticketTx.getFee() : 0);
                  ticket = { isWallet: isWalletTicket(ticketTx), commitAmount };
                } catch (e) {
                  throw new Error(`Previous live ticket not found: ${ticketHash}`, e);
                }
              }
              const returnAmount = tx.tx.getCreditsList().reduce((s, c) => s + c.getAmount(), 0);
              const wasWallet = ticket.isWallet;
              const stakeResult = returnAmount - ticket.commitAmount;
              return {
                spendable: Number(returnAmount),
                locked: wasWallet ? neg(ticket.commitAmount) : 0,
                lockedNonWallet: wasWallet ? 0 : neg(ticket.commitAmount),
                voted: isVote ? returnAmount : 0,
                revoked: !isVote ? returnAmount : 0,
                sent: 0,
                received: 0,
                ticket: 0,
                immature: 0,
                immatureNonWallet: 0,
                stakeFees: isVote ? 0 : neg(stakeResult),
                stakeRewards: isVote ? stakeResult : 0,
                totalStake: 0,
                timestamp: tx.timestamp,
                tx
              };
            })
            .catch(e => {
              throw new Error(e);
            });
        case wallet.TRANSACTION_TYPE_COINBASE:
        case wallet.TRANSACTION_TYPE_REGULAR:
          return Promise.resolve({
            spendable: Number(tx.amount),
            locked: 0,
            lockedNonWallet: 0,
            voted: 0,
            revoked: 0,
            sent: tx.amount < 0 ? tx.amount : 0,
            received: tx.amount > 0 ? tx.amount : 0,
            ticket: 0,
            immature: 0,
            stakeFees: 0,
            stakeRewards: 0,
            totalStake: 0,
            immatureNonWallet: 0,
            timestamp: tx.timestamp,
            tx
          });
        default:
          return Promise.reject(new Error(`Unknown tx type: ${tx.txType}`));
      }
    };

    let currentBalance = {
      spendable: 0,
      immature: 0,
      immatureNonWallet: 0,
      locked: 0,
      lockedNonWallet: 0,
      total: 0,
      stakeRewards: 0,
      stakeFees: 0,
      totalStake: 0,
      delta: null
    };
    // running balance totals
    if (lastDayBalanceSeries) {
      currentBalance = lastDayBalanceSeries;
    }

    // account for this delta in the balances and call the progress function
    const addDelta = delta => {
      currentBalance = {
        spendable: currentBalance.spendable + delta.spendable,
        immature: currentBalance.immature + delta.immature,
        immatureNonWallet: currentBalance.immatureNonWallet + delta.immatureNonWallet,
        locked: currentBalance.locked + delta.locked,
        lockedNonWallet: currentBalance.lockedNonWallet + delta.lockedNonWallet,
        stakeRewards: currentBalance.stakeRewards + delta.stakeRewards,
        stakeFees: currentBalance.stakeFees + delta.stakeFees,
        totalStake: currentBalance.totalStake + delta.totalStake,
        delta
      };
      currentBalance.total = currentBalance.spendable + currentBalance.locked;
      progressFunction(tsToDate(delta.timestamp), currentBalance);
    };

    let lastTxHeight = 0;
    let lastTxTimestamp = chainParams.GenesisTimestamp;
    const txDataCb = async ({ mined }) => {
      for (const tx of mined) {
        const maturedDeltas = matureTicketDeltas(
          lastTxHeight + 1,
          tx.height,
          lastTxTimestamp,
          tx.timestamp
        );
        maturedDeltas.forEach(addDelta);
        const delta = await txBalancesDelta(tx);
        addDelta(delta);
        lastTxHeight = tx.height;
        lastTxTimestamp = delta.timestamp;
      }
      // check for remaining tickets that may have matured
      const maturedDeltas = matureTicketDeltas(
        lastTxHeight + 1,
        currentBlockHeight,
        lastTxTimestamp,
        recentBlockTimestamp || Date.now()
      );
      maturedDeltas.forEach(addDelta);

      endFunction();
    };

    if (newlyMinedTransactions.length) {
      try {
        txDataCb({ mined: newlyMinedTransactions });
      } catch (e) {
        throw new Error(e);
      }
    } else {
      wallet
        .getTransactions(walletService, 0, currentBlockHeight)
        .then(txDataCb)
        .catch(errorFunction);
    }
  };
}
