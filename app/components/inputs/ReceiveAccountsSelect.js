import AccountsSelect from "./AccountsSelect";
import { receiveAccountsSelect } from "connectors";

@autobind
class ReceiveAccountsSelect extends React.Component {
  render() {
    return (
      <AccountsSelect
        {...{
          ...this.props,
          onChange: this.onChangeAccount,
          accountsType: "visible"
        }}
      />
    );
  }

  onChangeAccount(account) {
    const { onChange, getNextAddressAttempt } = this.props;
    if (onChange) {
      onChange(account);
    }
    getNextAddressAttempt(account.value);
  }
}

export default receiveAccountsSelect(ReceiveAccountsSelect);
