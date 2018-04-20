import "style/Loading.less";

const ExccLoading = ({ hidden }) => (
  <div
    className={"new-logo-animation"}
    style={{ display: hidden ? "none" : "block" }}/>
);

export default ExccLoading;
