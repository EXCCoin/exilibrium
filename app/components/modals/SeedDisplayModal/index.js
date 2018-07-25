import Modal from "../Modal";
import { SlateGrayButton, KeyBlueButton } from "buttons";
import { FormattedMessage as T } from "react-intl";

@autobind
export default class SeedDisplayModal extends React.Component {
  static defaultProps = {
    mnemonic: [],
    seedHex: ""
  };
  render() {
    const { onCancelModal, show } = this.props;

    return (
      <Modal className="mining-modal" {...{ show }}>
        <div className="mining-modal-header">
          <div className="mining-modal-header-title">
            <T id="seedDisplayModal.title" m="Save your seed data" />
          </div>
          <SlateGrayButton className="mining-modal-close-button" onClick={onCancelModal}>
            <T id="infoModal.btnClose" m="Close" />
          </SlateGrayButton>
        </div>
        <div className="keys-import-mnemonic-display">
          <h3>Decrypted mnemonic</h3>
          {this.props.mnemonic.map(word => (
            <div className="keys-import-mnemonic-word" key={word}>
              {word}
            </div>
          ))}
        </div>
        <h3>Decrypted seed hex</h3>
        <div className="keys-import-mnemonic-hex">{this.props.seedHex}</div>
        <KeyBlueButton className="keys-import-confirm-button" onClick={onCancelModal}>
          <T id="seedDisplayModal.buttonText" m="Ok, my seed is backed up" />
        </KeyBlueButton>
      </Modal>
    );
  }
}
