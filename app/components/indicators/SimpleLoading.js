import "style/SimpleLoading.less";

const SimpleLoading = ({ disabled }) => (
  <div className={`spinner ${disabled ? "disabled" : ""}`}>
    <div className="bounce1" />
    <div className="bounce2" />
    <div className="bounce3" />
  </div>
);

export default SimpleLoading;
