import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { bindActionCreators } from "redux";
import * as selectors from "../selectors";
import * as decodeMessageActions from "../actions/DecodeMessageActions";
import * as clientActions from "../actions/ClientActions";

const mapStateToProps = selectorMap({
  tickets: selectors.viewedTicketListing
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      decodeRawTransactions: decodeMessageActions.decodeRawTransactions,
      goBackHistory: clientActions.goBackHistory
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
