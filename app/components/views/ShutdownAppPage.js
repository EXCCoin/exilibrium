import { FormattedMessage as T } from "react-intl";
import { shutdownPage } from "connectors";
import { ExccLoading } from "indicators";
import "style/Layout.less";

class ShutdownAppPage extends React.Component {
  componentDidMount() {
    this.props.cleanShutdown();
  }

  render() {
    return (
      <div className="page-body getstarted">
        <ExccLoading className="get-started-loading" />
        <div className="shutdown-text">
          <T id="shutdown.header.title" m="Shutting down Exilibrium" />
        </div>
      </div>
    );
  }
}

export default shutdownPage(ShutdownAppPage);
