import Logs from "./Page";
import { getExccdLogs, getExccwalletLogs, getExilibriumLogs } from "wallet";
import { logging } from "connectors";
import { DescriptionHeader } from "layout";
import { FormattedMessage as T } from "react-intl";

export const LogsTabHeader = () => (
  <DescriptionHeader
    description={
      <T
        id="help.description.logs"
        m="Please find your current logs below to look for any issue or error you are having."
      />
    }
  />
);
@autobind
class LogsTabBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      exccdLogs: null,
      exccwalletLogs: null,
      exilibriumLogs: null
    };
  }

  render() {
    const {
      showExilibriumLogs,
      showExccdLogs,
      showExccwalletLogs,
      hideExilibriumLogs,
      hideExccdLogs,
      hideExccwalletLogs
    } = this;
    const { isDaemonRemote, isDaemonStarted } = this.props;
    const { exccdLogs, exccwalletLogs, exilibriumLogs } = this.state;
    return (
      <Logs
        {...{
          ...this.props,
          ...this.state
        }}
        {...{
          showExilibriumLogs,
          showExccdLogs,
          showExccwalletLogs,
          hideExilibriumLogs,
          hideExccdLogs,
          hideExccwalletLogs,
          exccdLogs,
          exccwalletLogs,
          exilibriumLogs,
          isDaemonRemote,
          isDaemonStarted
        }}
      />
    );
  }

  showExilibriumLogs() {
    getExilibriumLogs()
      .then(logs => {
        this.setState({ exilibriumLogs: Buffer.from(logs).toString("utf8") });
      })
      .catch(err => console.error(err));
  }

  hideExilibriumLogs() {
    this.setState({ exilibriumLogs: null });
  }

  showExccdLogs() {
    getExccdLogs()
      .then(logs => {
        this.setState({ exccdLogs: Buffer.from(logs).toString("utf8") });
      })
      .catch(err => console.error(err));
  }

  hideExccdLogs() {
    this.setState({ exccdLogs: null });
  }

  showExccwalletLogs() {
    getExccwalletLogs()
      .then(logs => {
        this.setState({ exccwalletLogs: Buffer.from(logs).toString("utf8") });
      })
      .catch(err => console.error(err));
  }

  hideExccwalletLogs() {
    this.setState({ exccwalletLogs: null });
  }
}

export const LogsTab = logging(LogsTabBody);
