import { Component } from "react";
import PropTypes from "prop-types";
import sjcl from "sjcl";

@autobind
class Decryptor extends Component {
  static propTypes = {
    validator: PropTypes.shape({
      validateKeys: PropTypes.func.isRequired,
      resetErrorMessage: PropTypes.func.isRequired,
      decryptionFailed: PropTypes.func.isRequired
    }),
    encryptedString: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }
  getInitialState() {
    return {
      encryptionPassword: "",
      mnemonic: [],
      mnemonicHasPassphrase: false
    };
  }
  resetState() {
    this.setState(this.getInitialState());
  }
  onPasswordChange(e) {
    this.setState({ encryptionPassword: e.target.value });
  }
  decrypt() {
    const { validator, encryptedString } = this.props;
    const { encryptionPassword } = this.state;
    try {
      const decrypted = sjcl.decrypt(encryptionPassword, encryptedString);
      const privateKeysObject = JSON.parse(decrypted);
      const { mnemonic, mnemonicHasPassphrase } = privateKeysObject;
      this.setState({
        mnemonic: mnemonic.split(" "),
        mnemonicHasPassphrase
      });
      validator.resetErrorMessage();
    } catch (e) {
      validator.decryptionFailed(e);
    }
  }

  render() {
    const { mnemonic, mnemonicHasPassphrase, encryptionPassword } = this.state;
    const { decrypt, onPasswordChange, resetState } = this;
    return this.props.children({
      decryptor: { decrypt, onPasswordChange, resetState },
      mnemonic,
      encryptionPassword,
      mnemonicHasPassphrase
    });
  }
}

export default Decryptor;
