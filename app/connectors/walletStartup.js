import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as walletLoaderActions from "../actions/WalletLoaderActions";
import * as daemonActions from "../actions/DaemonActions";

const mapStateToProps = selectorMap({
  appVersion: selectors.appVersion,
  setLanguage: selectors.setLanguage,
  showTutorial: selectors.showTutorial,
  startStepIndex: selectors.startStepIndex,
  isInputRequest: selectors.isInputRequest,
  startupError: selectors.startupError,
  confirmNewSeed: selectors.confirmNewSeed,
  existingOrNew: selectors.existingOrNew,
  hasExistingWallet: selectors.hasExistingWallet,
  getDaemonStarted: selectors.getDaemonStarted,
  getDaemonSynced: selectors.getDaemonSynced,
  getCurrentBlockCount: selectors.getCurrentBlockCount,
  getNeededBlocks: selectors.getNeededBlocks,
  getWalletReady: selectors.getWalletReady,
  getEstimatedTimeLeft: selectors.getEstimatedTimeLeft,
  isPrepared: selectors.isPrepared,
  isTestNet: selectors.isTestNet,
  network: selectors.network,
  isAdvancedDaemon: selectors.isAdvancedDaemon,
  openForm: selectors.openForm,
  isOpeningWallet: selectors.isOpeningWallet,
  remoteAppdataError: selectors.getRemoteAppdataError,
  rescanEndBlock: selectors.rescanEndBlock,
  rescanStartBlock: selectors.rescanStartBlock,
  rescanCurrentBlock: selectors.rescanCurrentBlock,
  availableWallets: selectors.availableWalletsSelect,
  walletName: selectors.getWalletName,
  previousWallet: selectors.previousWallet,
  availableLanguages: selectors.sortedLocales,
  locale: selectors.currentLocaleName,
  defaultLocale: selectors.defaultLocaleName,
  updateAvailable: selectors.updateAvailable
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      determineNeededBlocks: walletLoaderActions.determineNeededBlocks,
      prepStartDaemon: daemonActions.prepStartDaemon,
      onShowTutorial: daemonActions.showTutorial,
      onShowLanguage: daemonActions.showLanguage,
      onShowGetStarted: daemonActions.showGetStarted,
      onSelectLanguage: daemonActions.selectLanguage,
      finishTutorial: daemonActions.finishTutorial,
      onReturnToNewSeed: walletLoaderActions.createWalletGoBackNewSeed,
      onReturnToWalletSelection: walletLoaderActions.createWalletGoBackWalletSelection,
      onReturnToExistingOrNewScreen: walletLoaderActions.createWalletGoBackExistingOrNew,
      onSetCreateWalletFromExisting: walletLoaderActions.createWalletExistingToggle,
      onDiscoverAddresses: walletLoaderActions.discoverAddressAttempt,
      onOpenWallet: walletLoaderActions.openWalletAttempt,
      onRetryStartRPC: walletLoaderActions.startRpcRequestFunc,
      doVersionCheck: walletLoaderActions.versionCheckAction,
      onStartDaemon: daemonActions.startDaemon,
      onStartWallet: daemonActions.startWallet,
      onCreateWallet: daemonActions.createWallet,
      onRemoveWallet: daemonActions.removeWallet,
      setCredentialsAppdataError: daemonActions.setCredentialsAppdataError,
      onGetAvailableWallets: daemonActions.getAvailableWallets
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps);
