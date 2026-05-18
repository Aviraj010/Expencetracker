import { useEffect, useState } from 'react';
import api from '../utils/api';

import {
  MdDelete,
  MdWork,
  MdBusiness,
  MdTrendingUp,
  MdAttachMoney,
  MdComputer,
  MdSchool,
  MdSavings,
  MdMoreHoriz,
} from 'react-icons/md';

import { FaFileExcel } from 'react-icons/fa';

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [selectedMonth, setSelectedMonth] =
    useState('All');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: '',
  });

  // CUSTOM INCOME CATEGORIES
  const categories = [
    {
      name: 'Salary',
      icon: <MdWork size={18} />,
    },

    {
      name: 'Business',
      icon: <MdBusiness size={18} />,
    },

    {
      name: 'Freelancing',
      icon: <MdComputer size={18} />,
    },

    {
      name: 'Investments',
      icon: <MdTrendingUp size={18} />,
    },

    {
      name: 'Passive Income',
      icon: <MdSavings size={18} />,
    },

    {
      name: 'Scholarship',
      icon: <MdSchool size={18} />,
    },

    {
      name: 'Bonus',
      icon: <MdAttachMoney size={18} />,
    },

    {
      name: 'Other',
      icon: <MdMoreHoriz size={18} />,
    },
  ];

  useEffect(() => {
    fetchIncomes();
    fetchOverview();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await api.get('/income/get');

      // Supports both old and fixed backend
      const data = res.data?.data
        ? res.data.data
        : res.data;

      setIncomes(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error(error);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await api.get('/income/overview');

      setOverview(
        res.data?.data || res.data || {}
      );

    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        description:
          formData.title +
          (formData.description
            ? ` - ${formData.description}`
            : ''),

        amount: Number(formData.amount),

        category: formData.category,

        date: formData.date,
      };

      await api.post('/income/add', payload);

      setFormData({
        title: '',
        amount: '',
        category: '',
        description: '',
        date: '',
      });

      fetchIncomes();
      fetchOverview();

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/income/delete/${id}`);

      fetchIncomes();
      fetchOverview();

    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await api.get(
        '/income/downloadExcel',
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link =
        document.createElement('a');

      link.href = url;

      link.setAttribute(
        'download',
        'incomes.xlsx'
      );

      document.body.appendChild(link);

      link.click();

      link.parentNode.removeChild(link);

    } catch (error) {
      console.error(error);
    }
  };

  // FILTERS
  const filteredIncomes = incomes.filter(
    (inc) => {

      const categoryMatch =
        selectedCategory === 'All' ||
        inc.category === selectedCategory;

      const monthMatch =
        selectedMonth === 'All' ||
        new Date(inc.date).getMonth() + 1 ===
          Number(selectedMonth);

      return (
        categoryMatch && monthMatch
      );
    }
  );

  return (
    <div className="min-h-screen bg-base-200 p-3 sm:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Income Manager
          </h1>

          <p className="text-base-content/60 mt-1">
            Track and organize your
            income sources
          </p>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="btn btn-success gap-2"
        >
          <FaFileExcel />
          Download Excel
        </button>
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* MONTHLY INCOME */}
        <div className="card bg-success text-success-content shadow-lg">

          <div className="card-body">

            <p className="text-sm opacity-80">
              Monthly Income
            </p>

            <h2 className="text-4xl font-bold mt-2">
              ₹{overview.totalIncome || 0}
            </h2>

            <p className="text-sm mt-2 opacity-80">
              Current month earnings
            </p>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="card bg-base-100 shadow-lg">

          <div className="card-body">

            <p className="text-sm text-base-content/60">
              Transactions
            </p>

            <h2 className="text-4xl font-bold text-primary mt-2">
              {
                overview.numberOfTransactions ||
                0
              }
            </h2>

            <p className="text-sm mt-2 text-base-content/60">
              Total income records
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT FORM */}
        <div className="xl:col-span-1">

          <div className="card bg-base-100 shadow-xl">

            <div className="card-body">

              <h2 className="card-title mb-5">
                Add Income
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* TITLE */}
                <div>
                  <label className="label">
                    <span className="label-text">
                      Income Title
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="Monthly Salary"
                    className="input input-bordered w-full"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* AMOUNT */}
                <div>
                  <label className="label">
                    <span className="label-text">
                      Amount
                    </span>
                  </label>

                  <input
                    type="number"
                    placeholder="50000"
                    className="input input-bordered w-full"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* DATE */}
                <div>
                  <label className="label">
                    <span className="label-text">
                      Date
                    </span>
                  </label>

                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* CATEGORY */}
                <div>

                  <label className="label">
                    <span className="label-text">
                      Select Category
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {categories.map(
                      (category) => (
                        <button
                          type="button"
                          key={category.name}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              category:
                                category.name,
                            })
                          }
                          className={`border rounded-xl p-3 flex items-center gap-2 transition-all text-sm font-medium

                          ${
                            formData.category ===
                            category.name
                              ? 'bg-primary text-primary-content border-primary'
                              : 'bg-base-100 hover:border-primary'
                          }
                          `}
                        >
                          {category.icon}

                          {category.name}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>

                  <label className="label">
                    <span className="label-text">
                      Description
                    </span>
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Optional notes..."
                    className="textarea textarea-bordered w-full"
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      })
                    }
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${
                    loading
                      ? 'btn-disabled'
                      : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Income'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT TABLE */}
        <div className="xl:col-span-2">

          <div className="card bg-base-100 shadow-xl">

            <div className="card-body">

              {/* TOP */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                <div>

                  <h2 className="text-2xl font-bold">
                    Income History
                  </h2>

                  <p className="text-sm text-base-content/60 mt-1">
                    Recent income activity
                  </p>
                </div>

                <div className="badge badge-success">
                  {
                    filteredIncomes.length
                  }{' '}
                  Incomes
                </div>
              </div>

              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">

                {/* CATEGORY FILTER */}
                <select
                  className="select select-bordered"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value
                    )
                  }
                >
                  <option value="All">
                    All Categories
                  </option>

                  {categories.map((cat) => (
                    <option
                      key={cat.name}
                      value={cat.name}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* MONTH FILTER */}
                <select
                  className="select select-bordered"
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value
                    )
                  }
                >
                  <option value="All">
                    All Months
                  </option>

                  <option value="1">
                    January
                  </option>

                  <option value="2">
                    February
                  </option>

                  <option value="3">
                    March
                  </option>

                  <option value="4">
                    April
                  </option>

                  <option value="5">
                    May
                  </option>

                  <option value="6">
                    June
                  </option>

                  <option value="7">
                    July
                  </option>

                  <option value="8">
                    August
                  </option>

                  <option value="9">
                    September
                  </option>

                  <option value="10">
                    October
                  </option>

                  <option value="11">
                    November
                  </option>

                  <option value="12">
                    December
                  </option>
                </select>
              </div>

              {/* TABLE */}
              {filteredIncomes.length >
              0 ? (
                <div className="overflow-x-auto">

                  <table className="table">

                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredIncomes.map(
                        (inc, index) => (
                          <tr key={inc._id}>

                            <td>
                              {index + 1}
                            </td>

                            <td className="font-medium">
                              {
                                inc.description
                              }
                            </td>

                            <td>
                              <div className="badge badge-outline">
                                {inc.category}
                              </div>
                            </td>

                            <td className="font-bold text-success">
                              +₹{inc.amount}
                            </td>

                            <td>
                              {new Date(
                                inc.date
                              ).toLocaleDateString()}
                            </td>

                            <td>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    inc._id
                                  )
                                }
                                className="btn btn-sm btn-error btn-outline"
                              >
                                <MdDelete />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-14 text-center">

                  <div className="text-5xl mb-3">
                    💰
                  </div>

                  <h3 className="text-xl font-semibold">
                    No Income Found
                  </h3>

                  <p className="text-base-content/60 mt-2">
                    Try changing filters or add
                    income
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}