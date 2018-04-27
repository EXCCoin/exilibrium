import { FormattedMessage as T } from "react-intl";
import { invalidRPCVersion } from "connectors";
import { StandalonePageBody } from "layout";

const InvalidRPCVersion = ({ requiredWalletRPCVersion, walletRPCVersion }) => (
  <StandalonePageBody>
    <div className="invalid-rpc-info">
      <T
        id="invalidRPCVersion.info"
        m={`The API of the currently running wallet ({walletRPCVersion}) is not compatible with Exilibrium (required version {requiredWalletRPCVersion}).

        Please update the daemon (exccd) and wallet (exccwallet) to the latest version, then try again.

        See the "Help ⮕ About" menu for the current version of the executables.`}
        values={{ walletRPCVersion, requiredWalletRPCVersion }}
      />
    </div>
  </StandalonePageBody>
);

InvalidRPCVersion.propTypes = {
  requiredWalletRPCVersion: PropTypes.string.isRequired,
  walletRPCVersion: PropTypes.string.isRequired
};

export default invalidRPCVersion(InvalidRPCVersion);
