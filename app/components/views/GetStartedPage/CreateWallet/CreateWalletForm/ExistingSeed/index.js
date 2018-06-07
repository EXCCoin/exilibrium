import ExistingSeedForm from "./Form";

@autobind
class ExistingSeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    const seedWords = [];
    for (let i = 0; i < 12; i++) {
      seedWords.push({
        word: "",
        index: i,
        error: false
      });
    }
    return { seedWords, seedError: null };
  }

  componentWillUnmount() {
    this.state = this.getInitialState();
  }

  resetSeedWords() {
    this.setState(this.getInitialState());
  }

  setSeedWords(seedWords) {
    const onError = seedError => {
      this.setState({ mnemonic: "", seedError: `${seedError}` });
      this.props.onChange(null);

      const seedErrorStr = `${seedError}`;
      const position = "position";
      const positionLoc = seedErrorStr.indexOf(position);
      if (positionLoc > 0) {
        const { seedWords } = this.state;
        const updatedSeedWords = seedWords;
        const [locatedErrPosition] = seedErrorStr
          .slice(positionLoc + position.length + 1, positionLoc + position.length + 1 + 3)
          .split(",");
        updatedSeedWords[locatedErrPosition] = {
          word: updatedSeedWords[locatedErrPosition].word,
          index: updatedSeedWords[locatedErrPosition].index,
          error: true
        };
        this.setState({ seedWords: updatedSeedWords });
      }
    };
    console.log("this.props.decode", this.props.decode);
    this.setState({ seedWords }, () => {
      const mnemonic = this.getSeedWordsStr();
      console.log(this.props.decode);
      if (this.props.mnemonic && this.isMatch()) {
        this.props
          .decode(mnemonic)
          .then(response => this.props.onChange(response.getDecodedSeed()))
          .then(() => this.setState({ seedError: null }))
          .catch(onError);
      } else {
        this.props.onChange(null);
        this.props
          .decode(mnemonic)
          .then(response => {
            this.setState({ mnemonic, seedError: null });
            this.props.onChange(response.getDecodedSeed());
          })
          .catch(onError);
      }
    });
  }

  onChangeSeedWord(seedWord, update) {
    const { seedWords } = this.state;
    const updatedSeedWords = seedWords;
    updatedSeedWords[seedWord.index] = { word: update, index: seedWord.index, error: false };

    const onError = seedError => {
      console.log("got Error", seedError);
      this.setState({ mnemonic: "", seedError: `${seedError}` });
      this.props.onChange(null);

      const seedErrorStr = `${seedError}`;
      const position = "position";
      const positionLoc = seedErrorStr.indexOf(position);
      if (positionLoc > 0) {
        const [locatedErrPosition] = seedErrorStr
          .slice(positionLoc + position.length + 1, positionLoc + position.length + 1 + 3)
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
    this.setState({ seedWords: updatedSeedWords }, () => {
      const mnemonic = this.getSeedWordsStr();
      console.log("this.props.mnemonic", this.props.mnemonic);
      console.log("this.props.decode", this.props.decode);
      if (this.props.mnemonic && this.isMatch()) {
        this.props
          .decode(mnemonic)
          .then(response => {
            console.log("got response", response);
            return this.props.onChange(response.getDecodedSeed());
          })
          .then(() => this.setState({ seedError: null }))
          .catch(onError);
      } else {
        this.props.onChange(null);
        this.props
          .decode(mnemonic, "")
          .then(response => {
            const resp = response.getDecodedSeed();
            console.log("got response", resp);
            this.setState({ mnemonic, seedError: null });
            this.props.onChange(response.getDecodedSeed());
          })
          .catch(onError);
      }
    });
  }

  getSeedWordsStr() {
    const { seedWords } = this.state;
    console.log(seedWords);
    return Array.isArray(seedWords) ? seedWords.map(({ word }) => word).join(" ") : seedWords;
  }

  isMatch() {
    const mnemonic = this.state.mnemonic || this.props.mnemonic;
    return Boolean(mnemonic && this.getSeedWordsStr() === mnemonic);
  }

  render() {
    const { onChangeSeedWord, setSeedWords, resetSeedWords } = this;
    const isMatch = this.isMatch();
    const { seedWords } = this.state;
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
          isEmpty
        }}
      />
    );
  }
}

export default ExistingSeed;
