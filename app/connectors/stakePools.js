import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as stakePoolActions from "../actions/StakePoolActions";

const mapStateToProps = selectorMap({
  configuredStakePools: selectors.configuredStakePools,
  unconfiguredStakePools: selectors.unconfiguredStakePools,
  defaultStakePool: selectors.defaultStakePool,
  stakePool: selectors.selectedStakePool,
  rescanRequest: selectors.rescanRequest,
  apiAddress: selectors.apiAddress
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onSetStakePoolInfo: stakePoolActions.setStakePoolInformation,
      onRemoveStakePool: stakePoolActions.removeStakePoolConfig,
      discoverAvailableStakepools: stakePoolActions.discoverAvailableStakepools
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
