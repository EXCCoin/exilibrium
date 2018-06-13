import React, { Component } from "react";
import { FormattedMessage as T } from "react-intl";

import { KeyBlueButton } from "buttons";
import { TextInput, PasswordInput } from "inputs";
import { createWallet } from "connectors";
import CreatePassPhrase from "../CreateWalletForm/CreatePassPhrase";

import { ImportKeysFormTypes } from "../../types";
import "style/ImportKeysForm.less";

@autobind
class ImportKeysForm extends Component {
  static propTypes = ImportKeysFormTypes;
  state = {
    passPhrase: ""
  };

  componentDidMount() {
    this.generateSeed();
  }
  resetFormState() {
    const { validator, decryptor, fileHandler } = this.props;
    validator.resetErrorMessage();
    decryptor.resetState();
    fileHandler.resetState();
  }

  onCreateWallet() {
    if (!this.isValid()) {
      return;
    }
    const { createWalletRequest, mnemonic } = this.props;
    const { passPhrase } = this.state;
    const pubpass = ""; // Temporarily disabled?
    const mnemonicStr = mnemonic.join(" ");
    if (mnemonic.length) {
      this.state
        .decode(mnemonicStr)
        .then(response => {
          createWalletRequest(pubpass, passPhrase, response.getDecodedSeed(), true);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  setPassPhrase(passPhrase) {
    this.setState({ passPhrase });
  }

  generateSeed() {
    return this.props.seedService.then(({ generate, decode }) =>
      generate().then(() => {
        this.setState({
          decode
        });
      })
    );
  }

  isValid() {
    const { mnemonic } = this.props;
    const { passPhrase } = this.state;
    const seed = mnemonic.join("");
    return Boolean(seed && passPhrase);
  }
  render() {
    const {
      decryptor,
      fileHandler,
      mnemonic,
      errorMessage,
      selectedFileName,
      encryptedString,
      encryptionPassword,
      //  copayPassphrase,
      // new props
      isCreatingWallet
    } = this.props;
    const hasMnemonic = Boolean(mnemonic.length);
    const isValid = this.isValid();
    return (
      <div className="import-keys-wrapper">
        <h2>
          <T id="wallet.importKeys.title" m="Import keys from copay wallet" />
        </h2>
        <h3>
          <T id="wallet.importKeys.step1.title" m="1. Export from copay" />
        </h3>
        <ul>
          <li>
            <T
              id="wallet.importKeys.step1.listItem1"
              m="Transfer funds from java wallet to copay wallet"
            />
          </li>
          <li>
            <T
              id="wallet.importKeys.step1.listItem2"
              m="Go to Settings -> Wallets -> Choose your wallet -> More Options -> Export Wallet ->
            File/Text"
            />
          </li>
          <li>
            <T id="wallet.importKeys.step1.listItem3" m="Set up encrytion password" />
          </li>
          <li>
            <T id="wallet.importKeys.step1.listItem4" m="Download file (save it as '.json' file)" />
          </li>
          <li>
            <T id="wallet.importKeys.step1.listItem5" m="When file is uploaded, go to step 2" />
          </li>
        </ul>
        <h3>
          <T id="wallet.importKeys.step2.title" m="2. Upload file" />
        </h3>
        <div className="keys-import-upload-section">
          {encryptedString ? (
            <button className="key-blue-button" onClick={this.resetFormState}>
              Clear
            </button>
          ) : (
            <label htmlFor="keys-import-file-upload" className="key-blue-button">
              Upload file
            </label>
          )}
          <input
            type="file"
            id="keys-import-file-upload"
            name="file"
            onChange={fileHandler.onFileChange}
          />
          <div className="keys-import-selected-file-section">
            {selectedFileName && <h3>Selected file</h3>}
            {selectedFileName}
          </div>
          <div className="keys-import-error-message">{errorMessage}</div>
        </div>
        {encryptedString && (
          <div className="keys-import-decryption-section">
            <h3>
              <T id="wallet.importKeys.step3.title" m="3. Type your encryption password" />
            </h3>
            <TextInput
              type="password"
              className="keys-import-decryption-password-input"
              value={encryptionPassword}
              onChange={decryptor.onPasswordChange}
              placeholder="Password"
            />
            <KeyBlueButton onClick={decryptor.decrypt} disabled={!encryptionPassword}>
              <T id="wallet.importkeys.decryptButton" m="Decrypt" />
            </KeyBlueButton>
          </div>
        )}
        {/*encryptedString && (
          <PasswordInput
            id="copay-passphrase"
            placeholder="Please provide your copay passphrase (if applicable)"
            value={copayPassphrase}
          />
        )*/}
        {hasMnemonic && (
          <div className="keys-import-mnemonic-section">
            <h3>
              <T id="wallet.importKeys.step4.title" m="4. Confirm decrypted data" />
            </h3>
            <h3>Decrypted mnemonic </h3>
            {mnemonic.map(word => (
              <div className="keys-import-mnemonic-word" key={word}>
                {word}
              </div>
            ))}
          </div>
        )}
        {hasMnemonic && (
          <div className="keys-import-mnemonic-section">
            <h3>
              <T id="wallet.importKeys.step5.title" m="5. Set new wallet passphrase" />
            </h3>
            <CreatePassPhrase onChange={this.setPassPhrase} onSubmit={this.onCreateWallet} />
          </div>
        )}
        {hasMnemonic && (
          <KeyBlueButton
            className="wallet-key-blue-button"
            disabled={!isValid || isCreatingWallet}
            loading={isCreatingWallet}
            onClick={this.onCreateWallet}>
            <T id="createWallet.createWalletBtn" m="Create Wallet" />
          </KeyBlueButton>
        )}
      </div>
    );
  }
}

export default createWallet(ImportKeysForm);
