// components/PerformanceChart.tsx
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenteeGrowth } from "@/hooks/useMentorStats";

const RANGE_OPTIONS = [
  { value: "6", label: "Last 6 Months" },
  { value: "12", label: "Last 12 Months" },
];

interface MonthPoint {
  label: string;
  value: number;
  isCurrent: boolean;
}

/** Dot renderer that only paints the emphasised marker on the current month. */
const CurrentMonthDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload?.isCurrent || cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill="#FFFFFF" />
      <circle cx={cx} cy={cy} r={7} fill="#F97316" />
    </g>
  );
};

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as MonthPoint;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-gray-900">{point.label}</p>
      <p className="text-xs text-gray-500">
        {point.value} {point.value === 1 ? "mentee" : "mentees"} joined
      </p>
    </div>
  );
};

export default function PerformanceChart() {
  const [range, setRange] = useState("6");

  // How many mentees joined each month. The API aggregates server-side and
  // returns a dense series, so no client-side bucketing or row cap is needed.
  const { data, isLoading } = useMenteeGrowth(Number(range));

  const chartData: MonthPoint[] = useMemo(() => {
    const months = data?.months ?? [];

    return months.map((point, index) => ({
      label: point.label,
      value: point.count,
      isCurrent: index === months.length - 1,
    }));
  }, [data]);

  const currentLabel = chartData.find((p) => p.isCurrent)?.label;

  // Axis runs 0-20 in steps of 2. It still grows if a month ever exceeds 20,
  // widening the step so the label count stays roughly constant.
  const axisMax = useMemo(() => {
    const dataMax = chartData.reduce((max, p) => Math.max(max, p.value), 0);
    return Math.max(20, Math.ceil(dataMax * 1.25));
  }, [chartData]);

  const axisTicks = useMemo(() => {
    const step = Math.max(2, Math.ceil(axisMax / 10));
    const ticks: number[] = [];
    for (let value = 0; value <= axisMax; value += step) ticks.push(value);
    return ticks;
  }, [axisMax]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance</h2>
          <p className="mt-0.5 text-sm text-gray-500">Mentees joined per month</p>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-9 w-auto gap-2 rounded-lg border-gray-300 bg-white px-3 text-sm font-medium text-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 h-[260px] w-full">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-2xl bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 16, right: 8, bottom: 0, left: -16 }}
            >
              <defs>
                <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={(props: any) => {
                  const point = chartData[props.index];
                  return (
                    <text
                      x={props.x}
                      y={props.y + 14}
                      textAnchor="middle"
                      className={
                        point?.isCurrent
                          ? "fill-gray-900 text-xs font-semibold"
                          : "fill-gray-400 text-xs"
                      }
                    >
                      {props.payload.value}
                    </text>
                  );
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                allowDecimals={false}
                interval={0}
                domain={[0, axisMax]}
                ticks={axisTicks}
              />

              <Tooltip content={<ChartTooltip />} cursor={false} />

              {currentLabel && (
                <ReferenceLine
                  x={currentLabel}
                  stroke="#FDBA74"
                  strokeOpacity={0.35}
                  strokeWidth={48}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke="#F97316"
                strokeWidth={2.5}
                fill="url(#performanceFill)"
                dot={<CurrentMonthDot />}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
