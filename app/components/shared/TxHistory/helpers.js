import { FormattedMessage as T } from "react-intl";
import * as txTypes from "constants/decrediton";

export const messageByType = {
  [txTypes.TICKET]: <T id="transaction.type.ticket" m="Purchased" />,
  [txTypes.VOTED]: <T id="transaction.type.voted" m="Voted" />,
  [txTypes.REVOKED]: <T id="transaction.type.revoked" m="Revoked" />,
  [txTypes.VOTE]: <T id="transaction.type.vote" m="Vote" />,
  [txTypes.REVOCATION]: <T id="transaction.type.revocation" m="Revocation" />,
  [txTypes.UNMINED]: <T id="transaction.type.unmined" m="Unmined" />,
  [txTypes.IMMATURE]: <T id="transaction.type.immature" m="Immature" />,
  [txTypes.MISSED]: <T id="transaction.type.missed" m="Missed" />,
  [txTypes.EXPIRED]: <T id="transaction.type.expired" m="Expired" />,
  [txTypes.LIVE]: <T id="transaction.type.live" m="Live" />
};
