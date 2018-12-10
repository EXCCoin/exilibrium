import Modal from "./Modal";

@autobind
class PassphraseModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  onCancelModal() {
    this.resetState();
    if (this.props.onCancelModal) {
      this.props.onCancelModal();
    }
  }

  resetState() {
    this.setState(this.getInitialState());
  }

  getInitialState() {
    return {
      passPhrase: "",
      hasFailedAttempt: false
    };
  }

  setPassPhrase(passPhrase) {
    this.setState({ passPhrase });
  }

  isValid() {
    const { passPhrase } = this.state;
    const parentValid = this.props.isValid ? this.props.isValid() : true;
    return Boolean(passPhrase) && parentValid;
  }

  onSubmit() {
    const { passPhrase } = this.state;

    if (!this.isValid()) {
      if (this.props.validationFailed) {
        this.props.validationFailed();
      }
      return this.setState({ hasFailedAttempt: true });
    }

    this.props.onSubmit(passPhrase);
    this.resetState();
  }

  render() {
    const { setPassPhrase, onSubmit, onCancelModal } = this;

    return (
      <Modal
        {...{
          ...this.props,
          ...this.state,
          setPassPhrase,
          onSubmit,
          onCancelModal
        }}
      />
    );
  }
}

export default PassphraseModal;
