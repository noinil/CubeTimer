import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trash2, Award, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import type { TimeRecord } from '../types/cube';

interface StatisticsProps {
  records: TimeRecord[];
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

export default function Statistics({ records, onDeleteRecord, onClearAll }: StatisticsProps) {
  const handleSaveRecords = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const filename = `results/${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.dat`;

    const header = `# scramble,time,date`;
    const rows = records.map(r => {
      const scramble = r.scramble.replace(/\s+/g, '');
      const time = r.dnf ? 'DNF' : formatTime(r.time + (r.plus2 ? 2000 : 0));
      const date = new Date(r.date).toLocaleString('zh-CN');
      return `${scramble},${time},${date}`;
    });

    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 格式化时间
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
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

    const best = Math.min(...times);
    const worst = Math.max(...times);
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    
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

  // Histogram 数据
  const histogramData = useMemo(() => {
    if (records.length === 0) return [];

    const validRecords = records.filter(r => !r.dnf);
    const times = validRecords.map(r => r.time + (r.plus2 ? 2000 : 0));
    
    if (times.length === 0) return [];

    const min = Math.min(...times);
    const max = Math.max(...times);
    const range = max - min;
    const binCount = Math.min(10, Math.ceil(times.length / 3));
    const binSize = Math.max(range / binCount, 1); // Ensure binSize is at least 1

    const bins = Array(binCount).fill(0).map((_, i) => ({
      id: `bin-${i}`, // Add unique id
      range: `${formatTime(min + i * binSize)}-${formatTime(min + (i + 1) * binSize)}`,
      count: 0,
      start: min + i * binSize,
    }));

    times.forEach(time => {
      const binIndex = Math.min(Math.floor((time - min) / binSize), binCount - 1);
      if (binIndex >= 0 && binIndex < binCount) {
        bins[binIndex].count++;
      }
    });

    return bins;
  }, [records]);

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
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="最佳"
          value={stats.best > 0 ? formatTime(stats.best) : '-'}
          color="text-green-400"
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="最差"
          value={stats.worst > 0 ? formatTime(stats.worst) : '-'}
          color="text-red-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="平均"
          value={stats.average > 0 ? formatTime(stats.average) : '-'}
          color="text-blue-400"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Ao5"
          value={stats.avg5 > 0 ? formatTime(stats.avg5) : '-'}
          color="text-purple-400"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Ao12"
          value={stats.avg12 > 0 ? formatTime(stats.avg12) : '-'}
          color="text-yellow-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="总计"
          value={stats.total.toString()}
          color="text-gray-400"
        />
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Histogram */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-3">时间分布</h3>
          {histogramData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="id"
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tickFormatter={(value, index) => histogramData[index]?.range || ''}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  labelFormatter={(value, payload) => payload[0]?.payload?.range || ''}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-500">
              暂无数据
            </div>
          )}
        </div>

        {/* 趋势图 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-3">最近20次趋势</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="solve" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  label={{ value: '次数', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: '时间 (秒)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: number) => [`${value.toFixed(2)}s`, '时间']}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-500">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* 记录表格 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-white">计时记录</h3>
          {records.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveRecords}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                保存记录
              </button>
              <button
                onClick={onClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                清空所有记录
              </button>
            </div>
          )}
        </div>
        
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            暂无记录，开始你的第一次计时吧！
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">时间</th>
                  <th className="pb-3 pr-4 text-purple-400">Ao5</th>
                  <th className="pb-3 pr-4 text-yellow-400">Ao12</th>
                  <th className="pb-3 pr-4">打乱公式</th>
                  <th className="pb-3 pr-4">日期</th>
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
                      <span className={`font-mono ${record.dnf ? 'text-red-400' : 'text-white'}`}>
                        {record.dnf ? 'DNF' : formatTime(record.time)}
                        {record.plus2 && !record.dnf && (
                          <span className="text-yellow-400 ml-1">+2</span>
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}