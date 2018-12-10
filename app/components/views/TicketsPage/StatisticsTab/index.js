import StatisticsPage from "./Page";
import { myTicketsCharts } from "connectors";

@autobind
class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasStats: props.voteTimeStats && !props.getMyTicketsStatsRequest };
  }

  componentDidMount() {
    const { voteTimeStats, getMyTicketsStatsRequest, allTickets, getMyTicketsStats } = this.props;
    if (!voteTimeStats && !getMyTicketsStatsRequest && allTickets.length > 0) {
      getMyTicketsStats();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.voteTimeStats !== this.props.voteTimeStats ||
      prevProps.getMyTicketsStatsRequest !== this.props.getMyTicketsStatsRequest
    ) {
      this.setState({ hasStats: this.props.voteTimeStats && !this.props.getMyTicketsStatsRequest });
    }
  }

  render() {
    return (
      <StatisticsPage
        {...{
          ...this.props,
          ...this.state
        }}
      />
    );
  }
}

export default myTicketsCharts(Statistics);
