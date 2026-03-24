import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface ChartData {
  type: 'bar' | 'line' | 'area'
  title?: string
  xlabel?: string
  ylabel?: string
  data?: Array<{ label: string; value: number }>
  series?: Array<{ name: string; data: Array<[number, number]> }>
}

function parseChartData(raw: string, type: string): ChartData {
  const chart: ChartData = { type: type as ChartData['type'] }
  const lines = raw.trim().split('\n')
  let currentKey = ''
  const currentList: Array<{ label: string; value?: number }> = []
  let currentSeries: { name: string; data: Array<[number, number]> } | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('title:')) {
      chart.title = trimmed.slice(6).trim()
    } else if (trimmed.startsWith('xlabel:')) {
      chart.xlabel = trimmed.slice(7).trim()
    } else if (trimmed.startsWith('ylabel:')) {
      chart.ylabel = trimmed.slice(7).trim()
    } else if (trimmed === 'data:') {
      currentKey = 'data'
    } else if (trimmed === 'series:') {
      currentKey = 'series'
      chart.series = []
    } else if (currentKey === 'data' && trimmed.startsWith('- label:')) {
      const label = trimmed.slice(8).trim()
      currentList.push({ label })
    } else if (currentKey === 'data' && trimmed.startsWith('value:')) {
      if (currentList.length > 0) {
        currentList[currentList.length - 1].value = parseFloat(trimmed.slice(6).trim())
      }
    } else if (currentKey === 'series' && trimmed.startsWith('- name:')) {
      if (currentSeries) chart.series!.push(currentSeries)
      currentSeries = { name: trimmed.slice(7).trim(), data: [] }
    } else if (currentKey === 'series' && trimmed.startsWith('data:')) {
      const dataStr = trimmed.slice(5).trim()
      try {
        const parsed = JSON.parse(dataStr)
        if (currentSeries) currentSeries.data = parsed
      } catch {
        // Malformed data line — skip silently
      }
    }
  }
  if (currentSeries && chart.series) chart.series.push(currentSeries)
  if (currentKey === 'data') chart.data = currentList as ChartData['data']

  return chart
}

const COLORS = ['#2563eb', '#dc2626', '#9ca3af', '#16a34a', '#ea580c']

const TOOLTIP_STYLE = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
}

const TICK_STYLE = { fill: '#6b7280', fontSize: 12 }

const GRID_STROKE = '#e5e7eb'

export function ChartRenderer({ content, chartType }: { content: string; chartType: string }) {
  const chart = useMemo(() => parseChartData(content, chartType), [content, chartType])

  // Convert series data to recharts format
  const seriesData = useMemo(() => {
    if (!chart.series) return []
    const allXValues = new Set<number>()
    chart.series.forEach(s => s.data.forEach(([x]) => allXValues.add(x)))
    return Array.from(allXValues).sort((a, b) => a - b).map(x => {
      const point: Record<string, number> = { x }
      chart.series!.forEach(s => {
        const match = s.data.find(([sx]) => sx === x)
        if (match) point[s.name] = match[1]
      })
      return point
    })
  }, [chart.series])

  const commonProps = {
    margin: { top: 10, right: 30, left: 20, bottom: 5 },
  }

  const yLabelProps = chart.ylabel
    ? { value: chart.ylabel, angle: -90, position: 'insideLeft' as const, fill: '#6b7280', fontSize: 12 }
    : undefined

  return (
    <div className="my-8 p-6 bg-gray-50 border border-gray-200">
      {chart.title && (
        <h4 className="text-sm font-semibold text-black mb-4">{chart.title}</h4>
      )}
      <ResponsiveContainer width="100%" height={300}>
        {chart.type === 'bar' && chart.data ? (
          <BarChart data={chart.data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis dataKey="label" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} label={yLabelProps} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : chart.type === 'line' && chart.series ? (
          <LineChart data={seriesData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis
              dataKey="x"
              tick={TICK_STYLE}
              label={chart.xlabel ? { value: chart.xlabel, position: 'bottom', fill: '#6b7280', fontSize: 12 } : undefined}
            />
            <YAxis tick={TICK_STYLE} label={yLabelProps} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            {chart.series.map((s, i) => (
              <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        ) : chart.type === 'area' && chart.series ? (
          <AreaChart data={seriesData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis dataKey="x" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            {chart.series.map((s, i) => (
              <Area key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
            ))}
          </AreaChart>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No chart data</div>
        )}
      </ResponsiveContainer>
    </div>
  )
}
