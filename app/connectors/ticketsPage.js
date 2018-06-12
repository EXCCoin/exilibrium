import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";
import * as controlActions from "actions/ControlActions";
import * as stakePoolActions from "actions/StakePoolActions";

const mapStateToProps = selectorMap({
  spendingAccounts: selectors.spendingAccounts,
  configuredStakePools: selectors.configuredStakePools,
  unconfiguredStakePools: selectors.unconfiguredStakePools,
  defaultSpendingAccount: selectors.defaultSpendingAccount,
  defaultStakePool: selectors.defaultStakePool,
  stakePool: selectors.selectedStakePool,
  ticketPrice: selectors.ticketPrice,
  currentStakePoolConfigError: selectors.currentStakePoolConfigError,
  currentStakePoolConfigSuccessMessage: selectors.currentStakePoolConfigSuccessMessage,
  purchaseTicketsError: selectors.purchaseTicketsError,
  purchaseTicketsSuccess: selectors.purchaseTicketsSuccess,
  revokeTicketsError: selectors.revokeTicketsError,
  revokeTicketsSuccess: selectors.revokeTicketsSuccess,
  startAutoBuyerSuccess: selectors.startAutoBuyerSuccess,
  stopAutoBuyerSuccess: selectors.stopAutoBuyerSuccess,
  startAutoBuyerError: selectors.startAutoBuyerError,
  stopAutoBuyerError: selectors.stopAutoBuyerError,
  importScriptError: selectors.importScriptError,
  importScriptSuccess: selectors.importScriptSuccess,
  isImportingScript: selectors.isImportingScript,
  isPurchasingTickets: selectors.isPurchasingTickets,
  isSavingStakePoolConfig: selectors.isSavingStakePoolConfig,
  isTestNet: selectors.isTestNet
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onRevokeTickets: controlActions.revokeTicketsAttempt,
      onImportScript: controlActions.importScriptAttempt,
      onClearRevokeTicketsError: controlActions.clearRevokeTicketsError,
      onClearRevokeTicketsSuccess: controlActions.clearRevokeTicketsSuccess,
      onClearImportScriptError: controlActions.clearImportScriptError,
      onClearImportScriptSuccess: controlActions.clearImportScriptSuccess,
      onChangeStakePool: stakePoolActions.changeSelectedStakePool
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
