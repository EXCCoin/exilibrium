import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as statisticsActions from "../actions/StatisticsActions";

const mapStateToProps = selectorMap({
  exportingData: selectors.exportingData
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      exportStatToCSV: statisticsActions.exportStatToCSV
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
