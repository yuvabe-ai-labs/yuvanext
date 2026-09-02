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
import { useMeetings } from "@/hooks/useMeetingsManagement";
import type { Meeting } from "@/types/meetings.types";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
        {point.value} {point.value === 1 ? "meeting" : "meetings"}
      </p>
    </div>
  );
};

export default function PerformanceChart() {
  const [range, setRange] = useState("6");

  // Meetings are the only mentor-side activity series the API exposes, so the
  // performance curve plots scheduled/held meetings per month.
  const { data, isLoading } = useMeetings({ page: 1, limit: 200 });

  const chartData: MonthPoint[] = useMemo(() => {
    const months = Number(range);
    const now = new Date();
    const buckets: MonthPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: MONTH_LABELS[d.getMonth()],
        value: 0,
        isCurrent: i === 0,
      });
    }

    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    (data?.data ?? []).forEach((meeting: Meeting) => {
      if (meeting.status === "cancelled") return;
      const scheduled = new Date(meeting.scheduledAt);
      if (Number.isNaN(scheduled.getTime()) || scheduled < start) return;

      const index =
        (scheduled.getFullYear() - start.getFullYear()) * 12 +
        (scheduled.getMonth() - start.getMonth());

      if (index >= 0 && index < buckets.length) buckets[index].value += 1;
    });

    return buckets;
  }, [data, range]);

  const currentLabel = chartData.find((p) => p.isCurrent)?.label;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Performance</h2>

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
                domain={[0, (max: number) => Math.max(4, Math.ceil(max * 1.25))]}
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
