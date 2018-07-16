import KeyBlueButton from "./KeyBlueButton";

const MiningToggleButton = ({ onClick, miningEnabled, children }) => (
  <KeyBlueButton
    onClick={onClick}
    className={miningEnabled ? "key-blue-button" : "slate-gray-button"}>
    {children}
  </KeyBlueButton>
);

MiningToggleButton.propTypes = {
  miningEnabled: PropTypes.bool.isRequired
};

export default MiningToggleButton;
