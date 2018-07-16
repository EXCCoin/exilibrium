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
    const { disabled, className = "", style } = this.props;
    const buttonClassName = `button key-blue-button${disabled ? "-disabled" : ""} ${className}`;
    const buttonStyle = { ...style };

    if (!disabled && this.props.block) {
      buttonStyle.display = "block";
    }

    return (
      <div
        className={buttonClassName}
        style={buttonStyle}
        type={this.props.type}
        disabled={disabled}
        onClick={this.onClick}
        hidden={this.props.hidden}>
        {this.props.loading ? <SimpleLoading {...{ disabled }} /> : this.props.children}
      </div>
    );
  }
}

export default KeyBlueButton;
