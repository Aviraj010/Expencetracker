import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Download,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  IndianRupee,
  Laptop,
  MoreHorizontal,
  PiggyBank,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import api from '../utils/api';

const categories = [
  { name: 'Salary', icon: BriefcaseBusiness },
  { name: 'Business', icon: Building2 },
  { name: 'Freelancing', icon: Laptop },
  { name: 'Investments', icon: TrendingUp },
  { name: 'Passive Income', icon: PiggyBank },
  { name: 'Scholarship', icon: GraduationCap },
  { name: 'Bonus', icon: IndianRupee },
  { name: 'Other', icon: MoreHorizontal },
];

const months = [
  { value: 'All', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const emptyForm = {
  title: '',
  amount: '',
  category: '',
  description: '',
  date: '',
};

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

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [overview, setOverview] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [editData, setEditData] = useState({ description: '', amount: '' });
  const [updating, setUpdating] = useState(false);

  const fetchIncomes = async () => {
    const res = await api.get('/income/get');
    const data = res.data?.data ? res.data.data : res.data;
    setIncomes(Array.isArray(data) ? data : []);
  };

  const fetchOverview = async () => {
    const res = await api.get('/income/overview');
    setOverview(res.data?.data || res.data || {});
  };

  const refreshIncomeData = async ({ showToast = false } = {}) => {
    try {
      setPageLoading(true);
      await Promise.all([fetchIncomes(), fetchOverview()]);

      if (showToast) {
        toast.success('Income data refreshed.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load income data.'));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    refreshIncomeData();
  }, []);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const categoryMatch =
        selectedCategory === 'All' || income.category === selectedCategory;

      const parsedDate = new Date(income.date);
      const monthMatch =
        selectedMonth === 'All' ||
        (!Number.isNaN(parsedDate.getTime()) &&
          parsedDate.getMonth() + 1 === Number(selectedMonth));

      const searchMatch =
        !searchTerm.trim() ||
        `${income.description || ''} ${income.category || ''}`
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());

      return categoryMatch && monthMatch && searchMatch;
    });
  }, [incomes, searchTerm, selectedCategory, selectedMonth]);

  const totalFilteredIncome = useMemo(
    () =>
      filteredIncomes.reduce(
        (sum, income) => sum + Number(income.amount || 0),
        0
      ),
    [filteredIncomes]
  );

  const averageIncome = filteredIncomes.length
    ? totalFilteredIncome / filteredIncomes.length
    : 0;

  const updateForm = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openIncomeModal = (income) => {
    setSelectedIncome(income);
    setEditData({
      description: income.description || '',
      amount: String(income.amount || ''),
    });
  };

  const closeIncomeModal = () => {
    if (updating) return;
    setSelectedIncome(null);
    setEditData({ description: '', amount: '' });
  };

  const validateForm = () => {
    const amount = Number(formData.amount);

    if (!formData.title.trim()) {
      toast.error('Income title is required.');
      return false;
    }

    if (!amount || amount <= 0) {
      toast.error('Enter a valid income amount.');
      return false;
    }

    if (!formData.date) {
      toast.error('Income date is required.');
      return false;
    }

    if (!formData.category) {
      toast.error('Select an income category.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        description:
          formData.title.trim() +
          (formData.description.trim()
            ? ` - ${formData.description.trim()}`
            : ''),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
      };

      await api.post('/income/add', payload);
      setFormData(emptyForm);
      await Promise.all([fetchIncomes(), fetchOverview()]);
      toast.success('Income added successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add income.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      await api.delete(`/income/delete/${id}`);
      await Promise.all([fetchIncomes(), fetchOverview()]);
      toast.success('Income deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete income.'));
    }
  };

  const handleUpdateIncome = async (e) => {
    e.preventDefault();

    if (!selectedIncome?._id) return;

    const amount = Number(editData.amount);

    if (!editData.description.trim()) {
      toast.error('Income description is required.');
      return;
    }

    if (!amount || amount <= 0) {
      toast.error('Enter a valid income amount.');
      return;
    }

    try {
      setUpdating(true);

      const res = await api.put(`/income/update/${selectedIncome._id}`, {
        description: editData.description.trim(),
        amount,
      });

      const updatedIncome = res.data?.data;

      if (updatedIncome) {
        setIncomes((current) =>
          current.map((income) =>
            income._id === updatedIncome._id ? updatedIncome : income
          )
        );
        setSelectedIncome(updatedIncome);
      }

      await fetchOverview();
      toast.success('Income updated successfully.');
      setSelectedIncome(null);
      setEditData({ description: '', amount: '' });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update income.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);

      const res = await api.get('/income/downloadExcel', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', 'incomes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Income report downloaded.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to download income report.'));
    } finally {
      setDownloading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="skeleton h-9 w-64"></div>
            <div className="skeleton h-4 w-80 max-w-full"></div>
          </div>
          <div className="skeleton h-12 w-40"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="skeleton h-[34rem] rounded-lg"></div>
          <div className="skeleton h-[34rem] rounded-lg xl:col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Income Manager
          </h1>
          <p className="mt-1 text-base-content/60">
            Track earnings, organize sources, and export income records
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn btn-outline gap-2"
            onClick={() => refreshIncomeData({ showToast: true })}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="btn btn-success gap-2"
            disabled={downloading}
          >
            {downloading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Download size={18} />
            )}
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card border border-success/20 bg-gradient-to-br from-success/15 to-success/5 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Monthly Income
                </p>
                <h2 className="mt-2 text-3xl font-bold text-success">
                  {formatCurrency(overview.totalIncome)}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <IndianRupee size={24} />
              </div>
            </div>
            <p className="text-sm text-base-content/60">
              Current month earnings
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Transactions
                </p>
                <h2 className="mt-2 text-3xl font-bold text-primary">
                  {overview.numberOfTransactions || 0}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileSpreadsheet size={24} />
              </div>
            </div>
            <p className="text-sm text-base-content/60">
              Total income records
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/60">
                  Filtered Total
                </p>
                <h2 className="mt-2 text-3xl font-bold text-base-content">
                  {formatCurrency(totalFilteredIncome)}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200 text-base-content/70">
                <Wallet size={24} />
              </div>
            </div>
            <p className="text-sm text-base-content/60">
              Average: {formatCurrency(averageIncome)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <Plus size={22} />
                </div>
                <div>
                  <h2 className="card-title">Add Income</h2>
                  <p className="text-sm text-base-content/60">
                    Record a new earning source
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="label" htmlFor="income-title">
                    <span className="label-text font-medium">Income Title</span>
                  </label>
                  <input
                    id="income-title"
                    type="text"
                    placeholder="Monthly salary"
                    className="input input-bordered w-full"
                    value={formData.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="income-amount">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <label className="input input-bordered flex w-full items-center gap-2">
                    <IndianRupee size={17} className="text-base-content/40" />
                    <input
                      id="income-amount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="50000"
                      className="grow"
                      value={formData.amount}
                      onChange={(e) => updateForm('amount', e.target.value)}
                    />
                  </label>
                </div>

                <div>
                  <label className="label" htmlFor="income-date">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <label className="input input-bordered flex w-full items-center gap-2">
                    <CalendarDays size={17} className="text-base-content/40" />
                    <input
                      id="income-date"
                      type="date"
                      className="grow"
                      value={formData.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                    />
                  </label>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const selected = formData.category === category.name;

                      return (
                        <button
                          type="button"
                          key={category.name}
                          onClick={() => updateForm('category', category.name)}
                          className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-medium transition-all ${
                            selected
                              ? 'border-success/30 bg-success/10 text-success shadow-sm'
                              : 'border-base-300 bg-base-100 text-base-content/70 hover:border-success/30 hover:bg-base-200'
                          }`}
                        >
                          <Icon size={17} />
                          <span className="truncate">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="income-description">
                    <span className="label-text font-medium">Description</span>
                    <span className="label-text-alt text-base-content/50">
                      Optional
                    </span>
                  </label>
                  <textarea
                    id="income-description"
                    rows="4"
                    placeholder="Add notes..."
                    className="textarea textarea-bordered w-full resize-none"
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-full gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Income
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Income History</h2>
                  <p className="mt-1 text-sm text-base-content/60">
                    Review and filter recorded income entries
                  </p>
                </div>

                <div className="badge badge-success badge-lg">
                  {filteredIncomes.length} records
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
                <label className="input input-bordered flex items-center gap-2">
                  <Search size={17} className="text-base-content/40" />
                  <input
                    type="search"
                    className="grow"
                    placeholder="Search income..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </label>

                <select
                  className="select select-bordered"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {filteredIncomes.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-base-300">
                  <table className="table">
                    <thead className="bg-base-200/70">
                      <tr>
                        <th>Source</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIncomes.map((income) => (
                        <tr key={income._id} className="hover">
                          <td>
                            <div className="max-w-xs">
                              <p className="truncate font-semibold">
                                {income.description || 'Untitled income'}
                              </p>
                              <p className="text-xs text-base-content/50">
                                Income record
                              </p>
                            </div>
                          </td>
                          <td>
                            <div className="badge badge-outline">
                              {income.category || 'Other'}
                            </div>
                          </td>
                          <td className="font-bold text-success">
                            +{formatCurrency(income.amount)}
                          </td>
                          <td>{formatDate(income.date)}</td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openIncomeModal(income)}
                                className="btn btn-primary btn-outline btn-sm btn-square"
                                aria-label="View and update income"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(income._id)}
                                className="btn btn-error btn-outline btn-sm btn-square"
                                aria-label="Delete income"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/50 p-8 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-base-100 text-base-content/40">
                    <Wallet size={38} />
                  </div>
                  <h3 className="text-xl font-semibold">No Income Found</h3>
                  <p className="mt-2 max-w-sm text-base-content/60">
                    Add an income record or adjust your filters to see entries here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`modal ${selectedIncome ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl rounded-3xl border border-base-300 bg-base-100 p-0 shadow-2xl">
          {selectedIncome && (
            <>
              <div className="flex items-start justify-between border-b border-base-300 p-6">
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                    <Wallet size={24} />
                  </div>
                  <h3 className="text-2xl font-bold">Income Details</h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    View this income record and update supported fields.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={closeIncomeModal}
                  disabled={updating}
                  aria-label="Close income modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 border-b border-base-300 bg-base-200/50 p-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                    Category
                  </p>
                  <p className="mt-2 font-bold">
                    {selectedIncome.category || 'Other'}
                  </p>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                    Date
                  </p>
                  <p className="mt-2 font-bold">
                    {formatDate(selectedIncome.date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                    Current Amount
                  </p>
                  <p className="mt-2 font-bold text-success">
                    {formatCurrency(selectedIncome.amount)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateIncome} className="space-y-5 p-6">
                <div>
                  <label className="label" htmlFor="edit-income-description">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    id="edit-income-description"
                    rows="4"
                    className="textarea textarea-bordered w-full resize-none"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="edit-income-amount">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <label className="input input-bordered flex w-full items-center gap-2">
                    <IndianRupee size={17} className="text-base-content/40" />
                    <input
                      id="edit-income-amount"
                      type="number"
                      min="1"
                      step="1"
                      className="grow"
                      value={editData.amount}
                      onChange={(e) =>
                        setEditData((current) => ({
                          ...current,
                          amount: e.target.value,
                        }))
                      }
                      disabled={updating}
                    />
                  </label>
                  <p className="mt-2 text-xs text-base-content/50">
                    Backend update endpoint currently supports description and
                    amount only.
                  </p>
                </div>

                <div className="modal-action mt-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeIncomeModal}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success gap-2"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Update Income
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
        <button
          type="button"
          className="modal-backdrop"
          onClick={closeIncomeModal}
          disabled={updating}
          aria-label="Close income modal"
        >
          close
        </button>
      </div>
    </div>
  );
}
