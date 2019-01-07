import { snackbar } from "connectors";
import MUISnackbar from "material-ui/Snackbar";
import Notification from "./Notification";
import {
  TRANSACTION_DIR_SENT,
  TRANSACTION_DIR_RECEIVED,
  TRANSACTION_DIR_TRANSFERED
} from "wallet/service";
import "style/Snackbar.less";

const propTypes = {
  messages: PropTypes.array.isRequired,
  onDismissAllMessages: PropTypes.func.isRequired
};

const snackbarClasses = ({ type }) =>
  ({
    Ticket: "snackbar snackbar-stake",
    Vote: "snackbar snackbar-stake",
    Revocation: "snackbar snackbar-stake",
    [TRANSACTION_DIR_RECEIVED]: "snackbar snackbar-receive",
    [TRANSACTION_DIR_SENT]: "snackbar snackbar-send",
    [TRANSACTION_DIR_TRANSFERED]: "snackbar snackbar-transfer",
    Warning: "snackbar snackbar-warning",
    Error: "snackbar snackbar-error",
    Success: "snackbar snackbar-success"
  }[type] || "snackbar");

@autobind
class Snackbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUsefulMessage: null,
      message: props.messages.length > 0 ? props.messages[props.messages.length - 1] : null
    };
  }

  messagesAreEqual(previous, current) {
    if (previous && current && previous.message && current.message) {
      return `${previous.type}${previous.message.id}` === `${current.type}${current.message.id}`;
    }
    return previous === current;
  }

  componentDidUpdate() {
    const message =
      this.props.messages.length > 0 ? this.props.messages[this.props.messages.length - 1] : null;
    if (message !== this.state.message && message !== null) {
      if (!this.messagesAreEqual(this.state.lastUsefulMessage, message)) {
        this.setState(
          state => ({ ...state, message, lastUsefulMessage: message }),
          () => {
            // we don't want subsequent notifications to be the same in shorter timeframe
            setTimeout(() => {
              this.setState({ lastUsefulMessage: null });
            }, 7000);
          }
        );
      }
    }
  }

  onDismissMessage() {
    this.setState({ ...this.state, message: null });
    this.props.onDismissAllMessages();
  }

  onRequestClose(reason) {
    if (reason !== "clickaway") {
      this.onDismissMessage();
    }
  }

  render() {
    const { message } = this.state;
    return (
      <MUISnackbar
        className={snackbarClasses(message || "")}
        open={Boolean(message)}
        message={message ? <Notification {...message} /> : ""}
        autoHideDuration={4000}
        bodyStyle={{
          backgroundColor: "inherited",
          fontFamily: null,
          lineHeight: null,
          height: null
        }}
        style={{ fontFamily: null, lineHeight: null }}
        onRequestClose={this.onRequestClose}
      />
    );
  }
}

Snackbar.propTypes = propTypes;

export default snackbar(Snackbar);
