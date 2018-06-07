import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";
import * as walletLoaderActions from "actions/WalletLoaderActions";
import * as clientActions from "actions/ClientActions";
import { getSeedService } from "wallet/seed";

const mapStateToProps = selectorMap({
  seedService: getSeedService,
  createWalletExisting: selectors.createWalletExisting,
  isCreatingWallet: selectors.isCreatingWallet,
  confirmNewSeed: selectors.confirmNewSeed,
  isTestNet: selectors.isTestNet
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      createWalletConfirmNewSeed: walletLoaderActions.createWalletConfirmNewSeed,
      createWalletGoBackNewSeed: walletLoaderActions.createWalletGoBackNewSeed,
      createWalletRequest: walletLoaderActions.createWalletRequest,
      copySeedToClipboard: clientActions.copySeedToClipboard
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
