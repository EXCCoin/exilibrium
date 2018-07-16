import { SimpleLoading } from "indicators";
import "style/MiscComponents.less";

@autobind
class KeyBlueButton extends React.Component {
  onClick(e) {
    const { disabled, onClick } = this.props;
    if (!disabled && onClick) {
      onClick(e);
    }
  }
  render() {
    const { disabled, className, style, type, hidden, loading, children } = this.props;
    const buttonClassName = `button key-blue-button${disabled ? "-disabled" : ""} ${className}`;
    const buttonStyle = { ...style };

    if (!disabled && this.props.block) {
      buttonStyle.display = "block";
    }

    return (
      <div
        className={buttonClassName}
        style={buttonStyle}
        type={type}
        disabled={disabled}
        onClick={this.onClick}
        hidden={hidden}>
        {loading ? <SimpleLoading {...{ disabled }} /> : children}
      </div>
    );
  }
}

KeyBlueButton.propTypes = {
  disabled: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  hidden: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.element,
  type: PropTypes.string,
  block: PropTypes.bool,
  onClick: PropTypes.func
};

KeyBlueButton.defaultProps = {
  disabled: false,
  hidden: false,
  block: false,
  loading: false,
  className: ""
};

export default KeyBlueButton;
