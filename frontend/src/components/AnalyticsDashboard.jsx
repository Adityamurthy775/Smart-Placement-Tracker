import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/utils';
import axios from 'axios';
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const RAMP = ['#ef4444', '#f97316', '#fbbf24', '#b91c1c', '#fca5a5'];

const visitsConfig = {
  visits: { label: 'Company visits', color: 'var(--color-chart-1)' },
};

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/analytics-api/dashboard`, { withCredentials: true });
        setData(res.data.payload);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading Analytics Dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-400">Failed to load analytics data.</div>;
  }

  const branchData = Object.keys(data.branchBreakdown || {}).map((key, i) => ({
    name: key,
    value: data.branchBreakdown[key],
    fill: RAMP[i % RAMP.length],
  }));

  const visitsData = [
    { year: '2022', visits: 10 },
    { year: '2023', visits: 15 },
    { year: '2024', visits: 25 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl font-bold text-white mb-2">Placement Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333333]">
          <h4 className="text-gray-400 text-sm font-semibold uppercase mb-1">Total Placements</h4>
          <p className="text-4xl font-bold text-white">{data.totalPlacements}</p>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333333]">
          <h4 className="text-gray-400 text-sm font-semibold uppercase mb-1">Average Package</h4>
          <p className="text-4xl font-bold text-white">{data.avgPackage} LPA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333333] h-[400px]">
          <h4 className="text-white font-bold mb-4">Branch-wise Breakdown</h4>
          {branchData.length > 0 ? (
            <ChartContainer config={{}} className="h-[calc(100%-2rem)] w-full aspect-auto">
              <PieChart>
                <Pie data={branchData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label>
                  {branchData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <p className="text-gray-500 flex items-center justify-center h-full">No placement data yet.</p>
          )}
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333333] h-[400px]">
          <h4 className="text-white font-bold mb-4">Company Visits (Mock Data)</h4>
          <ChartContainer config={visitsConfig} className="h-[calc(100%-2rem)] w-full aspect-auto">
            <BarChart data={visitsData}>
              <XAxis dataKey="year" stroke="var(--color-chart-5)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-chart-5)" tickLine={false} axisLine={false} />
              <ChartTooltip cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }} content={<ChartTooltipContent />} />
              <Bar dataKey="visits" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
