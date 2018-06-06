/* eslint complexity: off */
import { FormattedMessage as T } from "react-intl";

import { walletStartup } from "connectors";

import GetStartedPageTypes from "./types";
import OpenWallet from "./OpenWallet";
import CreateWallet from "./CreateWallet";
import DaemonLoading from "./DaemonLoading";
import Logs from "./Logs";
import Settings from "./Settings";
import ReleaseNotes from "./ReleaseNotes";
import { WalletSelectionBody } from "./WalletSelection";
import { StartRPCBody } from "./StartRPC";
import { DiscoverAddressesBody } from "./DiscoverAddresses";
import { FetchBlockHeadersBody } from "./FetchBlockHeaders";
import { AdvancedStartupBody, RemoteAppdataError } from "./AdvancedStartup";
import { RescanWalletBody } from "./RescanWallet";

@autobind
class GetStartedPage extends React.Component {
  state = { showSettings: false, showLogs: false, showReleaseNotes: false };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    const { startStepIndex, getDaemonSynced, onRetryStartRPC } = this.props;
    if (
      startStepIndex !== nextProps.startStepIndex ||
      getDaemonSynced !== nextProps.getDaemonSynced
    ) {
      if (nextProps.startStepIndex === 3 && nextProps.getDaemonSynced) {
        onRetryStartRPC();
      }
    }
  }

  componentDidMount() {
    const {
      getWalletReady,
      getDaemonStarted,
      getNeededBlocks,
      onGetAvailableWallets,
      onStartWallet,
      prepStartDaemon,
      determineNeededBlocks
    } = this.props;
    if (!getWalletReady) {
      onGetAvailableWallets().then(({ previousWallet }) => {
        if (previousWallet) {
          onStartWallet(previousWallet);
        }
      });
    }
    if (!getNeededBlocks) {
      determineNeededBlocks();
    }
    if (!getDaemonStarted) {
      setTimeout(() => prepStartDaemon(), 1000);
    }
  }

  onShowReleaseNotes() {
    this.setState({ showSettings: false, showLogs: false, showReleaseNotes: true });
  }

  onHideReleaseNotes() {
    this.setState({ showReleaseNotes: false });
  }

  onShowSettings() {
    this.setState({ showSettings: true, showLogs: false, showReleaseNotes: false });
  }

  onHideSettings() {
    this.setState({ showSettings: false });
  }

  onShowLogs() {
    this.setState({ showLogs: true, showSettings: false, showReleaseNotes: false });
  }

  onHideLogs() {
    this.setState({ showLogs: false });
  }

  getConditions() {
    const {
      isAdvancedDaemon,
      openForm,
      remoteAppdataError,
      isPrepared,
      getWalletReady
    } = this.props;

    return {
      advancedDaemonStartup:
        isAdvancedDaemon && openForm && !remoteAppdataError && !isPrepared && getWalletReady,
      remoteDataError: remoteAppdataError && !isPrepared && getWalletReady,
      walletNotReady: !getWalletReady
    };
  }
  getForm(conds) {
    if (conds.advancedDaemonStartup) {
      return AdvancedStartupBody;
    } else if (conds.remoteDataError) {
      return RemoteAppdataError;
    } else if (conds.walletNotReady) {
      return WalletSelectionBody;
    }
    switch (this.props.startStepIndex || 0) {
      case 2:
        if (this.props.hasExistingWallet) {
          return OpenWallet;
        }
      case 3: // eslint-disable-line no-fallthrough
      case 4:
        return StartRPCBody;
      case 5:
        return DiscoverAddressesBody;
      case 6:
        return FetchBlockHeadersBody;
      case 7:
        return RescanWalletBody;
    }
    return null;
  }

  getText(conds) {
    if (conds.advancedDaemonStartup || conds.remoteDataError || conds.walletNotReady) {
      return null;
    }

    switch (this.props.startStepIndex) {
      case 1:
        return (
          this.props.startupError || (
            <T id="getStarted.header.checkingWalletState.meta" m="Checking wallet state" />
          )
        );
      case 2:
        return null;
      case 3:
      case 4:
        return <T id="getStarted.header.startrpc.meta" m="Establishing RPC connection" />;
      case 5:
        return <T id="getStarted.header.discoveringAddresses.meta" m="Discovering addresses" />;
      case 6:
        return <T id="getStarted.header.fetchingBlockHeaders.meta" m="Fetching block headers" />;
      case 7:
        return <T id="getStarted.header.rescanWallet.meta" m="Scanning blocks for transactions" />;
    }
    return <T id="getStarted.header.finalizingSetup.meta" m="Finalizing setup" />;
  }

  render() {
    const {
      startStepIndex,
      isPrepared,
      isAdvancedDaemon,
      openForm,
      getWalletReady,
      remoteAppdataError,
      startupError,
      hasExistingWallet,
      ...props
    } = this.props;
    const { showSettings, showLogs, showReleaseNotes, ...state } = this.state;
    const {
      onShowReleaseNotes,
      onHideReleaseNotes,
      onShowSettings,
      onHideSettings,
      onShowLogs,
      onHideLogs
    } = this;

    let text, Form;
    if (showSettings) {
      return <Settings {...{ onShowLogs, onHideSettings, ...props }} />;
    } else if (showLogs) {
      return <Logs {...{ onShowSettings, onHideLogs, ...props }} />;
    } else if (showReleaseNotes) {
      return <ReleaseNotes {...{ onShowSettings, onShowLogs, onHideReleaseNotes, ...props }} />;
    } else if (
      isAdvancedDaemon &&
      openForm &&
      !remoteAppdataError &&
      !isPrepared &&
      getWalletReady
    ) {
      Form = AdvancedStartupBody;
    } else if (remoteAppdataError && !isPrepared && getWalletReady) {
      Form = RemoteAppdataError;
    } else if (!getWalletReady) {
      Form = WalletSelectionBody;
    } else {
      switch (startStepIndex || 0) {
        case 1:
          text = startupError ? (
            startupError
          ) : (
            <T id="getStarted.header.checkingWalletState.meta" m="Checking wallet state" />
          );
          break;
        case 2:
          if (hasExistingWallet) {
            Form = OpenWallet;
          } else {
            return <CreateWallet {...props} />;
          }
          break;
        case 3:
        case 4:
          text = <T id="getStarted.header.startrpc.meta" m="Establishing RPC connection" />;
          Form = StartRPCBody;
          break;
        case 5:
          text = <T id="getStarted.header.discoveringAddresses.meta" m="Discovering addresses" />;
          Form = DiscoverAddressesBody;
          break;
        case 6:
          text = <T id="getStarted.header.fetchingBlockHeaders.meta" m="Fetching block headers" />;
          Form = FetchBlockHeadersBody;
          break;
        case 7:
          text = (
            <T id="getStarted.header.rescanWallet.meta" m="Scanning blocks for transactions" />
          );
          Form = RescanWalletBody;
          break;
        default:
          text = <T id="getStarted.header.finalizingSetup.meta" m="Finalizing setup" />;
      }
    }

    return (
      <DaemonLoading
        Form={Form}
        {...{
          ...props,
          ...state,
          text,
          getWalletReady,
          startupError,
          showSettings,
          showLogs,
          onShowReleaseNotes,
          onHideReleaseNotes,
          onShowSettings,
          onHideSettings,
          onShowLogs,
          onHideLogs
        }}
      />
    );
  }
}

GetStartedPage.propTypes = GetStartedPageTypes;

export default walletStartup(GetStartedPage);
