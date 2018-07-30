import SingleSeedWordEntry from "../SingleSeedWordEntry";
import SeedHexEntry from "./SeedHexEntry";
import { TextToggle } from "buttons";
import { TextInput } from "inputs";
import { FormattedMessage as T } from "react-intl";
import "style/CreateWalletForm.less";
import { SEED_LENGTH, SEED_WORDS } from "wallet/seed";

function shouldShowNonSupportSeedSize(seedWords, seedType) {
  return (
    seedType === "hex" &&
    seedWords.length < SEED_LENGTH.HEX_MIN &&
    seedWords.length > SEED_LENGTH.HEX_MAX
  );
}

function getClassName({ word, error } = {}) {
  return word ? (error ? "seedWord error" : "seedWord populated") : "seedWord restore";
}

class ExistingSeedForm extends React.Component {
  state = {
    showPasteWarning: false,
    seedType: "words"
  };

  handleOnPaste = e => {
    e.preventDefault();
    const lowercaseSeedWords = SEED_WORDS.map(w => w.toLowerCase());
    const clipboardData = e.clipboardData.getData("text");
    const words = clipboardData
      .split(/\b/)
      .filter(w => /^[\w]+$/.test(w))
      .filter(w => lowercaseSeedWords.indexOf(w.toLowerCase()) > -1)
      .map((w, i) => ({ index: i, word: w }));
    this.props.setSeedWords(words);

    this.setState({
      showPasteWarning: true
    });
  };

  handleToggle = side => {
    this.props.resetSeedWords();
    this.setState({ seedType: side === "left" ? "words" : "hex" });
  };

  mountSeedErrors = () => {
    const errors = [];
    if (this.props.seedError) {
      errors.push(<div key={this.props.seedError}>{this.props.seedError}</div>);
    }
    if (shouldShowNonSupportSeedSize(this.props.seedWords, this.state.seedType)) {
      errors.push(
        <div key="confirmSeed.errors.hexNot32Bytes">
          <T
            id="confirmSeed.errors.hexNot32Bytes"
            m="Error: seed is not 32 bytes, such comes from a non-supported software and may have unintended consequences."
          />
        </div>
      );
    }
    return errors;
  };

  render() {
    const {
      onChangeSeedWord,
      seedWords,
      setSeedWords,
      mnemonicPassphrase,
      onChangeMnemonicPassphrase,
      decodeMnemonic
    } = this.props;
    const { seedType } = this.state;
    const errors = this.mountSeedErrors();
    return (
      <Aux>
        <div className="content-title">
          <T id="createWallet.restore.title" m="Restore existing wallet" />
        </div>
        <div className="seed-type-label">
          <TextToggle
            activeButton="left"
            leftText="words"
            rightText="hex"
            toggleAction={this.handleToggle}
          />
        </div>
        <div className="confirm-seed-row seed">
          <div className="confirm-seed-label-text seed">
            <T id="confirmSeed.label" m="Confirm Seed" />
          </div>
          {seedType === "words" && Array.isArray(seedWords) ? (
            <div className="seedArea">
              {!this.state.showPasteWarning ? null : (
                <div className="orange-warning">
                  <T
                    id="confirmSeed.warnings.pasteExistingSeed"
                    m="*Please make sure you also have a physical, written down copy of your seed."
                  />
                </div>
              )}
              {seedWords.map(seedWord => (
                <SingleSeedWordEntry
                  className={getClassName(seedWord)}
                  onChange={onChangeSeedWord}
                  onPaste={this.handleOnPaste}
                  seedWord={seedWord}
                  value={{ name: seedWord.word }}
                  key={seedWord.index}
                />
              ))}
              <div className="confirm-seed-mnemonic-passphrase-container">
                <h4>
                  <T
                    id="wallet.importKeys.mnemonicPassphraseLabel"
                    m="If your mnemonic was encrypted with passphrase, please provide it below."
                  />
                </h4>
                <div className="confirm-seed-mnemonic-passphrase-input">
                  <TextInput
                    type="password"
                    value={mnemonicPassphrase}
                    onChange={onChangeMnemonicPassphrase}
                    onBlur={decodeMnemonic}
                    placeholder="Mnemonic passphrase (optional)"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="seedArea hex">
              <SeedHexEntry onChange={setSeedWords} />
            </div>
          )}
          <div className="input-form-error">{errors.length > 0 && <div>{errors}</div>}</div>
        </div>
      </Aux>
    );
  }
}

export default ExistingSeedForm;
