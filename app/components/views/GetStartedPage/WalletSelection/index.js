import { WalletSelectionFormBody } from "./Form";

@autobind
class WalletSelectionBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      createWalletForm: false,
      importKeysForm: false,
      newWalletName: "",
      privateKeysObject: {},
      selectedWallet: this.props.availableWallets ? this.props.availableWallets[0] : null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.availableWallets &&
      this.props.availableWallets.length !== nextProps.availableWallets.length
    ) {
      this.setState({ selectedWallet: nextProps.availableWallets[0] });
    }
  }

  componentWillUnmount() {
    this.resetState();
  }

  showCreateWalletForm() {
    this.setState({ createWalletForm: true });
  }
  showImportKeysForm() {
    this.setState({ importKeysForm: true });
  }
  hideCreateWalletForm() {
    this.setState({ createWalletForm: false });
  }
  hideImportKeysForm() {
    this.setState({ importKeysForm: false });
  }
  onChangeAvailableWallets(selectedWallet) {
    this.setState({ selectedWallet });
  }
  onChangeCreateWalletName(newWalletName) {
    this.setState({ newWalletName });
  }
  setPrivateKeysObject(privateKeysObject = {}) {
    this.setState({ privateKeysObject });
  }
  createWallet() {
    const { newWalletName } = this.state;
    if (newWalletName === "") {
      return;
    }
    this.props.onCreateWallet({
      label: newWalletName,
      value: { wallet: newWalletName }
    });
  }
  importKeys() {
    console.log("importing keys", this.state.privateKeysObject);
    this.props.onImportKeys(this.state.privateKeysObject);
  }
  startWallet() {
    this.props.onStartWallet(this.state.selectedWallet);
  }
  resetState() {
    this.setState(this.getInitialState());
  }

  render() {
    const {
      onChangeAvailableWallets,
      startWallet,
      createWallet,
      importKeys,
      onChangeCreateWalletName,
      onChangePrivateKeysObject,
      showCreateWalletForm,
      showImportKeysForm,
      hideCreateWalletForm,
      hideImportKeysForm,
      setPrivateKeysObject
    } = this;
    const {
      selectedWallet,
      sideActive,
      newWalletName,
      newWalletNetwork,
      createWalletForm
    } = this.state;
    return (
      <WalletSelectionFormBody
        {...{
          sideActive,
          onChangeAvailableWallets,
          onChangeCreateWalletName,
          onChangePrivateKeysObject,
          startWallet,
          createWallet,
          importKeys,
          setPrivateKeysObject,
          createWalletForm,
          showCreateWalletForm,
          showImportKeysForm,
          hideCreateWalletForm,
          hideImportKeysForm,
          selectedWallet,
          newWalletName,
          newWalletNetwork,
          networkSelected: newWalletNetwork === "mainnet",
          ...this.props,
          ...this.state
        }}
      />
    );
  }
}

export { WalletSelectionBody };
