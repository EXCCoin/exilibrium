import PassPhraseInputs from "./PassPhraseInputs";

@autobind
class CreatePassPhrase extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      passPhrase: "",
      passPhraseVerification: "",
      isShowingPassphraseInformation: false
    };
  }

  showPassphraseInformation() {
    this.setState({ isShowingPassphraseInformation: true });
  }
  hidePassphraseInformation() {
    this.setState({ isShowingPassphraseInformation: false });
  }
  isMatching() {
    return this.state.passPhrase === this.state.passPhraseVerification;
  }

  isBlank() {
    return !this.state.passPhrase;
  }

  isValid() {
    return !this.isBlank() && this.isMatching();
  }

  setPassPhrase(passPhrase) {
    this.setState({ passPhrase }, this.onChange);
  }

  setPassPhraseVerification(passPhraseVerification) {
    this.setState({ passPhraseVerification }, this.onChange);
  }

  onKeyDown(e) {
    if (e.keyCode === 13) {
      // Enter key
      e.preventDefault();
      if (this.props.onSubmit) {
        this.props.onSubmit();
      }
    }
  }

  onChange() {
    const { onChange } = this.props;
    if (onChange) {
      if (this.isValid()) {
        onChange(this.state.passPhrase);
      } else {
        onChange("");
      }
    }
  }

  render() {
    const {
      setPassPhrase,
      setPassPhraseVerification,
      onKeyDown,
      showPassphraseInformation,
      hidePassphraseInformation
    } = this;
    const { onChange, onSubmit } = this.props;
    const { passPhrase, passPhraseVerification, isShowingPassphraseInformation } = this.state;
    const [isValid, isBlank, isMatching] = [this.isValid(), this.isBlank(), this.isMatching()];

    return (
      <PassPhraseInputs
        {...{
          onChange,
          onSubmit,
          passPhrase,
          passPhraseVerification,
          isValid,
          isBlank,
          isMatching,
          setPassPhrase,
          setPassPhraseVerification,
          onKeyDown,
          showPassphraseInformation,
          hidePassphraseInformation,
          isShowingPassphraseInformation
        }}
      />
    );
  }
}

export default CreatePassPhrase;
