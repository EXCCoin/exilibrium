import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import { Switch, Route, Redirect } from "react-router-dom";
import { IntlProvider } from "react-intl";
import MUItheme from "materialUITheme";
import { defaultFormats } from "i18n/locales";
import app from "connectors/app";
import { AnimatedSwitch } from "react-router-transition";
import GetStartedContainer from "./GetStarted";
import WalletContainer from "./Wallet";
import ShutdownAppPage from "components/views/ShutdownAppPage";
import FatalErrorPage from "components/views/FatalErrorPage";
import Snackbar from "components/Snackbar";
import "style/Layout.less";

const topLevelAnimation = {
  atEnter: { opacity: 0 },
  atLeave: { opacity: 0 },
  atActive: { opacity: 1 }
};

@autobind
class App extends React.Component {
  static propTypes = {
    locale: PropTypes.object.isRequired,
    window: PropTypes.object.isRequired,
    shutdownApp: PropTypes.func.isRequired,
    shutdownRequested: PropTypes.bool.isRequired,
    daemonStopped: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    const { window } = props;
    window.addEventListener("beforeunload", this.beforeWindowUnload);
    window.addEventListener("click", this.onClick);
    this.refreshing = false;

    props.listenForAppReloadRequest(this.onReloadRequested);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.beforeWindowUnload);
  }

  beforeWindowUnload(event) {
    if (this.refreshing) {
      return;
    }

    const { shutdownRequested, daemonStopped } = this.props;
    if (!daemonStopped) {
      event.preventDefault();
      event.returnValue = false;
    }

    if (!shutdownRequested) {
      this.props.shutdownApp();
    }
  }

  onReloadRequested(event) {
    this.refreshing = true;
    event.sender.send("app-reload-ui");
  }

  onClick(event) {
    const { target } = event;
    if (target.localName !== "a") {
      return;
    }
    const href = target.attributes.href ? target.attributes.href.value : "";
    if (href === "") {
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
  }

  render() {
    const { locale } = this.props;
    return (
      <MuiThemeProvider muiTheme={MUItheme}>
        <IntlProvider
          locale={locale.language}
          messages={locale.messages}
          formats={locale.formats}
          defaultFormats={defaultFormats}
          key={locale.key}>
          <Aux>
            <Switch>
              <Redirect from="/" exact to="/getStarted" />
            </Switch>
            <Snackbar />
            <AnimatedSwitch {...topLevelAnimation} className="top-level-container">
              <Route path="/getStarted" component={GetStartedContainer} />
              <Route path="/shutdown" component={ShutdownAppPage} />
              <Route path="/error" component={FatalErrorPage} />
              <Route path="/" component={WalletContainer} />
            </AnimatedSwitch>
            <div id="modal-portal" />
          </Aux>
        </IntlProvider>
      </MuiThemeProvider>
    );
  }
}

const ConnectedApp = app(App);

export default class extends React.Component {
  render() {
    return (
      <Provider store={this.props.store}>
        <ConnectedRouter history={this.props.history}>
          <Switch>
            <Route path="/" component={ConnectedApp} />
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}
