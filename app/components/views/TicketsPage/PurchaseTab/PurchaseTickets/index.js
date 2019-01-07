import React from "react";
import { autobind } from "core-decorators";
import { substruct, compose, eq, get, increment, decrement, or } from "fp";
import { spring } from "react-motion";
import PurchaseTicketsForm from "./Form";
import purchaseTickets from "connectors/purchaseTickets";
import PurchaseTicketsAdvanced from "./PurchaseTicketsAdvanced";
import PurchaseTicketsQuickBar from "./PurchaseTicketsQuickBar";
import { injectIntl } from "react-intl";
import { isNullOrUndefined } from "util";

const MAX_POSSIBLE_FEE_INPUT = 0.1;

const numTicketsValid = or(
  compose(
    x => !x,
    x => isNaN(x) || eq(0)(x),
    parseInt
  ),
  eq("")
);

const processTicketNum = compose(
  increment,
  parseInt,
  x => (x ? x : 0)
);

@autobind
class PurchaseTickets extends React.Component {
  state = {
    ticketFeeError: false,
    txFeeError: false,
    expiryError: false,
    isShowingAdvanced: false,
    numTicketsToBuy: 1,
    ticketFee: 0.001, // EXCC/kB
    txFee: 0.001, // EXCC/kB
    conf: 0,
    expiry: 16
  };

  getQuickBarComponent() {
    const { getStakePool } = this;
    const { ticketFee, txFee, expiry } = this.state;
    return [
      {
        data: (
          <PurchaseTicketsQuickBar
            {...{
              stakePool: getStakePool(),
              ticketFee,
              txFee,
              expiry
            }}
          />
        ),
        key: "output_0",
        style: {
          height: spring(73),
          opacity: 1
        }
      }
    ];
  }

  getAdvancedComponent() {
    const v = e => e.target.value;
    const changeTicketFee = e => this.onChangeTicketFee(v(e));
    const changeTxFee = e => this.onChangeTxFee(v(e));
    const changeExpiry = e => this.onChangeExpiry(v(e));
    const {
      configuredStakePools,
      onShowStakePoolConfig,
      onChangeStakePool,
      intl: { formatMessage }
    } = this.props;
    const { ticketFee, txFee, expiry, ticketFeeError, txFeeError, expiryError } = this.state;
    return [
      {
        data: (
          <PurchaseTicketsAdvanced
            {...{
              configuredStakePools,
              stakePool: this.getStakePool(),
              ticketFee,
              txFee,
              expiry,
              ticketFeeError,
              txFeeError,
              expiryError,
              onShowStakePoolConfig,
              onChangeStakePool,
              onChangeTicketFee: changeTicketFee,
              onChangeTxFee: changeTxFee,
              onChangeExpiry: changeExpiry,
              formatMessage
            }}
          />
        ),
        key: "output_1",
        style: {
          height: spring(258, { stiffness: 170, damping: 17 }),
          opacity: spring(1, { stiffness: 120, damping: 17 })
        }
      }
    ];
  }

  willEnter(height) {
    return {
      height,
      opacity: 0
    };
  }

  willLeave() {
    return {
      height: 0,
      opacity: 0
    };
  }

  render() {
    return (
      <PurchaseTicketsForm
        {...{
          ...this.props,
          ...this.state,
          canAffordTickets: this.getCanAffordTickets(),
          account: this.getAccount(),
          ...substruct(
            {
              onToggleShowAdvanced: null,
              onIncrementNumTickets: null,
              onDecrementNumTickets: null,
              onChangeNumTickets: null,
              onChangeAccount: null,
              onPurchaseTickets: null,
              getQuickBarComponent: null,
              getAdvancedComponent: null,
              willEnter: null,
              willLeave: null
            },
            this
          )
        }}
      />
    );
  }

  getStakePool() {
    const pool = this.props.onChangeStakePool ? this.props.stakePool : this.state.stakePool;
    return pool
      ? this.props.configuredStakePools.find(
          compose(
            eq(pool.Host),
            get("Host")
          )
        )
      : null;
  }

  getAccount() {
    const account = this.props.onChangeAccount ? this.props.account : this.state.account;
    return (
      account &&
      this.props.spendingAccounts.find(
        compose(
          eq(account.value),
          get("value")
        )
      )
    );
  }

  getCanAffordTickets() {
    return (
      this.getAccount() &&
      this.getAccount().spendable > this.props.ticketPrice * this.state.numTicketsToBuy
    );
  }

  onHideAdvanced() {
    this.setState({ isShowingAdvanced: false });
  }

  onShowAdvanced() {
    this.setState({ isShowingAdvanced: true });
  }

  onToggleShowAdvanced() {
    if (this.state.isShowingAdvanced) {
      this.onHideAdvanced();
    } else {
      this.onShowAdvanced();
    }
  }

  onChangeAccount(account) {
    const { onChangeAccount } = this.props;
    this.setState({ account });
    if (onChangeAccount) {
      onChangeAccount(account);
    }
  }

  onIncrementNumTickets() {
    this.setState(state => ({ numTicketsToBuy: processTicketNum(state.numTicketsToBuy) }));
  }

  onChangeNumTickets(numTicketsToBuy) {
    if (numTicketsValid(numTicketsToBuy)) {
      this.setState({ numTicketsToBuy });
    }
  }

  onDecrementNumTickets() {
    this.setState(state => {
      const parsedNumTickets = parseInt(state.numTicketsToBuy);
      return {
        numTicketsToBuy:
          parsedNumTickets <= 1 || !parsedNumTickets ? 1 : decrement(parsedNumTickets)
      };
    });
  }

  getIsValid() {
    if (!this.getCanAffordTickets()) {
      return false;
    }
    if (this.getErrors()) {
      return false;
    }
    return true;
  }

  onPurchaseTickets(privpass) {
    const { onPurchaseTickets } = this.props;
    if (!this.getIsValid() || !privpass) {
      return;
    }
    if (onPurchaseTickets) {
      const { conf, numTicketsToBuy, expiry, ticketFee, txFee } = this.state;
      onPurchaseTickets(
        privpass,
        this.getAccount().value,
        this.getAccount().spendable,
        conf,
        numTicketsToBuy,
        expiry,
        ticketFee,
        txFee,
        this.getStakePool().value
      );
    }
  }

  onChangeTicketFee(ticketFee) {
    const ticketFeeError =
      isNaN(ticketFee) || ticketFee <= 0 || ticketFee >= MAX_POSSIBLE_FEE_INPUT;
    this.setState({
      ticketFee: ticketFee.replace(/[^\d.]/g, ""),
      ticketFeeError
    });
  }

  onChangeTxFee(txFee) {
    const txFeeError = isNaN(txFee) || txFee <= 0 || txFee >= MAX_POSSIBLE_FEE_INPUT;
    this.setState({
      txFee: txFee.replace(/[^\d.]/g, ""),
      txFeeError
    });
  }

  onChangeExpiry(expiry) {
    const expiryError = isNaN(expiry) || expiry < 0 || isNullOrUndefined(expiry) || expiry === "";
    this.setState({
      expiry: expiry.replace(/[^\d.]/g, ""),
      expiryError
    });
  }

  getErrors() {
    const { ticketFeeError, txFeeError, expiryError } = this.state;
    return ticketFeeError || txFeeError || expiryError;
  }
}

export default injectIntl(purchaseTickets(PurchaseTickets));
