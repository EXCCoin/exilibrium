import { FormattedMessage as T, injectIntl } from "react-intl";

import { KeyBlueButton, RemoveWalletButton, InvisibleButton } from "buttons";

import CreateWalletForm from "./CreateWalletForm";
import "style/LoginForm.less";

@autobind
class WalletSelectionBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }
  getInitialState() {
    return {
      createWalletForm: false,
      startWalletClicked: false,
      createWalletClicked: false,
      newWalletName: "",
      selectedWallet: this.props.availableWallets ? this.props.availableWallets[0] : null
    };
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.availableWallets &&
      prevProps.availableWallets.length !== this.props.availableWallets.length
    ) {
      this.setState({ selectedWallet: this.props.availableWallets[0] });
    }
  }
  showCreateWalletForm() {
    this.setState({ createWalletForm: true });
  }
  hideCreateWalletForm() {
    this.setState({ createWalletForm: false });
  }
  onChangeAvailableWallets(selectedWallet) {
    this.setState({ selectedWallet });
  }
  onChangeCreateWalletName(newWalletName) {
    this.setState({ newWalletName });
  }
  createWallet() {
    const { newWalletName } = this.state;
    if (newWalletName === "") {
      return;
    }
    if (!this.state.createWalletClicked) {
      this.setState({ createWalletClicked: true });
      this.props.onCreateWallet({
        label: newWalletName,
        value: { wallet: newWalletName }
      });
    }
  }
  startWallet() {
    if (!this.state.startWalletClicked) {
      this.setState({ startWalletClicked: true });
      this.props.onStartWallet(this.state.selectedWallet);
    }
  }
  resetState() {
    this.setState(this.getInitialState());
  }
  render() {
    const {
      onChangeAvailableWallets,
      startWallet,
      createWallet,
      onChangeCreateWalletName,
      showCreateWalletForm,
      hideCreateWalletForm
    } = this;
    const { onRemoveWallet, maxWalletCount, availableWallets } = this.props;
    const { createWalletForm, newWalletName, selectedWallet } = this.state;

    switch (true) {
      case createWalletForm:
        return (
          <div className="advanced-page">
            <div className="advanced-page-form">
              <CreateWalletForm
                {...{
                  newWalletName,
                  onChangeCreateWalletName
                }}
              />
              <div className="loader-bar-buttons">
                {availableWallets &&
                  availableWallets.length > 0 && (
                    <InvisibleButton onClick={hideCreateWalletForm}>
                      <T id="advancedStartup.cancel" m="Cancel" />
                    </InvisibleButton>
                  )}
                <KeyBlueButton onClick={createWallet}>
                  <T id="wallet.create.button" m="Create new wallet" />
                </KeyBlueButton>
              </div>
            </div>
          </div>
        );
      case Boolean(availableWallets) && Boolean(selectedWallet):
        return (
          <div className="advanced-page">
            <div className="advanced-page-form">
              <div className="available-wallets-container">
                {availableWallets.map(wallet => {
                  const selected =
                    wallet.value.wallet === selectedWallet.value.wallet &&
                    wallet.network === selectedWallet.network;
                  return (
                    <div
                      className={selected ? "display-wallet selected" : "display-wallet"}
                      key={wallet.label}
                      onClick={() => onChangeAvailableWallets(wallet)}>
                      <div
                        className={
                          selected ? "display-wallet-complete selected" : "display-wallet-complete"
                        }>
                        {!wallet.finished && "Setup incomplete"}
                      </div>
                      <div
                        className={
                          selected ? "display-wallet-network selected" : "display-wallet-network"
                        }>
                        {wallet.network}
                      </div>
                      <div className={selected ? "wallet-icon selected" : "wallet-icon wallet"} />
                      <div
                        className={
                          selected ? "display-wallet-name selected" : "display-wallet-name"
                        }>
                        {wallet.value.wallet}
                      </div>
                      {selected && (
                        <div className="display-wallet-buttons">
                          <KeyBlueButton
                            className="display-wallet-button start"
                            onClick={startWallet}
                          />
                          <RemoveWalletButton
                            className="display-wallet-button remove"
                            modalTitle={
                              <T
                                id="walletselection.removeConfirmModal.title"
                                m="Remove {wallet}"
                                values={{
                                  wallet: (
                                    <span className="mono">
                                      {selectedWallet && selectedWallet.label}
                                    </span>
                                  )
                                }}
                              />
                            }
                            modalContent={
                              <T
                                id="walletselection.removeConfirmModal.content"
                                m="Warning this action is permanent! Please make sure you have backed up your wallet's seed before proceeding."
                              />
                            }
                            onSubmit={() => onRemoveWallet(wallet)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {availableWallets.length < maxWalletCount && (
                  <div className="display-wallet new" onClick={showCreateWalletForm}>
                    <div className="display-wallet-network" />
                    <div className="wallet-icon createnew" />
                    <div className="display-wallet-name">
                      <T id="getStarted.newSeedTab" m="Create a New Wallet" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

export default injectIntl(WalletSelectionBody);
