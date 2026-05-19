import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
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
} from 'recharts';
import {
  FiActivity,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiChevronDown,
  FiClock,
  FiList,
  FiPieChart,
  FiPlus,
  FiPercent,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return 'No date';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-xl">
      <p className="font-semibold">{item.category}</p>
      <p className="font-bold text-primary">{formatCurrency(payload[0].value)}</p>
      <p className="text-sm text-base-content/60">{item.percent}% of total</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="skeleton h-9 w-72"></div>
          <div className="skeleton h-4 w-80 max-w-full"></div>
        </div>
        <div className="skeleton h-12 w-44"></div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="skeleton h-36 rounded-lg"></div>
        <div className="skeleton h-36 rounded-lg"></div>
        <div className="skeleton h-36 rounded-lg"></div>
        <div className="skeleton h-36 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="skeleton h-96 rounded-lg xl:col-span-2"></div>
        <div className="skeleton h-96 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      try {
        const response = await api.get('/dashboard');
        if (isMounted) {
          setData(response.data?.data || {});
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        toast.error(error?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo(
    () => (data?.expenseDistribution || []).filter((item) => Number(item.amount) > 0),
    [data]
  );

  const recentTransactions = useMemo(() => {
    return [...(data?.recentTransactions || [])]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || a.date || 0).getTime();
        const bTime = new Date(b.createdAt || b.date || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [data]);

  const topExpenseCategory = useMemo(() => {
    if (!chartData.length) return null;

    return [...chartData].sort(
      (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
    )[0];
  }, [chartData]);

  const spendingUsage = data?.monthlyIncome
    ? Math.round((Number(data.monthlyExpense || 0) / Number(data.monthlyIncome)) * 100)
    : 0;

  const visibleSpendingUsage = Math.min(Math.max(spendingUsage, 0), 100);
  const totalTransactions = data?.recentTransactions?.length || 0;
  const balanceTone = (data?.savings || 0) >= 0 ? 'text-success' : 'text-error';
  const savingsMessage =
    (data?.savings || 0) >= 0 ? 'You are ahead this month' : 'Expenses crossed income';

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-base-content/60">
            Your monthly income, spending, savings, and latest activity
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="badge badge-outline badge-lg gap-2">
            <FiClock />
            Current Month
          </div>

          <div className="dropdown dropdown-end">
            <button tabIndex={0} type="button" className="btn btn-primary gap-2">
              <FiPlus />
              Add Transaction
              <FiChevronDown />
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-[1] mt-3 w-56 rounded-box bg-base-100 p-2 shadow-xl"
            >
              <li>
                <button type="button" onClick={() => navigate('/income')}>
                  <FiArrowUpCircle className="text-success" />
                  Add Income
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/expense')}>
                  <FiArrowDownCircle className="text-error" />
                  Add Expense
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stats border border-success/20 bg-gradient-to-br from-success/20 to-success/5 shadow-lg">
          <div className="stat">
            <div className="stat-figure text-success">
              <FiTrendingUp className="text-3xl" />
            </div>
            <div className="stat-title font-medium text-base-content/70">
              Monthly Income
            </div>
            <div className="stat-value text-2xl text-success lg:text-3xl">
              {formatCurrency(data?.monthlyIncome)}
            </div>
            <div className="stat-desc text-base-content/60">
              Total earnings this month
            </div>
          </div>
        </div>

        <div className="stats border border-error/20 bg-gradient-to-br from-error/20 to-error/5 shadow-lg">
          <div className="stat">
            <div className="stat-figure text-error">
              <FiTrendingDown className="text-3xl" />
            </div>
            <div className="stat-title font-medium text-base-content/70">
              Monthly Expense
            </div>
            <div className="stat-value text-2xl text-error lg:text-3xl">
              {formatCurrency(data?.monthlyExpense)}
            </div>
            <div className="stat-desc text-base-content/60">
              Total spending this month
            </div>
          </div>
        </div>

        <div className="stats border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
          <div className="stat">
            <div className={`stat-figure ${balanceTone}`}>
              <FaRupeeSign className="text-3xl" />
            </div>
            <div className="stat-title font-medium text-base-content/70">
              Total Savings (INR)
            </div>
            <div className={`stat-value text-2xl lg:text-3xl ${balanceTone}`}>
              {formatCurrency(data?.savings)}
            </div>
            <div className="stat-desc text-base-content/60">
              {savingsMessage}
            </div>
          </div>
        </div>

        <div className="stats border border-secondary/20 bg-gradient-to-br from-secondary/20 to-secondary/5 shadow-lg">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <FiPercent className="text-3xl" />
            </div>
            <div className="stat-title font-medium text-base-content/70">
              Savings Rate
            </div>
            <div className="stat-value text-2xl text-secondary lg:text-3xl">
              {data?.savingsRate || 0}%
            </div>
            <div className="stat-desc text-base-content/60">
              Percentage saved
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FiTarget className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">Top Spending</p>
              <p className="font-bold">
                {topExpenseCategory?.category || 'No expense yet'}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-base-content/60">
            {topExpenseCategory
              ? `${formatCurrency(topExpenseCategory.amount)} spent in this category`
              : 'Add expenses to unlock category insights.'}
          </p>
        </div>

        <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-base-content/60">Expense Usage</p>
              <p className="text-2xl font-bold text-secondary">
                {spendingUsage}%
              </p>
            </div>
            <FiActivity className="text-3xl text-secondary" />
          </div>
          <progress
            className="progress progress-secondary mt-3"
            value={visibleSpendingUsage}
            max="100"
          ></progress>
          <p className="mt-2 text-sm text-base-content/60">
            Percentage of income already spent
          </p>
        </div>

        <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-base-content/60">Transaction Mix</p>
              <p className="text-2xl font-bold text-primary">
                {totalTransactions}
              </p>
            </div>
            <FiList className="text-3xl text-primary" />
          </div>
          <p className="mt-3 text-sm text-base-content/60">
            Monthly income and expense entries recorded by the backend
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card bg-base-100 shadow-xl xl:col-span-2">
          <div className="card-body">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FiPieChart className="text-2xl text-primary" />
                <div>
                  <h2 className="card-title">Expense Distribution</h2>
                  <p className="text-sm text-base-content/60">
                    Based on backend expense categories for this month
                  </p>
                </div>
              </div>

              <div className="tabs tabs-boxed">
                <button
                  type="button"
                  className={`tab ${chartType === 'bar' ? 'tab-active' : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
                <button
                  type="button"
                  className={`tab ${chartType === 'pie' ? 'tab-active' : ''}`}
                  onClick={() => setChartType('pie')}
                >
                  Pie
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              {chartData.length > 0 ? (
                <>
                  <div className="h-80 rounded-lg border border-base-300 bg-base-200/60 p-3 sm:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 12, right: 24, left: 12, bottom: 12 }}
                          barCategoryGap={18}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.25} />
                          <XAxis
                            type="number"
                            tickFormatter={(value) => `Rs ${Math.round(value / 1000)}k`}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="category"
                            type="category"
                            width={92}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--b3) / 0.35)' }} />
                          <Bar dataKey="amount" radius={[0, 10, 10, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell
                                key={entry.category}
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
                            innerRadius={70}
                            outerRadius={118}
                            paddingAngle={4}
                            cornerRadius={10}
                            dataKey="amount"
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={entry.category}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <text
                            x="50%"
                            y="47%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-base-content text-lg font-bold"
                          >
                            {formatCurrency(data?.monthlyExpense)}
                          </text>
                          <text
                            x="50%"
                            y="55%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-base-content/60 text-xs"
                          >
                            Total Expense
                          </text>
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-lg border border-base-300 bg-base-200/60 p-4">
                    <div className="mb-4">
                      <p className="text-sm text-base-content/60">Category Breakdown</p>
                      <h3 className="text-xl font-bold">Where money went</h3>
                    </div>

                    <div className="space-y-4">
                      {chartData.map((item, index) => (
                        <div key={item.category}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></span>
                              <p className="truncate font-medium">{item.category}</p>
                            </div>
                            <p className="shrink-0 text-sm font-bold">
                              {formatCurrency(item.amount)}
                            </p>
                          </div>
                          <progress
                            className="progress progress-primary h-2"
                            value={item.percent}
                            max="100"
                          ></progress>
                          <p className="mt-1 text-xs text-base-content/60">
                            {item.percent}% of monthly expenses
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-base-300 bg-base-200/60 p-8 text-center lg:col-span-2">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-base-100">
                    <FiPieChart className="text-5xl text-base-content/30" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">No Expense Data</h3>
                  <p className="max-w-sm text-base-content/60">
                    Add an expense to see category distribution and monthly spending
                    insights here.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-5 gap-2"
                    onClick={() => navigate('/expense')}
                  >
                    <FiPlus />
                    Add Expense
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FiList className="text-2xl text-primary" />
                <div>
                  <h2 className="card-title">Recent Activity</h2>
                  <p className="text-sm text-base-content/60">
                    {totalTransactions} monthly transactions
                  </p>
                </div>
              </div>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const isIncome = transaction.type === 'income';

                  return (
                    <div
                      key={transaction._id}
                      className="rounded-lg border border-base-300 bg-base-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              isIncome
                                ? 'bg-success/10 text-success'
                                : 'bg-error/10 text-error'
                            }`}
                          >
                            {isIncome ? <FiArrowUpCircle /> : <FiArrowDownCircle />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {transaction.description || 'Untitled transaction'}
                            </p>
                            <p className="text-sm text-base-content/60">
                              {transaction.category || 'Other'} - {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`shrink-0 font-bold ${
                            isIncome ? 'text-success' : 'text-error'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-base-200">
                  <FiList className="text-4xl text-base-content/30" />
                </div>
                <h3 className="font-semibold">No Transactions Yet</h3>
                <p className="mt-2 text-sm text-base-content/60">
                  Add income or expense records to populate this activity feed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chartData.slice(0, 3).map((item) => (
            <div
              key={item.category}
              className="card border border-base-300 bg-base-100 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="card-body">
                <div className="flex items-center justify-between gap-4">
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
