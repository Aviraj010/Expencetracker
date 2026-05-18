import { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPercent,
  FiPieChart,
  FiClock,
} from 'react-icons/fi';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        toast.error('Failed to load dashboard data', {
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart colors
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Filter out zero amount expenses
  const chartData = (data?.expenseDistribution || []).filter(
    (item) => item.amount > 0
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 p-3 rounded-lg shadow-xl border border-base-300">
          <p className="font-semibold">{payload[0].payload.category}</p>
          <p className="text-primary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-base-content/60">
            {payload[0].payload.percent}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Dashboard Overview
          </h1>
          <p className="text-base-content/60 mt-1">
            Your financial summary for this month
          </p>
        </div>
        <div className="badge badge-outline badge-lg">
          <FiClock className="mr-2" />
          Current Month
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Income */}
        <div className="stats shadow-lg bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
          <div className="stat">
            <div className="stat-figure text-success">
              <FiTrendingUp className="text-3xl" />
            </div>
            <div className="stat-title text-base-content/70 font-medium">
              Monthly Income
            </div>
            <div className="stat-value text-success text-2xl lg:text-3xl">
              {formatCurrency(data?.monthlyIncome)}
            </div>
            <div className="stat-desc text-base-content/60">
              Total earnings this month
            </div>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="stats shadow-lg bg-gradient-to-br from-error/20 to-error/5 border border-error/20">
          <div className="stat">
            <div className="stat-figure text-error">
              <FiTrendingDown className="text-3xl" />
            </div>
            <div className="stat-title text-base-content/70 font-medium">
              Monthly Expense
            </div>
            <div className="stat-value text-error text-2xl lg:text-3xl">
              {formatCurrency(data?.monthlyExpense)}
            </div>
            <div className="stat-desc text-base-content/60">
              Total spending this month
            </div>
          </div>
        </div>

        {/* Total Savings */}
        <div className="stats shadow-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FiDollarSign className="text-3xl" />
            </div>
            <div className="stat-title text-base-content/70 font-medium">
              Total Savings
            </div>
            <div className="stat-value text-primary text-2xl lg:text-3xl">
              {formatCurrency(data?.savings)}
            </div>
            <div className="stat-desc text-base-content/60">
              Income minus expenses
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="stats shadow-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <FiPercent className="text-3xl" />
            </div>
            <div className="stat-title text-base-content/70 font-medium">
              Savings Rate
            </div>
            <div className="stat-value text-secondary text-2xl lg:text-3xl">
              {data?.savingsRate || 0}%
            </div>
            <div className="stat-desc text-base-content/60">
              Percentage saved
            </div>
          </div>
        </div>
      </div>

      {/* Expense Distribution Chart */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FiPieChart className="text-2xl text-primary" />
              <h2 className="card-title">Expense Distribution</h2>
            </div>
            {/* Chart Type Toggle */}
            <div className="tabs tabs-boxed">
              <button
                className={`tab ${chartType === 'bar' ? 'tab-active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                Bar Chart
              </button>
              <button
                className={`tab ${chartType === 'pie' ? 'tab-active' : ''}`}
                onClick={() => setChartType('pie')}
              >
                Pie Chart
              </button>
            </div>
          </div>

          <div className="w-full h-80 sm:h-96">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="font-bold text-sm"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      outerRadius={120}
                      dataKey="amount"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span className="text-sm">
                          {entry.payload.category} - {formatCurrency(entry.payload.amount)}
                        </span>
                      )}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center mb-4">
                  <FiPieChart className="text-5xl text-base-content/30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Expense Data</h3>
                <p className="text-base-content/60 max-w-sm">
                  Start tracking your expenses to see the distribution here. Add
                  your first expense to get insights!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all"
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base-content/70">
                      {item.category}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div
                    className="radial-progress text-primary"
                    style={{
                      '--value': item.percent,
                      '--size': '3.5rem',
                      '--thickness': '4px',
                    }}
                  >
                    <span className="text-xs font-bold">{item.percent}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}