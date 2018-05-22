import NumericInput from "./NumericInput";
import { restrictToStdDecimalNumber, limitFractionalDigits } from "helpers/strings";

const FloatInput = ({ maxFracDigits, onChange: changeHandler, ...props }) => {
  let { value } = props;

  const onChange = e => {
    let newValue = restrictToStdDecimalNumber(e.target.value);
    newValue = maxFracDigits ? limitFractionalDigits(newValue, maxFracDigits) : newValue;
    if (value !== newValue) {
      value = newValue;
      e.target.value = newValue;
      if (changeHandler) {
        changeHandler(e);
      }
    }
  };

  return <NumericInput {...props} onChange={onChange} value={value} />;
};

export default FloatInput;
