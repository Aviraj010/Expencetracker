import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;

  const COLORS = ['#4B9DA9', '#91C6BC', '#E37434', '#999999', '#F6F3C2'];

  const Custom3DBar = (props) => {
    const { fill, x, y, width, height } = props;
    if (height === 0 || isNaN(height)) return null;
    const depth = 12; // 3D depth
    
    return (
      <g>
        {/* Top Face */}
        <path
          d={`M${x},${y} L${x + depth},${y - depth} L${x + width + depth},${y - depth} L${x + width},${y} Z`}
          fill={fill}
          stroke="black"
          strokeWidth={2}
        />
        {/* Right Face */}
        <path
          d={`M${x + width},${y} L${x + width + depth},${y - depth} L${x + width + depth},${y + height - depth} L${x + width},${y + height} Z`}
          fill={fill}
          stroke="black"
          strokeWidth={2}
        />
        {/* Front Face */}
        <rect x={x} y={y} width={width} height={height} fill={fill} stroke="black" strokeWidth={2} />
      </g>
    );
  };

  // Filter out zero amount expenses to avoid weird pie slices
  const chartData = (data?.expenseDistribution || []).filter(item => item.amount > 0);

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="brutalist-card stat-card" style={{ background: 'var(--primary)', color: 'white' }}>
          <div className="stat-title" style={{ color: 'white' }}>Total Monthly Income</div>
          <div className="stat-value" style={{ color: 'white' }}>₹{data?.monthlyIncome || 0}</div>
        </div>

        <div className="brutalist-card stat-card" style={{ background: 'var(--accent)', color: 'white' }}>
          <div className="stat-title" style={{ color: 'white' }}>Total Monthly Expense</div>
          <div className="stat-value" style={{ color: 'white' }}>₹{data?.monthlyExpense || 0}</div>
        </div>

        <div className="brutalist-card stat-card">
          <div className="stat-title">Total Savings</div>
          <div className="stat-value">₹{data?.savings || 0}</div>
        </div>

        <div className="brutalist-card stat-card">
          <div className="stat-title">Savings Rate</div>
          <div className="stat-value">{data?.savingsRate || 0}%</div>
        </div>
      </div>

      <div className="brutalist-card">
        <h2 style={{ marginBottom: '1rem' }}>Expense Distribution</h2>
        <div style={{ width: '100%', height: 350, position: 'relative' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 40, right: 30, left: 10, bottom: 20 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis 
                  dataKey="category" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                  tick={{ fill: 'black', fontWeight: 'bold', fontSize: 12 }} 
                />
                <YAxis tick={{ fill: 'black', fontWeight: 'bold' }} padding={{ top: 20 }} />
                <Tooltip
                  contentStyle={{ border: '3px solid black', borderRadius: '8px', fontWeight: 'bold', background: 'var(--white)' }}
                  formatter={(value) => `₹${value}`}
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" shape={<Custom3DBar />} name="Expense" maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: 'bold' }}>
              <p>No expense data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
