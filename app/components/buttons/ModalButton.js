const defaultButton = ({ onClick, enabled, buttonLabel, className }) => (
  <button onClick={onClick} enabled={enabled} className={className}>
    {buttonLabel}
  </button>
);

@autobind
class ModalButton extends React.Component {
  state = { show: false };

  showModal() {
    this.setState({ show: true });
  }

  hideModal() {
    this.setState({ show: false });
  }

  onSubmit(...args) {
    const { onSubmit } = this.props;
    this.hideModal();
    if (onSubmit) {
      onSubmit(...args);
    }
  }

  render() {
    const { buttonLabel, modalComponent: Modal, buttonComponent: ButtonComponent } = this.props;
    const { show } = this.state;
    const { onSubmit, showModal, hideModal } = this;
    return (
      <React.Fragment>
        <ButtonComponent {...this.props} onClick={showModal}>
          {buttonLabel}
        </ButtonComponent>

        <Modal
          {...{
            ...this.props,
            show,
            onSubmit,
            onCancelModal: hideModal
          }}
        />
      </React.Fragment>
    );
  }
}

ModalButton.propTypes = {
  modalComponent: PropTypes.any.isRequired,
  className: PropTypes.string.isRequired,
  buttonComponent: PropTypes.any
};

ModalButton.defaultProps = {
  buttonComponent: defaultButton
};

export default ModalButton;
