import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { Trash2, Award, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import type { TimeRecord, PuzzleType, ExternalStats } from '../types/cube';
import { exportRecords } from '../utils/storage';

interface StatisticsProps {
  records: TimeRecord[];
  puzzleType: PuzzleType;
  externalStats: ExternalStats | null;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

// 计算 AoN：去掉最好和最差，平均中间成绩；DNF 按 Infinity 处理
function calcAo(records: TimeRecord[], startIndex: number, n: number): number | null {
  if (startIndex + n > records.length) return null;
  const slice = records.slice(startIndex, startIndex + n);
  const times = slice.map(r => r.dnf ? Infinity : r.time + (r.plus2 ? 2000 : 0));
  const sorted = [...times].sort((a, b) => a - b);
  const middle = sorted.slice(1, n - 1);
  if (middle.some(t => t === Infinity)) return Infinity;
  return middle.reduce((a, b) => a + b, 0) / middle.length;
}

export default function Statistics({ records, puzzleType, externalStats, onDeleteRecord, onClearAll }: StatisticsProps) {
  const handleSaveRecords = () => exportRecords(records, puzzleType);


  // 格式化时间
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000);
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  // 计算统计数据
  const stats = useMemo(() => {
    if (records.length === 0) {
      return {
        best: 0,
        worst: 0,
        average: 0,
        avg5: 0,
        avg12: 0,
        total: 0,
      };
    }

    const validRecords = records.filter(r => !r.dnf);
    const times = validRecords.map(r => r.time + (r.plus2 ? 2000 : 0));

    const best = times.length > 0 ? Math.min(...times) : 0;
    const worst = times.length > 0 ? Math.max(...times) : 0;
    const average = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    
    // Average of 5 (去掉最好和最差)
    let avg5 = 0;
    if (times.length >= 5) {
      const last5 = times.slice(0, 5).sort((a, b) => a - b);
      avg5 = (last5[1] + last5[2] + last5[3]) / 3;
    }
    
    // Average of 12 (去掉最好和最差)
    let avg12 = 0;
    if (times.length >= 12) {
      const last12 = times.slice(0, 12).sort((a, b) => a - b);
      const middle10 = last12.slice(1, 11);
      avg12 = middle10.reduce((a, b) => a + b, 0) / 10;
    }

    return {
      best,
      worst,
      average,
      avg5,
      avg12,
      total: records.length,
    };
  }, [records]);

  // 计算全局时间范围 (用于同步两个图表的坐标轴)
  const timeRange = useMemo(() => {
    const validRecords = records.filter(r => !r.dnf);
    const sessionTimes = validRecords.map(r => (r.time + (r.plus2 ? 2000 : 0)) / 1000);
    const hist = externalStats?.histogram;
    const hasHistory = hist && hist.bin_edges.length > 0;

    let minX = Infinity;
    let maxX = -Infinity;

    if (hasHistory) {
      minX = hist!.bin_edges[0];
      maxX = hist!.bin_edges[hist!.bin_edges.length - 1];
    }
    if (sessionTimes.length > 0) {
      minX = Math.min(minX, ...sessionTimes);
      maxX = Math.max(maxX, ...sessionTimes);
    }

    if (minX === Infinity) return { min: 0, max: 20 };

    const padding = (maxX - minX) * 0.05 || 1;
    // 调整为整数边界：小于 min 的最大整数，大于 max 的最小整数
    return {
      min: Math.floor(Math.max(0, minX - padding)),
      max: Math.ceil(maxX + padding)
    };
  }, [records, externalStats]);

  // Session 直方图数据
  const combinedHistogramData = useMemo(() => {
    const validRecords = records.filter(r => !r.dnf);
    const sessionTimes = validRecords.map(r => (r.time + (r.plus2 ? 2000 : 0)) / 1000);

    const { min: minX, max: maxX } = timeRange;
    const binCount = 12;
    const binSize = (maxX - minX) / binCount;

    const bins = Array(binCount).fill(0).map((_, i) => {
      const start = minX + i * binSize;
      const end = start + binSize;
      return {
        label: `${start.toFixed(1)}-${end.toFixed(1)}s`,
        center: (start + end) / 2,
        sessionCount: 0,
      };
    });

    sessionTimes.forEach(t => {
      const index = Math.min(Math.floor((t - minX) / binSize), binCount - 1);
      if (index >= 0) bins[index].sessionCount++;
    });

    return bins;
  }, [records, timeRange]);

  // 历史折线数据：直接来自 externalStats，完全独立，固定不变
  const historyLineData = useMemo(() => {
    const hist = externalStats?.histogram;
    if (!hist || hist.bin_edges.length < 2) return [];
    const total = hist.counts.reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return hist.counts.map((count, i) => {
      const binWidth = hist.bin_edges[i + 1] - hist.bin_edges[i];
      return {
        center: (hist.bin_edges[i] + hist.bin_edges[i + 1]) / 2,
        density: count / (total * binWidth),
      };
    });
  }, [externalStats]);

  // 计算 X 轴整数刻度
  const xAxisTicks = useMemo(() => {
    if (combinedHistogramData.length === 0) return [];
    const { min: start, max: end } = timeRange;
    const range = end - start;
    
    const step = range > 20 ? 5 : range > 10 ? 2 : 1;
    const ticks = [];
    for (let i = Math.floor(start); i <= Math.ceil(end); i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [combinedHistogramData, timeRange]);

  // 计算左侧 Y 轴刻度
  const yAxisTicks = useMemo(() => {
    const sessionMax = Math.max(0, ...combinedHistogramData.map(d => d.sessionCount || 0));
    const limit = sessionMax + 1;
    const ticks = [];
    if (limit <= 10) {
      for (let i = 0; i <= limit; i++) ticks.push(i);
    } else {
      const step = Math.max(1, Math.ceil(limit / 6));
      for (let i = 0; i <= limit; i += step) ticks.push(i);
      if (ticks[ticks.length - 1] < limit) ticks.push(ticks[ticks.length - 1] + step);
    }
    return ticks;
  }, [combinedHistogramData]);

  // 趋势数据
  const trendData = useMemo(() => {
    if (records.length === 0) return [];

    const validRecords = records.filter(r => !r.dnf);
    return validRecords.slice(0, 20).reverse().map((r, i) => ({
      solve: i + 1,
      time: (r.time + (r.plus2 ? 2000 : 0)) / 1000,
    }));
  }, [records]);

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Best"
          value={stats.best > 0 ? formatTime(stats.best) : '-'}
          color="text-green-400"
          historyValue={externalStats?.pb_single?.time_fmt}
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="Worst"
          value={stats.worst > 0 ? formatTime(stats.worst) : '-'}
          color="text-red-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Average"
          value={stats.average > 0 ? formatTime(stats.average) : '-'}
          color="text-blue-400"
          historyValue={externalStats?.summary?.overall_mean_fmt}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Ao5"
          value={stats.avg5 > 0 ? formatTime(stats.avg5) : '-'}
          color="text-purple-400"
          historyValue={externalStats?.pb_ao5?.time_fmt}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Ao12"
          value={stats.avg12 > 0 ? formatTime(stats.avg12) : '-'}
          color="text-yellow-400"
          historyValue={externalStats?.pb_ao12?.time_fmt}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total"
          value={stats.total.toString()}
          color="text-gray-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Histogram */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-3">Time Distribution</h3>
          {combinedHistogramData.length > 0 ? (
            <div style={{ position: 'relative', height: 160 }}>
              {/* Session bars — 独立 BarChart，bandwidth 只基于 12 个 bins */}
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={combinedHistogramData} margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis
                    dataKey="center"
                    type="number"
                    domain={[timeRange.min, timeRange.max]}
                    ticks={xAxisTicks}
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(v) => `${v}s`}
                  />
                  <YAxis
                    stroke="#3B82F6"
                    fontSize={12}
                    allowDecimals={false}
                    width={30}
                    ticks={yAxisTicks}
                    domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    labelFormatter={(v) => `${Number(v).toFixed(2)}s`}
                    formatter={(value: any, name: string) => {
                      if (name === 'Session') return [`${value} solves`, 'Current Session'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="sessionCount" name="Session" fill="#3B82F6" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                  {externalStats?.summary?.overall_mean != null && (
                    <ReferenceLine x={externalStats.summary.overall_mean} stroke="#6B7280" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ position: 'insideTop', value: 'Hist Avg', fill: '#6B7280', fontSize: 9 }} />
                  )}
                  {externalStats?.pb_ao5?.time != null && (
                    <ReferenceLine x={externalStats.pb_ao5.time} stroke="#6D28D9" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ position: 'insideTop', value: 'PB Ao5', fill: '#6D28D9', fontSize: 9 }} />
                  )}
                  {externalStats?.pb_ao12?.time != null && (
                    <ReferenceLine x={externalStats.pb_ao12.time} stroke="#A16207" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ position: 'insideTop', value: 'PB Ao12', fill: '#A16207', fontSize: 9 }} />
                  )}
                </BarChart>
              </ResponsiveContainer>
              {/* 历史折线叠加层 — 完全独立的 LineChart，pointerEvents:none 不干扰 bar 的 tooltip */}
              {historyLineData.length > 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={historyLineData} margin={{ top: 10, right: 5, bottom: 0, left: 30 }}>
                      <XAxis
                        dataKey="center"
                        type="number"
                        domain={[timeRange.min, timeRange.max]}
                        tick={false}
                        axisLine={false}
                        height={30}
                      />
                      <YAxis hide={true} domain={[0, 'auto']} />
                      <Line
                        type="linear"
                        dataKey="density"
                        stroke="#065F46"
                        strokeDasharray="5 5"
                        dot={false}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-500">
              No Data
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-3">Recent 20 Solves Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="solve" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  label={{ value: 'Solves', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                  domain={[timeRange.min, timeRange.max]}
                  ticks={xAxisTicks}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: number) => [`${value.toFixed(3)}s`, 'Time']}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-500">
              No Data
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-white">Session History</h3>
          {records.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveRecords}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Export Records
              </button>
              <button
                onClick={onClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
        
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No records yet. Start your first solve!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4 text-purple-400">Ao5</th>
                  <th className="pb-3 pr-4 text-yellow-400">Ao12</th>
                  <th className="pb-3 pr-4">Scramble</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => {
                  const ao5 = calcAo(records, index, 5);
                  const ao12 = calcAo(records, index, 12);
                  const fmtAo = (v: number | null) =>
                    v === null ? '-' : v === Infinity ? 'DNF' : formatTime(v);
                  return (
                  <tr
                    key={record.id}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="py-1.5 pr-4 text-gray-400">{index + 1}</td>
                    <td className="py-1.5 pr-4">
                      <span className={`font-mono ${record.dnf ? 'text-red-400' : record.plus2 ? 'text-yellow-400' : 'text-white'}`}>
                        {record.dnf ? 'DNF' : formatTime(record.time + (record.plus2 ? 2000 : 0))}
                        {record.plus2 && !record.dnf && (
                          <span className="text-yellow-400 ml-1 text-xs">+2</span>
                        )}
                      </span>
                    </td>
                    <td className="py-1.5 pr-4 font-mono text-sm text-purple-400">{fmtAo(ao5)}</td>
                    <td className="py-1.5 pr-4 font-mono text-sm text-yellow-400">{fmtAo(ao12)}</td>
                    <td className="py-1.5 pr-4 text-sm text-gray-400 font-mono">
                      {record.scramble.substring(0, 30)}...
                    </td>
                    <td className="py-1.5 pr-4 text-sm text-gray-400">
                      {new Date(record.date).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-1.5">
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  historyValue 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
  historyValue?: string;
}) {
  // 根据标签决定历史数据的提示文字
  const historyLabel = label === 'Average' ? 'Hist' : 'PB';

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between text-gray-400 mb-1">
        <div className="flex items-center space-x-1.5">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        {historyValue && (
          <span className="text-[10px] uppercase tracking-wider opacity-60">{historyLabel}</span>
        )}
      </div>
      <div className="flex justify-between items-baseline">
        <div className={`text-xl font-bold ${color}`}>
          {value}
        </div>
        {historyValue && (
          <div className={`text-xl font-bold ${color} opacity-40 font-mono ml-2 shrink-0`} title={`Historical ${historyLabel}`}>
            {historyValue}
          </div>
        )}
      </div>
    </div>
  );
}
