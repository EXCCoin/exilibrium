import { FormattedMessage as T } from "react-intl";
import { LoaderBarBottom } from "indicators";
import "style/CreateWalletForm.less";

const CreationTypeSelectScreen = ({
  onSetCreateWalletFromExisting,
  onReturnToWalletSelection,
  getCurrentBlockCount,
  getNeededBlocks,
  getEstimatedTimeLeft,
  getDaemonSynced
}) => (
  <div className="getstarted content">
    <div className="createwallet-button-area">
      <div className="create-wallet-go-back">
        <div className="create-wallet-go-back-button" onClick={onReturnToWalletSelection} />
      </div>
      <div className="createwallet-button new" onClick={() => onSetCreateWalletFromExisting("new")}>
        <div className="createwallet-button-label">
          <T id="getStarted.newSeedTab" m="Create a New Wallet" />
        </div>
      </div>
      <div
        className="createwallet-button restore"
        onClick={() => onSetCreateWalletFromExisting("restore")}>
        <div className="createwallet-button-label">
          <T id="getStarted.existingSeedTab" m="Restore Existing Wallet" />
        </div>
      </div>
      <div
        className="display-wallet import"
        onClick={() => onSetCreateWalletFromExisting("import")}>
        <div className="display-wallet-network" />
        <div className="wallet-icon imported" />
        <div className="display-wallet-name">
          <T id="getStarted.importKeysTab" m="Import keys" />
        </div>
      </div>
    </div>
    <LoaderBarBottom
      {...{ getCurrentBlockCount, getNeededBlocks, getEstimatedTimeLeft, getDaemonSynced }}
    />
  </div>
);

export default CreationTypeSelectScreen;
