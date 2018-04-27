import Input from "./Input";

// AddressInput is an input that restricts values to a excc address
// doesn't do validation yet, but may in the future
const AddressInput = ({ ...props }) =>
  <Input {...{ ...props }} />;

export default AddressInput;
