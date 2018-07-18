import { ExccLoader } from "indicators";
import StakePools from "./StakePools";
import Tickets from "./Tickets";
import "style/StakePool.less";

const PurchasePage = ({
  isSavingStakePoolConfig,
  isPurchasingTickets,
  isImportingScript,
  stakePool,
  isShowingStakePools,
  onHideStakePoolConfig,
  ...props
}) =>
  isSavingStakePoolConfig || isPurchasingTickets || isImportingScript ? (
    <ExccLoader center />
  ) : isShowingStakePools ? (
    <StakePools {...{ onHideStakePoolConfig }} />
  ) : (
    <Tickets {...{ stakePool, ...props }} />
  );

export default PurchasePage;
