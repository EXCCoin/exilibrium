import { connect } from "react-redux";
import { selectorMap } from "fp";
import * as selectors from "selectors";

const mapStateToProps = selectorMap({
  lockedTotalBalance: selectors.lockedBalance,
  spendableTotalBalance: selectors.spendableTotalBalance,
  spendableAndLockedBalance: selectors.spendableAndLockedBalance
});

export default connect(mapStateToProps);
