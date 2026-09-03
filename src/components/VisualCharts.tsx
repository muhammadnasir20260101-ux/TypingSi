import React from 'react';
import { Language, TypingSessionResult } from '../types';

interface WpmHistoryChartProps {
  sessions: TypingSessionResult[];
  lang?: Language;
}

export const WpmHistoryChart: React.FC<WpmHistoryChartProps> = ({ sessions, lang = 'ar' }) => {
  // Take last 15 sessions in chronological order
  const data = sessions.slice(0, 15).reverse();

  if (data.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        {lang === 'en'
          ? 'Complete at least 2 sessions to visualize speed progression.'
          : lang === 'bn'
          ? 'গতির পরিবর্তন দেখতে অন্তত ২টি সেশন সম্পন্ন করুন।'
          : 'أكمل جلستين على الأقل لتتبع خط تطور سرعتك بيانيا.'}
      </div>
    );
  }

  const height = 180;
  const width = 500;
  const padding = 35;

  const maxWpm = Math.max(40, ...data.map((d) => d.wpm));
  const minWpm = Math.min(0, ...data.map((d) => d.wpm));
  const range = maxWpm - minWpm || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.wpm - minWpm) / range) * (height - padding * 2);
    return { x, y, wpm: d.wpm, title: d.title };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 overflow-visible select-none"
      >
        <defs>
          <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = height - padding - ratio * (height - padding * 2);
          const val = Math.round(minWpm + ratio * range);
          return (
            <g key={`grid-${idx}`}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#94a3b8"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 6}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        <path d={areaD} fill="url(#wpmGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((pt, idx) => (
          <g key={`pt-${idx}`} className="group cursor-pointer">
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-transform duration-150 group-hover:scale-150"
            />
            {/* Value Label */}
            <text
              x={pt.x}
              y={pt.y - 8}
              textAnchor="middle"
              className="text-[10px] font-bold font-mono fill-emerald-600 dark:fill-emerald-400"
            >
              {pt.wpm}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

interface AccuracyBarChartProps {
  sessions: TypingSessionResult[];
  lang?: Language;
}

export const AccuracyBarChart: React.FC<AccuracyBarChartProps> = ({ sessions, lang = 'ar' }) => {
  const data = sessions.slice(0, 10).reverse();

  if (data.length < 1) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        {lang === 'en'
          ? 'No accuracy history yet.'
          : lang === 'bn'
          ? 'কোনো নির্ভুলতা রেকর্ড নেই।'
          : 'لا توجد سجلات دقة سابقة حتى الآن.'}
      </div>
    );
  }

  const height = 180;
  const width = 500;
  const padding = 35;
  const barWidth = Math.min(28, (width - padding * 2) / data.length - 8);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 overflow-visible select-none"
      >
        {/* Baseline 100% */}
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="#94a3b8"
          strokeOpacity="0.2"
          strokeDasharray="4 4"
        />
        <text
          x={padding - 6}
          y={padding + 4}
          textAnchor="end"
          className="text-[10px] fill-slate-400 font-mono"
        >
          100%
        </text>

        {/* 50% line */}
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#94a3b8"
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />
        <text
          x={padding - 6}
          y={height / 2 + 4}
          textAnchor="end"
          className="text-[10px] fill-slate-400 font-mono"
        >
          50%
        </text>

        {data.map((d, idx) => {
          const stepX = (width - padding * 2) / data.length;
          const x = padding + idx * stepX + (stepX - barWidth) / 2;
          const barHeight = (d.accuracy / 100) * (height - padding * 2);
          const y = height - padding - barHeight;
          const isHigh = d.accuracy >= 90;

          return (
            <g key={`bar-${idx}`} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={isHigh ? '#3b82f6' : '#f59e0b'}
                className="transition-all duration-200 group-hover:opacity-80"
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="text-[10px] font-bold font-mono fill-slate-700 dark:fill-slate-300"
              >
                {d.accuracy}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
