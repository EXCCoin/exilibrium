import * as wallet from "wallet";
import * as selectors from "selectors";
import fs from "fs";
import { isNumber, isNullOrUndefined, isUndefined } from "util";
import { tsToDate, endOfDay, formatLocalISODate } from "helpers";
import { divideLast } from "fp";

import { dailyBalancesStats } from "./balances-stats";

const VALUE_TYPE_EXELAMOUNT = "VALUE_TYPE_EXELAMOUNT";
const VALUE_TYPE_DATETIME = "VALUE_TYPE_DATETIME";

export const GETSTARTUPSTATS_ATTEMPT = "GETSTARTUPSTATS_ATTEMPT";
export const GETSTARTUPSTATS_SUCCESS = "GETSTARTUPSTATS_SUCCESS";
export const GETSTARTUPSTATS_FAILED = "GETSTARTUPSTATS_FAILED";

// Calculates all startup statistics
export const getStartupStats = (minedTransactions = [], fullBalances) => dispatch => {

  const startupStats = {
    calcFunction: dailyBalancesStats(minedTransactions),
    initialBalance: fullBalances
  };

  dispatch({ type: GETSTARTUPSTATS_ATTEMPT });
  return dispatch(generateStat(startupStats))
    .then(dailyBalances => {
      // the `dailyBalances` returns only days when there was a change in
      // some of the balances, so we need to fill the gaps of days without
      // changes with the previous balance, taking care to set sent/received
      // balances to 0
      const last15Days = dailyBalances.data.slice(-15);
      const lastBalances = [];

      const date = endOfDay(new Date());
      date.setDate(date.getDate() - 14);

      let idx = 0;
      for (let i = 0; i < 15; i++) {
        while (idx < last15Days.length - 1 && last15Days[idx + 1].time <= date) {
          idx++;
        }
        if (last15Days[idx].time.getTime() === date.getTime()) {
          lastBalances.push(last15Days[idx]);
        } else if (last15Days[idx].time.getTime() > date.getTime()) {
          // newish wallet without balance
          lastBalances.push({
            series: {
              locked: 0,
              lockedNonWallet: 0,
              available: 0,
              total: 0,
              sent: 0,
              received: 0,
              voted: 0,
              revoked: 0,
              ticket: 0
            },
            time: new Date(date)
          });
        } else {
          lastBalances.push({
            series: {
              ...last15Days[idx].series,
              sent: 0,
              received: 0,
              voted: 0,
              revoked: 0,
              ticket: 0
            },
            time: new Date(date)
          });
        }
        date.setDate(date.getDate() + 1);
      }
      dispatch({
        dailyBalances: lastBalances,
        fullBalances: dailyBalances,
        type: GETSTARTUPSTATS_SUCCESS
      });
    })
    .catch(error => {
      dispatch({ error, type: GETSTARTUPSTATS_FAILED });
    });
};

export const GETMYTICKETSSTATS_ATTEMPT = "GETMYTICKETSSTATS_ATTEMPT";
export const GETMYTICKETSSTATS_SUCCESS = "GETMYTICKETSSTATS_SUCCESS";
export const GETMYTICKETSSTATS_FAILED = "GETMYTICKETSSTATS_FAILED";

export const getMyTicketsStats = () => dispatch => {
  const startupStats = [{ calcFunction: voteTimeStats }];

  dispatch({ type: GETMYTICKETSSTATS_ATTEMPT });
  return Promise.all(startupStats.map(s => dispatch(generateStat(s))))
    .then(([voteTime]) => {
      dispatch({ voteTime, type: GETMYTICKETSSTATS_SUCCESS });
    })
    .catch(error => dispatch({ error, type: GETMYTICKETSSTATS_FAILED }));
};

// generateStat starts generating the statistic as defined on the opts. It
// returns a promise that gets resolved with all the data in-memory after the
// stat has been completely calculated.
export const generateStat = opts => dispatch =>
  new Promise((resolve, reject) => {
    const { calcFunction, initialBalance } = opts;
    let previousBalances = null;
    let last = null;
    if (initialBalance) {
      [previousBalances, last] = divideLast(initialBalance.data);
    }
    //const [previousBalances, last] = divideLast(initialBalance.data);
    const stat = previousBalances
      ? { series: initialBalance.series, data: previousBalances }
      : {
          series: null,
          data: []
        };
    const startFunction = opts => {
      stat.series = opts.series;
    };
    const endFunction = () => {
      resolve(stat);
    };

    const errorFunction = error => {
      reject(error);
    };
    const progressFunction = (time, series) => {
      stat.data.push({ time, series });
    };

    dispatch(
      calcFunction({
        opts,
        startFunction,
        progressFunction,
        endFunction,
        errorFunction,
        lastDayBalance: last
      })
    );
  });

export const EXPORT_STARTED = "EXPORT_STARTED";
export const EXPORT_COMPLETED = "EXPORT_COMPLETED";
export const EXPORT_ERROR = "EXPORT_ERROR";

export const exportStatToCSV = opts => (dispatch, getState) => {
  const { calcFunction, csvFilename } = opts;

  let fd = null;
  let allSeries = null;
  let seriesOpts = null;

  // constants (may be overriden/parametrized in the future)
  const unitDivisor = selectors.unitDivisor(getState());
  const vsep = ","; // value separator
  const ln = "\n"; // line separator
  const precision = Math.ceil(Math.log10(unitDivisor)); // maximum decimal precision

  // formatting functions
  const quote = v => `"${v.replace('"', '\\"')}"`;
  const formatTime = v => (v ? formatLocalISODate(v) : "");
  const csvValue = v => (isNullOrUndefined(v) ? "" : isNumber(v) ? v.toFixed(precision) : quote(v));
  const csvLine = values => values.map(csvValue).join(vsep);

  const seriesValueFormatFunc = series => {
    if (series.type === VALUE_TYPE_EXELAMOUNT) {
      return v => v / unitDivisor;
    } else if (series.type === VALUE_TYPE_DATETIME) {
      return formatTime;
    }
    return v => v;
  };

  // called once at the start of the stats calc function
  const startFunction = opts => {
    dispatch({ type: EXPORT_STARTED });
    allSeries = opts.series.map(s => ({ ...s, valueFormatFunc: seriesValueFormatFunc(s) }));
    seriesOpts = opts;
    const seriesNames = allSeries.map(s => s.name);
    const headerLine = csvLine(["time", ...seriesNames]);

    fd = fs.openSync(csvFilename, "w", 0o600);
    fs.writeSync(fd, headerLine);
    fs.writeSync(fd, ln);
  };

  // called once for each data line
  const progressFunction = (time, series) => {
    const values = allSeries.map(
      s => (!isUndefined(series[s.name]) ? s.valueFormatFunc(series[s.name]) : null)
    );

    if (!seriesOpts.noTimestamp) {
      values.unshift(formatTime(time));
    }
    const line = csvLine(values);
    fs.writeSync(fd, line);
    fs.writeSync(fd, ln);
  };

  const errorFunction = error => {
    dispatch({ error, type: EXPORT_ERROR });
    if (fd) {
      fs.closeSync(fd);
      fd = null;
    }
  };

  // called once at the end
  const endFunction = () => {
    dispatch({ filename: csvFilename, type: EXPORT_COMPLETED });
    if (fd) {
      fs.closeSync(fd);
      fd = null;
    }
  };

  dispatch(calcFunction({ opts, startFunction, progressFunction, endFunction, errorFunction }));
};

export const transactionStats = opts => (dispatch, getState) => {
  const { progressFunction, startFunction, endFunction, errorFunction } = opts;

  const { currentBlockHeight, walletService } = getState().grpc;

  startFunction({
    series: [
      { name: "hash" },
      { name: "type" },
      { name: "direction" },
      { name: "fee", type: VALUE_TYPE_EXELAMOUNT },
      { name: "amount", type: VALUE_TYPE_EXELAMOUNT },
      { name: "credits", type: VALUE_TYPE_EXELAMOUNT },
      { name: "debits", type: VALUE_TYPE_EXELAMOUNT }
    ]
  });

  const formatTx = tx => {
    return {
      hash: tx.txHash,
      type: tx.txType,
      direction: tx.direction,
      fee: tx.fee,
      amount: tx.amount,
      credits: tx.tx.getCreditsList().reduce((s, c) => s + c.getAmount(), 0),
      debits: tx.tx.getDebitsList().reduce((s, d) => s + d.getPreviousAmount(), 0)
    };
  };

  const txDataCb = mined => {
    mined.forEach(tx => progressFunction(tsToDate(tx.timestamp), formatTx(tx)));
  };

  wallet
    .streamGetTransactions(walletService, 0, currentBlockHeight, 0, txDataCb)
    .then(endFunction)
    .catch(errorFunction);
};

export const voteTimeStats = opts => (dispatch, getState) => {
  const chainParams = selectors.chainParams(getState());
  const { progressFunction, endFunction, startFunction, errorFunction } = opts;
  const { currentBlockHeight, walletService } = getState().grpc;

  const blocksPerDay = (60 * 60 * 24) / chainParams.TargetTimePerBlock;
  const expirationDays = Math.ceil(
    (chainParams.TicketExpiry + chainParams.TicketMaturity) / blocksPerDay
  );
  const dayBuckets = Array(expirationDays + 1).fill(0);

  startFunction({
    series: [{ name: "daysToVote" }, { name: "count" }],
    noTimestamp: true
  });

  const txDataCb = tickets => {
    tickets.forEach(t => {
      if (t.status !== "voted") {
        return;
      }
      const daysToVote = Math.floor(
        (t.spender.getTimestamp() - t.ticket.getTimestamp()) / (24 * 60 * 60)
      );
      dayBuckets[daysToVote] += 1;
    });

    dayBuckets.forEach((count, daysToVote) => {
      progressFunction(null, { daysToVote, count });
    });

    endFunction();
  };

  wallet
    .getTickets(walletService, 0, currentBlockHeight)
    .then(txDataCb)
    .catch(errorFunction);
};

export const ticketStats = opts => (dispatch, getState) => {
  const { progressFunction, endFunction, startFunction, errorFunction } = opts;
  const { currentBlockHeight, walletService } = getState().grpc;

  startFunction({
    series: [
      { name: "spenderTimestamp", type: VALUE_TYPE_DATETIME },
      { name: "status" },
      { name: "ticketHash" },
      { name: "spenderHash" },
      { name: "sentAmount", type: VALUE_TYPE_EXELAMOUNT },
      { name: "returnedAmount", type: VALUE_TYPE_EXELAMOUNT }
    ]
  });

  const normalizeTicket = selectors.ticketNormalizer(getState());
  const txDataCb = tickets => {
    tickets.forEach(t => {
      const ticket = normalizeTicket(t);
      progressFunction(tsToDate(ticket.enterTimestamp), {
        spenderTimestamp: ticket.leaveTimestamp ? tsToDate(ticket.leaveTimestamp) : null,
        status: ticket.status,
        ticketHash: ticket.hash,
        spenderHash: ticket.spenderHash,
        sentAmount: ticket.ticketInvestment,
        returnedAmount: ticket.ticketReturnAmount
      });
    });

    endFunction();
  };

  wallet
    .getTickets(walletService, 0, currentBlockHeight)
    .then(txDataCb)
    .catch(errorFunction);
};
