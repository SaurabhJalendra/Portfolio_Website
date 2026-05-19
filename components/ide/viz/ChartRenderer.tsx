"use client";

// ChartRenderer — ported from _legacy/src/components/ui/visualizations/ChartRenderer.tsx
//
// Parses the lightweight YAML-ish `chart:bar` / `chart:line` / `chart:area`
// code-fence syntax and renders a Recharts visualization. Colors are pulled
// from the active IDE theme so the chart adapts to midnight / phosphor /
// paper / solar.

import { useContext, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ThemeCtx } from '@/lib/theme';

interface ChartData {
  type: 'bar' | 'line' | 'area';
  title?: string;
  xlabel?: string;
  ylabel?: string;
  data?: Array<{ label: string; value: number }>;
  series?: Array<{ name: string; data: Array<[number, number]> }>;
}

function parseChartData(raw: string, type: string): ChartData {
  const chart: ChartData = { type: type as ChartData['type'] };
  const lines = raw.trim().split('\n');
  let currentKey = '';
  const currentList: Array<{ label: string; value?: number }> = [];
  let currentSeries: { name: string; data: Array<[number, number]> } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('title:')) {
      chart.title = trimmed.slice(6).trim();
    } else if (trimmed.startsWith('xlabel:')) {
      chart.xlabel = trimmed.slice(7).trim();
    } else if (trimmed.startsWith('ylabel:')) {
      chart.ylabel = trimmed.slice(7).trim();
    } else if (trimmed === 'data:') {
      currentKey = 'data';
    } else if (trimmed === 'series:') {
      currentKey = 'series';
      chart.series = [];
    } else if (currentKey === 'data' && trimmed.startsWith('- label:')) {
      const label = trimmed.slice(8).trim();
      currentList.push({ label });
    } else if (currentKey === 'data' && trimmed.startsWith('value:')) {
      if (currentList.length > 0) {
        currentList[currentList.length - 1].value = parseFloat(trimmed.slice(6).trim());
      }
    } else if (currentKey === 'series' && trimmed.startsWith('- name:')) {
      if (currentSeries) chart.series!.push(currentSeries);
      currentSeries = { name: trimmed.slice(7).trim(), data: [] };
    } else if (currentKey === 'series' && trimmed.startsWith('data:')) {
      const dataStr = trimmed.slice(5).trim();
      try {
        const parsed = JSON.parse(dataStr);
        if (currentSeries) currentSeries.data = parsed;
      } catch {
        // Malformed data line — skip silently
      }
    }
  }
  if (currentSeries && chart.series) chart.series.push(currentSeries);
  if (currentKey === 'data') chart.data = currentList as ChartData['data'];

  return chart;
}

export function ChartRenderer({ content, chartType }: { content: string; chartType: string }) {
  const T = useContext(ThemeCtx);
  const chart = useMemo(() => parseChartData(content, chartType), [content, chartType]);

  // Series palette derived from theme — primary accent + harmonious syntax colors.
  const COLORS = [
    T.accent,
    T.syntax.code,
    T.syntax.quote,
    T.syntax.listBullet,
    T.syntax.linkText,
  ];

  const gridStroke = T.chrome.border;
  const tickFill = T.chrome.fgDim;
  const labelFill = T.chrome.fgFainter;

  const tooltipStyle: React.CSSProperties = {
    background: T.chrome.editor,
    border: '1px solid ' + T.chrome.borderStrong,
    borderRadius: 6,
    color: T.chrome.fg,
    fontFamily: '"Geist Mono", monospace',
    fontSize: 12,
  };
  const tooltipItemStyle: React.CSSProperties = { color: T.chrome.fg };
  const tooltipLabelStyle: React.CSSProperties = { color: T.chrome.fgDim };

  const tickStyle = { fill: tickFill, fontSize: 11, fontFamily: '"Geist Mono", monospace' };

  // Convert series data to recharts format
  const seriesData = useMemo(() => {
    if (!chart.series) return [];
    const allXValues = new Set<number>();
    chart.series.forEach(s => s.data.forEach(([x]) => allXValues.add(x)));
    return Array.from(allXValues).sort((a, b) => a - b).map(x => {
      const point: Record<string, number> = { x };
      chart.series!.forEach(s => {
        const match = s.data.find(([sx]) => sx === x);
        if (match) point[s.name] = match[1];
      });
      return point;
    });
  }, [chart.series]);

  const commonProps = {
    margin: { top: 10, right: 20, left: 60, bottom: 20 },
  };

  const yLabelProps = chart.ylabel
    ? { value: chart.ylabel, angle: -90, position: 'insideLeft' as const, fill: labelFill, fontSize: 11, offset: -45 }
    : undefined;

  return (
    <div
      style={{
        margin: '24px 0',
        padding: '16px',
        background: T.chrome.titlebar,
        border: '1px solid ' + T.chrome.border,
        borderRadius: 10,
        overflowX: 'auto',
      }}
    >
      {chart.title && (
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: T.chrome.fg,
            margin: '0 0 14px',
            fontFamily: '"Geist Mono", monospace',
            letterSpacing: '0.02em',
          }}
        >
          {chart.title}
        </h4>
      )}
      <div style={{ width: '100%', height: 340, minWidth: 0 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 340 }}
        >
          {chart.type === 'bar' && chart.data ? (
            <BarChart data={chart.data} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="label" tick={tickStyle} angle={-20} textAnchor="end" height={50} stroke={gridStroke} />
              <YAxis
                tick={tickStyle}
                label={yLabelProps}
                width={70}
                stroke={gridStroke}
                tickFormatter={(v: number) => v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}K` : String(v)}
              />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: T.chrome.hoverBg }} />
              <Bar dataKey="value" fill={T.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chart.type === 'line' && chart.series ? (
            <LineChart data={seriesData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="x"
                tick={tickStyle}
                stroke={gridStroke}
                label={chart.xlabel ? { value: chart.xlabel, position: 'bottom', fill: labelFill, fontSize: 11, offset: -10 } : undefined}
                height={40}
              />
              <YAxis
                tick={tickStyle}
                label={yLabelProps}
                width={70}
                stroke={gridStroke}
                tickFormatter={(v: number) => v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}K` : String(v)}
              />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ stroke: T.chrome.borderStrong }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: '"Geist Mono", monospace', color: T.chrome.fgDim }} />
              {chart.series.map((s, i) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : chart.type === 'area' && chart.series ? (
            <AreaChart data={seriesData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="x" tick={tickStyle} stroke={gridStroke} />
              <YAxis tick={tickStyle} stroke={gridStroke} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ stroke: T.chrome.borderStrong }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: '"Geist Mono", monospace', color: T.chrome.fgDim }} />
              {chart.series.map((s, i) => (
                <Area key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
              ))}
            </AreaChart>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: T.chrome.fgFainter,
                fontFamily: '"Geist Mono", monospace',
                fontSize: 13,
              }}
            >
              No chart data
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
