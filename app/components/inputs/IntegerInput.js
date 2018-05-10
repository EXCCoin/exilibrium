import NumericInput from "./NumericInput";

const IntegerInput = ({ value, onChange: changeHandler, ...props }) => {
  const onChange = e => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");
    if (value !== newValue) {
      value = newValue;
      e.target.value = newValue;
      changeHandler && changeHandler(e);
    }
  };

  return <NumericInput {...props} onChange={onChange} value={value} />;
};

export default IntegerInput;
