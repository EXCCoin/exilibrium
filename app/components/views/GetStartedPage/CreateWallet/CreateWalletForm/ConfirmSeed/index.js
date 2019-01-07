import ConfirmSeedForm from "./Form";

@autobind
class ConfirmSeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    const seedWords = [];
    const randomThreshold = 0.3;
    const splitMnemonic = this.props.mnemonic.split(" ");
    for (let i = 0; i < splitMnemonic.length; i++) {
      const hideWord = Math.random();
      seedWords.push({
        word: hideWord > randomThreshold ? splitMnemonic[i] : "",
        show: hideWord > randomThreshold,
        index: i,
        match: hideWord > randomThreshold
      });
    }
    return {
      seedWords,
      seedError: "*Please confirm the missing words",
      splitMnemonic
    };
  }

  onChangeSeedWord(seedWord, update) {
    const { seedWords, splitMnemonic } = this.state;
    const { mnemonic } = this.props;
    const updatedSeedWords = seedWords;
    updatedSeedWords[seedWord.index] = {
      word: update,
      show: seedWord.show,
      index: seedWord.index,
      match: splitMnemonic[seedWord.index] === update
    };
    this.setState({ seedWords: updatedSeedWords });

    const seedWordStr = seedWords.map(seedWord => seedWord.word).join(" ");
    if (seedWordStr === mnemonic) {
      this.setState({ seedWordsError: null });
      this.props
        .decode(mnemonic)
        .then(response => this.props.onChange(response.getDecodedSeed()))
        .then(() => this.setState({ seedError: null }))
        .catch(e => console.log(e));
    } else {
      this.setState({ seedError: "*Please confirm the missing words" });
    }
  }

  render() {
    const { onChangeSeedWord } = this;
    const { seedWords } = this.state;
    const isEmpty = this.state.seedWords.length <= 1; // Weird errors with one word, better to count as empty
    const seedError = isEmpty ? null : this.state.seedError;
    return <ConfirmSeedForm {...{ seedWords, seedError, isEmpty, onChangeSeedWord }} />;
  }
}

export default ConfirmSeed;
