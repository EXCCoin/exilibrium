import { showCheck } from "helpers";
import ReactDOM from "react-dom";
import { modal } from "connectors";
import "style/Modals.less";

@autobind
class Modal extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.modalShown();
  }

  componentWillUnmount() {
    this.props.modalHidden();
  }

  render() {
    const { children, className } = this.props;
    const domNode = document.getElementById("modal-portal");

    return ReactDOM.createPortal(
      <React.Fragment>
        <div className="app-modal-overlay" />
        <div className={`app-modal ${className || ""}`}>{children}</div>
      </React.Fragment>,
      domNode
    );
  }
}

export default showCheck(modal(Modal));
