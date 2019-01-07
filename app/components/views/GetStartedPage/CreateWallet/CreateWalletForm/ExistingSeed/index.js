import { range, increment } from "fp";
import ExistingSeedForm from "./Form";

@autobind
class ExistingSeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      seedWords: range(12).map(index => ({ index, word: "", error: false })),
      seedError: null,
      mnemonicPassphrase: ""
    };
  }

  resetSeedWords() {
    this.setState(this.getInitialState());
  }

  setSeedWords(seedWords) {
    this.setState({ seedWords }, () => {
      const mnemonic = this.getSeedWordsStr();
      if (this.props.mnemonic && this.isMatch()) {
        this.props
          .decode(mnemonic, this.state.mnemonicPassphrase)
          .then(response => this.props.onChange(response.getDecodedSeed()))
          .then(() => this.setState({ seedError: null }))
          .catch(this.onSetError);
      } else {
        this.props.onChange(null);
        this.props
          .decode(mnemonic, this.state.mnemonicPassphrase)
          .then(response => {
            this.setState({ mnemonic, seedError: null });
            this.props.onChange(response.getDecodedSeed());
          })
          .catch(this.onSetError);
      }
    });
  }
  onSetError = seedError => {
    this.setState({ mnemonic: "", seedError: `${seedError}` });
    this.props.onChange(null);

    const seedErrorStr = `${seedError}`;
    const position = "position";
    const positionLoc = seedErrorStr.indexOf(position);
    if (positionLoc > 0) {
      const { seedWords } = this.state;
      const updatedSeedWords = seedWords;
      const [locatedErrPosition] = seedErrorStr
        .slice(
          positionLoc + increment(position.length),
          positionLoc + increment(position.length) + 3
        )
        .split(",");
      updatedSeedWords[locatedErrPosition] = {
        word: updatedSeedWords[locatedErrPosition].word,
        index: updatedSeedWords[locatedErrPosition].index,
        error: true
      };
      this.setState({ seedWords: updatedSeedWords });
    }
  };
  onChangeError = (seedWord, updatedSeedWords, update) => seedError => {
    this.setState({ mnemonic: "", seedError: `${seedError}` });
    this.props.onChange(null);

    const seedErrorStr = `${seedError}`;
    const position = "position";
    const positionLoc = seedErrorStr.indexOf(position);
    if (positionLoc > 0) {
      const [locatedErrPosition] = seedErrorStr
        .slice(
          positionLoc + increment(position.length),
          positionLoc + increment(position.length) + 3
        )
        .split(",");
      if (locatedErrPosition === seedWord.index) {
        updatedSeedWords[locatedErrPosition] = {
          word: update,
          index: seedWord.index,
          error: true
        };
        this.setState({ seedWords: updatedSeedWords });
      } else {
        let empty = false;
        for (let i = 0; i < locatedErrPosition; i++) {
          if (updatedSeedWords[i].word === "") {
            empty = true;
          }
        }
        if (!empty) {
          updatedSeedWords[locatedErrPosition] = {
            word: updatedSeedWords[locatedErrPosition].word,
            index: locatedErrPosition,
            error: true
          };
          this.setState({ seedWords: updatedSeedWords });
        }
      }
    }
  };

  onChangeSeedWord(seedWord, update) {
    const { seedWords, mnemonicPassphrase } = this.state;
    const updatedSeedWords = [...seedWords];
    updatedSeedWords[seedWord.index] = { word: update, index: seedWord.index, error: false };
    const onError = this.onChangeError(seedWord, updatedSeedWords, update);
    this.setState({ seedWords: updatedSeedWords }, () => {
      const { decode, onChange, mnemonic: currentMnemonic } = this.props;
      const mnemonic = this.getSeedWordsStr();
      if (currentMnemonic && this.isMatch()) {
        decode(mnemonic, mnemonicPassphrase)
          .then(response => onChange(response.getDecodedSeed()))
          .then(() => this.setState({ seedError: null }))
          .catch(onError);
      } else {
        onChange(null);
        decode(mnemonic, mnemonicPassphrase)
          .then(response => {
            this.setState({ mnemonic, seedError: null });
            onChange(response.getDecodedSeed());
          })
          .catch(onError);
      }
    });
  }

  onChangeMnemonicPassphrase(e) {
    this.setState({ mnemonicPassphrase: e.target.value });
  }

  decodeMnemonic() {
    this.props
      .decode(this.getSeedWordsStr(), this.state.mnemonicPassphrase)
      .then(response => this.props.onChange(response.getDecodedSeed()))
      .then(() => this.setState({ seedError: null }));
  }

  getSeedWordsStr() {
    const { seedWords } = this.state;
    return Array.isArray(seedWords) ? seedWords.map(({ word }) => word).join(" ") : seedWords;
  }

  isMatch() {
    const mnemonic = this.state.mnemonic || this.props.mnemonic;
    return Boolean(mnemonic && this.getSeedWordsStr() === mnemonic);
  }

  render() {
    const {
      onChangeSeedWord,
      onChangeMnemonicPassphrase,
      decodeMnemonic,
      setSeedWords,
      resetSeedWords
    } = this;
    const isMatch = this.isMatch();
    const { seedWords, mnemonicPassphrase } = this.state;
    const isEmpty = this.state.seedWords.length <= 1; // Weird errors with one word, better to count as empty
    const seedError = isEmpty ? null : this.state.seedError;
    return (
      <ExistingSeedForm
        {...{
          seedWords,
          setSeedWords,
          onChangeSeedWord,
          resetSeedWords,
          isMatch,
          seedError,
          isEmpty,
          mnemonicPassphrase,
          onChangeMnemonicPassphrase,
          decodeMnemonic
        }}
      />
    );
  }
}

export default ExistingSeed;
