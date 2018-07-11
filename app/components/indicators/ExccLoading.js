import "style/Loading.less";

const ExccLoading = ({ hidden, grey = false }) => (
  <div
    className={grey ? "new-logo-animation-grey" : "new-logo-animation"}
    style={{ display: hidden ? "none" : "block" }}
  />
);

export default ExccLoading;
