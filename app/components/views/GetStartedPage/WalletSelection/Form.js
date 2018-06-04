import { FormattedMessage as T, injectIntl } from "react-intl";

import { KeyBlueButton, RemoveWalletButton, InvisibleButton } from "buttons";

import { WalletSelectionBodyBaseTypes } from "../types";
import CreateWalletForm from "./CreateWalletForm";
import ImportKeysForm from "./ImportKeysForm";
import "style/LoginForm.less";

WalletSelectionBodyBase.propTypes = WalletSelectionBodyBaseTypes;

function WalletSelectionBodyBase({
  availableWallets,
  createWallet,
  importKeys,
  showCreateWalletForm,
  showImportKeysForm,
  hideCreateWalletForm,
  hideImportKeysForm,
  createWalletForm,
  importKeysForm,
  startWallet,
  onRemoveWallet,
  selectedWallet,
  onChangeAvailableWallets,
  onChangeCreateWalletName,
  newWalletName,
  setPrivateKeysObject
}) {
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
    case importKeysForm:
      return (
        <div className="advanced-page">
          <div className="advanced-page-form">
            <ImportKeysForm
              submitSection={
                <div>
                  {availableWallets.length && (
                    <InvisibleButton onClick={hideImportKeysForm}>
                      <T id="advancedStartup.cancel" m="Cancel" />
                    </InvisibleButton>
                  )}
                  <KeyBlueButton onClick={importKeys}>
                    <T id="wallet.importKeys.button" m="Import keys" />
                  </KeyBlueButton>
                </div>
              }
              {...{
                setPrivateKeysObject
              }}
            />
          </div>
        </div>
      );
    case Boolean(availableWallets.length):
      return (
        <div className="advanced-page">
          <div className="advanced-page-form">
            <div className="advanced-daemon-row">
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
                      className={selected ? "display-wallet-name selected" : "display-wallet-name"}>
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
              {availableWallets.length < 3 && (
                <div className="display-wallet new" onClick={showCreateWalletForm}>
                  <div className="display-wallet-network" />
                  <div className="wallet-icon createnew" />
                  <div className="display-wallet-name">
                    <T id="getStarted.newSeedTab" m="Create a New Wallet" />
                  </div>
                </div>
              )}
              <div className="display-wallet import" onClick={showImportKeysForm}>
                <div className="display-wallet-network" />
                <div className="wallet-icon imported" />
                <div className="display-wallet-name">
                  <T id="getStarted.importKeysTab" m="Import keys" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export const WalletSelectionFormBody = injectIntl(WalletSelectionBodyBase);
