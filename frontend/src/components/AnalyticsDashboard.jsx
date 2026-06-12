import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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

  const branchData = Object.keys(data.branchBreakdown || {}).map(key => ({
    name: key,
    value: data.branchBreakdown[key]
  }));

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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={branchData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 flex items-center justify-center h-full">No placement data yet.</p>
          )}
        </div>
        
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333333] h-[400px]">
          <h4 className="text-white font-bold mb-4">Company Visits (Mock Data)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ year: '2022', visits: 10 }, { year: '2023', visits: 15 }, { year: '2024', visits: 25 }]}>
              <XAxis dataKey="year" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} />
              <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
