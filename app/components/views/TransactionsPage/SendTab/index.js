import { compose, not, eq, get } from "fp";
import { service, settings, send } from "connectors";
import SendPage from "./Page";
import ErrorScreen from "ErrorScreen";
import { FormattedMessage as T } from "react-intl";
import { spring, presets } from "react-motion";
import OutputRow from "./OutputRow";
import { DescriptionHeader } from "layout";

const BASE_OUTPUT = { destination: "", amount: null };

export const SendTabHeader = service(({ isTestNet }) => (
  <DescriptionHeader
    description={
      isTestNet ? (
        <T
          id="transactions.description.send.testnet"
          m={"Testnet Exchange Coin addresses always begin with letter T"}
        />
      ) : (
        <T
          id="transactions.description.send.mainnet"
          m={"Mainnet Exchange Coin addresses always begin with number 2"}
        />
      )
    }
  />
));

@autobind
class Send extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      isShowingConfirm: false,
      isSendAll: false,
      isSendSelf: false,
      hastAttemptedConstruct: false,
      account: this.props.defaultSpendingAccount,
      outputs: [{ key: "output_0", data: { ...BASE_OUTPUT } }],
      outputAccount: this.props.defaultSpendingAccount
    };
  }

  componentDidUpdate(prevProps) {
    const { nextAddress } = prevProps;
    const { isSendSelf, outputs } = this.state;
    if (isSendSelf && nextAddress !== this.props.nextAddress) {
      const newOutputs = outputs.map(o => ({
        ...o,
        data: { ...o.data, destination: this.props.nextAddress }
      }));
      this.setState({ outputs: newOutputs }, this.onAttemptConstructTransaction);
    }
  }

  componentWillUnmount() {
    this.props.onClearTransaction();
  }

  render() {
    const {
      onChangeAccount,
      onAttemptSignTransaction,
      onClearTransaction,
      onShowConfirm,
      onShowSendAll,
      onHideSendAll,
      onShowSendSelf,
      onShowSendOthers,
      onAttemptConstructTransaction,
      onAddOutput,
      onRebroadcastUnmined,
      getOnRemoveOutput,
      getOnChangeOutputDestination,
      getOnChangeOutputAmount,
      getAddressError,
      getAmountError,
      willEnter,
      willLeave,
      getStyles,
      getDefaultStyles
    } = this;
    const isValid = this.getIsValid();

    return !this.props.walletService ? (
      <ErrorScreen />
    ) : (
      <SendPage
        {...{ ...this.props, ...this.state }}
        {...{
          isValid,
          onChangeAccount,
          onAttemptSignTransaction,
          onClearTransaction,
          onShowConfirm,
          onShowSendAll,
          onHideSendAll,
          onShowSendSelf,
          onShowSendOthers,
          onAttemptConstructTransaction,
          onAddOutput,
          onRebroadcastUnmined,
          getOnRemoveOutput,
          getOnChangeOutputDestination,
          getOnChangeOutputAmount,
          getAddressError,
          getAmountError,
          willEnter,
          willLeave,
          getStyles,
          getDefaultStyles
        }}
      />
    );
  }

  getDefaultStyles() {
    return this.state.outputs.map(output => ({ ...output, style: { height: 0, opacity: 1 } }));
  }

  getStyles() {
    const { outputs, isSendAll } = this.state;
    const { totalSpent } = this.props;
    return outputs.map((output, index) => {
      return {
        data: (
          <OutputRow
            {...{ index, outputs, ...this.props, ...output.data, isSendAll, totalSpent }}
            addressError={this.getAddressError(index)}
            amountError={this.getAmountError(index)}
            getOnChangeOutputDestination={this.getOnChangeOutputDestination}
            getOnChangeOutputAmount={this.getOnChangeOutputAmount}
            onAddOutput={this.onAddOutput}
            getOnRemoveOutput={this.getOnRemoveOutput(index)}
          />
        ),
        key: `output_${index}`,
        style: {
          height: spring(60, presets.gentle),
          opacity: spring(1, presets.gentle)
        }
      };
    });
  }

  willEnter() {
    return {
      height: 0,
      opacity: 0
    };
  }

  willLeave() {
    return {
      height: spring(0),
      opacity: spring(0, { stiffness: 210, damping: 20 })
    };
  }

  onChangeAccount(account) {
    this.setState({ account }, this.onAttemptConstructTransaction);
  }

  onAttemptSignTransaction(privpass) {
    const {
      unsignedTransaction,
      onAttemptSignTransaction,
      getNextAddressAttempt,
      nextAddressAccount
    } = this.props;
    if (!privpass || !this.getIsValid()) {
      return;
    }
    if (onAttemptSignTransaction) {
      onAttemptSignTransaction(privpass, unsignedTransaction);
    }
    if (getNextAddressAttempt && nextAddressAccount) {
      getNextAddressAttempt(nextAddressAccount.value);
    }
    this.onClearTransaction();
  }

  onClearTransaction() {
    this.setState(this.getInitialState());
    this.props.onClearTransaction();
  }
  onShowSendAll() {
    const { account, outputs } = this.state;
    const newOutputs = [{ ...outputs[0], data: { ...outputs[0].data, amount: account.spendable } }];
    this.setState({ isSendAll: true, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }
  onHideSendAll() {
    const { outputs } = this.state;
    const newOutputs = [{ ...outputs[0], data: { ...outputs[0].data, amount: null } }];
    this.setState({ isSendAll: false, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }
  onShowConfirm() {
    if (!this.getIsValid()) {
      return;
    }
    this.setState({ isShowingConfirm: true });
  }
  onShowSendSelf() {
    const { outputs } = this.state;
    const newOutputs = [
      { ...outputs[0], data: { destination: this.props.nextAddress, amount: null } }
    ];
    this.setState({ isSendSelf: true, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }
  onShowSendOthers() {
    const { outputs } = this.state;
    const newOutputs = [{ ...outputs[0], data: { ...BASE_OUTPUT } }];
    this.setState({ isSendSelf: false, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }

  onAttemptConstructTransaction() {
    const { onAttemptConstructTransaction } = this.props;
    const confirmations = 0;
    if (this.getHasEmptyFields()) {
      return;
    }
    this.setState({ hastAttemptedConstruct: true });
    if (this.getIsInvalid()) {
      return;
    }

    if (!this.getIsSendAll()) {
      if (onAttemptConstructTransaction) {
        onAttemptConstructTransaction(
          this.state.account.value,
          confirmations,
          this.state.outputs.map(({ data }) => ({
            amount: data.amount,
            destination: data.destination
          }))
        );
      }
    } else if (onAttemptConstructTransaction) {
      onAttemptConstructTransaction(
        this.state.account.value,
        confirmations,
        this.state.outputs,
        true
      );
    }
  }

  onAddOutput() {
    const { outputs } = this.state;
    this.setState({
      outputs: [...outputs, { key: `output_${outputs.length}`, data: { ...BASE_OUTPUT } }]
    });
  }

  onRebroadcastUnmined() {
    const { publishUnminedTransactions } = this.props;
    if (publishUnminedTransactions) {
      publishUnminedTransactions();
    }
  }

  getOnRemoveOutput(key) {
    return () =>
      this.setState(
        {
          outputs: this.state.outputs.filter(
            compose(
              not(eq(`output_${key}`)),
              get("key")
            )
          )
        },
        this.onAttemptConstructTransaction
      );
  }

  getOnChangeOutputDestination(key) {
    return destination => {
      let destinationInvalid = false;
      const updateDestinationState = () => {
        this.setState(
          {
            outputs: this.state.outputs.map(
              o =>
                o.key === `output_${key}`
                  ? {
                      ...o,
                      data: {
                        ...o.data,
                        destination,
                        destinationInvalid
                      }
                    }
                  : o
            )
          },
          this.onAttemptConstructTransaction
        );
      };

      this.props
        .validateAddress(destination)
        .then(resp => {
          destinationInvalid = !resp.getIsValid();
          updateDestinationState();
        })
        .catch(() => {
          destinationInvalid = false;
          updateDestinationState();
        });
    };
  }

  getOnChangeOutputAmount(key) {
    return newAmount => {
      let reconstruct = false;
      return this.setState(
        {
          outputs: this.state.outputs.map(o => {
            if (o.key !== `output_${key}`) {
              return o;
            }
            reconstruct = newAmount !== o.data.amount;
            return {
              ...o,
              data: {
                ...o.data,
                amount: newAmount
              }
            };
          })
        },
        () => reconstruct && this.onAttemptConstructTransaction()
      );
    };
  }

  getIsInvalid() {
    return Boolean(
      this.state.outputs.find(
        (o, index) => this.getAddressError(index) || this.getAmountError(index)
      )
    );
  }

  getHasEmptyFields() {
    return Boolean(
      this.state.outputs.find(
        ({ data: { destination, amount } }) => !destination || (!amount && !this.state.isSendAll)
      )
    );
  }

  getIsValid() {
    return Boolean(
      !this.getIsInvalid() &&
        this.props.unsignedTransaction &&
        !this.props.isConstructingTransaction
    );
  }
  getIsSendAll() {
    return this.state.isSendAll;
  }
  getIsSendSelf() {
    return this.state.isSendSelf;
  }
  getAddressError(key) {
    const { outputs } = this.state;
    const { destination, destinationInvalid } = outputs[key].data;
    if (!destination || destinationInvalid) {
      return <T id="send.errors.invalidAddress" m="*Please enter a valid address" />;
    }
  }

  getAmountError(key) {
    const { outputs, isSendAll } = this.state;
    const { amount } = outputs[key].data;
    if (isNaN(amount) && !isSendAll) {
      return <T id="send.errors.invalidAmount" m="*Please enter a valid amount" />;
    }
    if (amount <= 0 && !isSendAll) {
      return <T id="send.errors.negativeAmount" m="*Please enter a valid amount (> 0)" />;
    }
  }
}

export default service(settings(send(Send)));
