import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import messages from "./messages";
import { injectIntl } from "react-intl";
import {
  yAxisStyle,
  xAxisStyle,
  homeChartSize,
  padding,
  radiusMiddle,
  radiusTop,
  radiusBottom
} from "./Styles";
import ChartTooltip from "./ChartTooltip";

const BalanceChart = ({ data, intl }) => {
  const lockedKey = intl.formatMessage(messages.lockedKey);
  const immatureKey = intl.formatMessage(messages.immatureKey);
  const votedKey = intl.formatMessage(messages.votedKey);
  const ticketKey = intl.formatMessage(messages.ticketKey);
  const revokedKey = intl.formatMessage(messages.revokedKey);

  const displayData = data.map(s => ({
    name: intl.formatMessage(messages.dayMonthDisplay, { value: s.time }),
    legendName: intl.formatMessage(messages.fullDayDisplay, { value: s.time }),
    [votedKey]: s.voted,
    [revokedKey]: s.revoked,
    [ticketKey]: s.ticket,
    [immatureKey]: s.immature,
    [lockedKey]: s.locked
  }));

  return (
    <BarChart
      stackOffset="sign"
      width={homeChartSize.width}
      height={homeChartSize.height}
      data={displayData}>
      <XAxis dataKey="name" style={yAxisStyle} />
      <YAxis orientation="right" style={xAxisStyle} padding={padding} />
      <Tooltip content={<ChartTooltip />} />
      <Bar barSize={8} dataKey={lockedKey} stackId="a" fill="#6073E9" radius={radiusBottom} />
      <Bar barSize={8} dataKey={revokedKey} stackId="a" fill="#4143CD" radius={radiusMiddle} />
      <Bar barSize={8} dataKey={ticketKey} stackId="a" fill="#88A6FC" radius={radiusMiddle} />
      <Bar barSize={8} dataKey={immatureKey} stackId="a" fill="#FA78AF" radius={radiusMiddle} />
      <Bar barSize={8} dataKey={votedKey} stackId="a" fill="#FA5BAA" radius={radiusTop} />
    </BarChart>
  );
};

export default injectIntl(BalanceChart);
