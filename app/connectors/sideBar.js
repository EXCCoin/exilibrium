import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";
import * as clientActions from "../actions/ClientActions";
import * as sidebarActions from "../actions/SidebarActions";

const mapStateToProps = selectorMap({
  isTestNet: selectors.isTestNet,
  balances: selectors.balances,
  currentBlockHeight: selectors.currentBlockHeight,
  lastBlockTimestamp: selectors.lastBlockTimestamp,
  totalBalance: selectors.totalBalance,
  showingSidebar: selectors.showingSidebar,
  showingSidebarMenu: selectors.showingSidebarMenu,
  expandSideBar: selectors.expandSideBar
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateBlockTimeSince: clientActions.updateBlockTimeSince,
      onExpandSideBar: sidebarActions.expandSideBar,
      onReduceSideBar: sidebarActions.reduceSideBar
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
