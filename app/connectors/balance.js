import { connect } from "react-redux";
import { selectorMap } from "../fp";
import * as selectors from "../selectors";

const mapStateToProps = selectorMap({
  currencyDisplay: selectors.currencyDisplay,
  unitDivisor: selectors.unitDivisor
});

export default connect(mapStateToProps);
