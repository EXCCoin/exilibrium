import Modal from "../Modal";
import { SlateGrayButton, KeyBlueButton } from "buttons";
import { TextInput } from "inputs";
import { FormattedMessage as T } from "react-intl";

@autobind
export default class PrivKeyImportModal extends React.Component {
  state = {
    privKey: "",
    passphrase: ""
  };
  onChangePrivKey(e) {
    this.setState({ privKey: e.target.value });
  }
  onChangePassphrase(e) {
    this.setState({ passphrase: e.target.value });
  }
  onImportPrivateKey(e) {
    e.preventDefault();
    const { privKey, passphrase } = this.state;
    const { importPrivateKeyAttempt, importedAccount, onSubmit } = this.props;
    if (privKey && passphrase) {
      importPrivateKeyAttempt(passphrase, importedAccount.accountNumber, privKey, true, 0);
      this.setState({ privKey: "", passphrase: "" });
      onSubmit();
    }
  }
  render() {
    const { onCancelModal, show } = this.props;
    return (
      <Modal className="mining-modal" {...{ show }}>
        <div className="mining-modal-header">
          <div className="mining-modal-header-title">
            <T id="privKeyImportModal.title" m="Import single private key" />
          </div>
          <SlateGrayButton className="mining-modal-close-button" onClick={onCancelModal}>
            <T id="infoModal.btnClose" m="Close" />
          </SlateGrayButton>
        </div>
        <div className="privkey-modal-container">
          <div>
            <TextInput
              type="text"
              required
              value={this.state.privKey}
              onChange={this.onChangePrivKey}
              placeholder={"Type the private key you want to import..."}
            />
          </div>
          <div className="privkey-modal-passphrase-container">
            <TextInput
              type="password"
              required
              value={this.state.passphrase}
              onChange={this.onChangePassphrase}
              placeholder={"Your private passphrase"}
            />
          </div>
        </div>
        <KeyBlueButton
          className="keys-import-confirm-button"
          type="button"
          onClick={this.onImportPrivateKey}
          disabled={!this.state.passphrase || !this.state.privKey}>
          <T id="privKeyImportModal.buttonText" m="Import private key" />
        </KeyBlueButton>
      </Modal>
    );
  }
}
