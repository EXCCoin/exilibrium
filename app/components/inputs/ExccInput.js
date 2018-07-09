import FloatInput from "./FloatInput";
import IntegerInput from "./IntegerInput";
import { strToExccExels } from "helpers/strings";
import balanceConnector from "connectors/balance";

/**
 * FixedExccInput is a simple numeric input that is assumed to **always** hold
 * a floating point number representing a EXCC amount (ie, an amount that
 * will be mutiplied by 1e8 to get to the actual exels value).
 *
 * This is **not** affected by the global currencyDisplay state.
 *
 * Whenever possible, use the ExccInput component, as it is more flexible and
 * already manages the underlying input value in exels.
 */
export const FixedExccInput = ({ currencyDisplay, ...props }) => (
  <FloatInput {...{ ...props, unit: currencyDisplay, maxFracDigits: 8 }} />
);

/**
 * ExccInput provides a way to receive excc amount inputs. Instead of the usual
 * value/onChange pair, it uses amount/onChangeAmount to track values in excc
 * exels, correctly accounting for the currently used currencyDisplay, floating
 * convertions, etc.
 *
 * It tracks 2 different values: the typed input in the text box (which may
 * contain decimal and eventually thousands separator) and the actual input
 * amount in **EXELS** (as required by various wallet operations).
 */
@autobind
class ExccInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.amountToDisplayStr(props.amount) };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.amount && !this.state.value) {
      //ignore when emptying or setting to 0
      return;
    }

    if (nextProps.amount !== this.props.amount) {
      this.setState({ value: this.amountToDisplayStr(nextProps.amount) });
    }
  }

  amountToDisplayStr(amount) {
    if (!amount) {
      return amount;
    }
    const { unitDivisor } = this.props;
    return amount / unitDivisor;
  }

  changeAmount(value) {
    const { unitDivisor, amount: currentAmount, onChangeAmount } = this.props;
    const amount = !value ? 0 : strToExccExels(value, unitDivisor);
    if (amount !== currentAmount) {
      if (onChangeAmount) {
        this.props.onChangeAmount(amount);
      }
    }
  }

  onChange(e) {
    const { value } = e.target;
    if (value) {
      // pre-validate if <= max supply

      const amount = strToExccExels(value, this.props.unitDivisor);
      // TODO: move to a global constant
      if (amount > 21e14) {
        return;
      }
    }

    if (value !== this.state.value) {
      this.setState({ value }, () => this.changeAmount(value));
    }
  }

  render() {
    const { unitDivisor, currencyDisplay } = this.props;
    const maxFracDigits = Math.log10(unitDivisor);

    const Comp = unitDivisor !== 1 ? FloatInput : IntegerInput;
    return (
      <Comp
        {...this.props}
        unit={currencyDisplay}
        value={this.state.value}
        onChange={this.onChange}
        maxFracDigits={maxFracDigits}
      />
    );
  }
}

export default balanceConnector(ExccInput);
