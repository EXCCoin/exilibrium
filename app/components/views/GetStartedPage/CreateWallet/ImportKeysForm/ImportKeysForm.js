import React, { Component } from "react";
import { FormattedMessage as T } from "react-intl";
import { shell } from "electron";

import { KeyBlueButton, SeedDisplayButton } from "buttons";
import { TextInput } from "inputs";
import { createWallet } from "connectors";
import CreatePassPhrase from "../CreateWalletForm/CreatePassPhrase";

import { ImportKeysFormTypes } from "../../types";
import "style/ImportKeysForm.less";

@autobind
class ImportKeysForm extends Component {
  static propTypes = ImportKeysFormTypes;
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      passPhrase: "",
      copayPassphrase: "",
      seedHex: "",
      showDecryptedMnemonic: false,
      createWalletError: ""
    };
  }

  componentDidMount() {
    this.generateSeed();
  }
  resetFormState() {
    const { validator, decryptor, fileHandler } = this.props;
    this.setState(() => this.getInitialState());
    validator.resetErrorMessage();
    decryptor.resetState();
    fileHandler.resetState();
  }

  toggleDecryptedMnemonicVisibility() {
    this.setState({ showDecryptedMnemonic: !this.state.showDecryptedMnemonic });
  }

  componentDidUpdate(prevProps) {
    const { mnemonic } = this.props;
    if (prevProps.mnemonic.length < 12 && mnemonic.length >= 12) {
      this.decodeMnemonic();
    }
  }

  async decodeMnemonic() {
    const { mnemonic } = this.props;
    const { copayPassphrase, decode } = this.state;
    const decoded = await decode(mnemonic.join(" "), copayPassphrase);
    this.setState({ seedHex: Buffer.from(decoded.getDecodedSeed()).toString("hex") });
  }

  async onCreateWallet() {
    if (!this.isValid()) {
      return;
    }
    const { createWalletRequest, mnemonic } = this.props;
    const { passPhrase, copayPassphrase, decode } = this.state;
    const mnemonicStr = mnemonic.join(" ");
    if (mnemonic.length) {
      try {
        const decoded = await decode(mnemonicStr, copayPassphrase);
        createWalletRequest("", passPhrase, decoded.getDecodedSeed(), true);
      } catch (e) {
        this.setState({ createWalletError: e });
      }
    }
  }

  setPassPhrase(passPhrase) {
    this.setState({ passPhrase });
  }

  onCopayPasswordChange(e) {
    this.setState({ copayPassphrase: e.target.value });
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
    const { mnemonic, mnemonicHasPassphrase } = this.props;
    const { passPhrase, copayPassphrase } = this.state;
    const mnemonicNotEmpty = mnemonic.length >= 12;
    if (mnemonicHasPassphrase) {
      return Boolean(mnemonicNotEmpty && passPhrase && copayPassphrase);
    }
    return Boolean(mnemonicNotEmpty && passPhrase);
  }
  render() {
    const {
      decryptor,
      fileHandler,
      mnemonic,
      mnemonicHasPassphrase,
      errorMessage,
      selectedFileName,
      encryptedString,
      encryptionPassword,
      onReturnToExistingOrNewScreen,
      isCreatingWallet
    } = this.props;
    const hasMnemonic = Boolean(mnemonic.length);
    const isValid = this.isValid();

    return (
      <div className="import-keys-wrapper">
        <div className="create-wallet-go-back">
          <div className="create-wallet-go-back-button" onClick={onReturnToExistingOrNewScreen} />
        </div>
        <h2>
          <T id="wallet.importKeys.title" m="Import keys from Copay wallet" />
        </h2>
        <div>
          <T
            id="wallet.importKeys.tutorial.info"
            m="If you need more comprehensive guide on importing keys from Copay wallet, you can check it"
          />{" "}
          <span
            className="import-keys-tutorial-link"
            onClick={() =>
              shell.openExternal("https://support.excc.co/hc/en-us/articles/360006702912")
            }>
            <T id="wallet.importKeys.tutorial.link" m="here" />
          </span>
        </div>

        <h3>
          <T id="wallet.importKeys.step1.title" m="1. Export from Copay" />
        </h3>
        <ul>
          <li>
            <T
              id="wallet.importKeys.step1.listItem1"
              m="You can import keys with file only through exporting from Copay wallet"
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
            <T id="wallet.importKeys.step1.listItem3" m="Set up encryption password" />
          </li>
          <li>
            <T
              id="wallet.importKeys.step1.listItem4"
              m="Download the file - save it as '.json' file"
            />
          </li>
          <li>
            <T
              id="wallet.importKeys.step1.listItem5"
              m="Once the file is saved, you can move to step 2"
            />
          </li>
        </ul>
        <h3>
          <T id="wallet.importKeys.step2.title" m="2. Upload file" />
        </h3>
        <div className="keys-import-upload-section">
          {encryptedString ? (
            <button className="key-blue-button" onClick={this.resetFormState}>
              <strong>
                {" "}
                <T id="wallet.importKeys.button.clear" m="Clear" />
              </strong>
            </button>
          ) : (
            <label htmlFor="keys-import-file-upload" className="key-blue-button">
              <strong>
                <T id="wallet.importKeys.button.upload" m="Upload file" />
              </strong>
            </label>
          )}

          <input
            type="file"
            id="keys-import-file-upload"
            name="file"
            onChange={fileHandler.onFileChange}
          />
          <div className="keys-import-selected-file-section">
            {selectedFileName && (
              <h3>
                <T id="wallet.importKeys.selectedFileInfo" m="Selected file" />
              </h3>
            )}
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
              <strong>
                <T id="wallet.importkeys.decryptButton" m="Decrypt" />
              </strong>
            </KeyBlueButton>
          </div>
        )}
        {hasMnemonic && (
          <div className="keys-import-mnemonic-section">
            <h3>
              <T id="wallet.importKeys.step4.title" m="4. Confirm decrypted data" />
            </h3>
            <div>
              {mnemonicHasPassphrase && (
                <React.Fragment>
                  <h4>
                    <T
                      id="wallet.importKeys.mnemonicPassphraseLabel"
                      m="It seems that your mnemonic was encrypted by passphrase, please provide it below."
                    />
                  </h4>
                  <div className="keys-import-mnemonic-passphrase-input">
                    <TextInput
                      type="password"
                      value={this.state.copayPassphrase}
                      onChange={this.onCopayPasswordChange}
                      onBlur={this.decodeMnemonic}
                      placeholder="Mnemonic passphrase (optional)"
                    />
                  </div>
                </React.Fragment>
              )}
            </div>
            <div>
              <SeedDisplayButton
                mnemonic={mnemonic}
                seedHex={this.state.seedHex}
                buttonLabel={
                  <strong>
                    <T id="wallet.importkeys.showMnemonic" m="Show mnemonic" />
                  </strong>
                }
              />
            </div>
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
            <strong>
              {" "}
              <T id="createWallet.createWalletBtn" m="Create Wallet" />{" "}
            </strong>
          </KeyBlueButton>
        )}
        <div className="keys-import-error-message">{this.state.createWalletError}</div>
      </div>
    );
  }
}

export default createWallet(ImportKeysForm);
