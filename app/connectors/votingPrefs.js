import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";
import * as clientActions from "actions/ClientActions";
import * as stakePoolActions from "actions/StakePoolActions";

const mapStateToProps = selectorMap({
  configuredStakePools: selectors.configuredStakePools,
  defaultStakePool: selectors.defaultStakePool,
  stakePool: selectors.selectedStakePool,
  agendas: selectors.agendas
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onUpdateVotePreference: clientActions.setVoteChoicesAttempt,
      onChangeStakePool: stakePoolActions.changeSelectedStakePool
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
