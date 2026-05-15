import { useEffect, useState } from 'react';
import api from '../utils/api';
import { MdDelete } from 'react-icons/md';

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [overview, setOverview] = useState({});
  const [formData, setFormData] = useState({ title: '', amount: '', category: '', description: '', date: '' });

  useEffect(() => {
    fetchIncomes();
    fetchOverview();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await api.get('/income/get');
      const data = res.data?.data ? res.data.data : res.data;
      setIncomes(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const fetchOverview = async () => {
    try {
      const res = await api.get('/income/overview');
      setOverview(res.data?.data || res.data || {});
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        description: formData.title + (formData.description ? ` - ${formData.description}` : ''),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date
      };
      await api.post('/income/add', payload);
      setFormData({ title: '', amount: '', category: '', description: '', date: '' });
      fetchIncomes();
      fetchOverview();
    } catch (error) { alert('Failed to add income'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await api.delete(`/income/delete/${id}`);
        fetchIncomes();
        fetchOverview();
      } catch (error) { alert('Failed to delete income'); }
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await api.get('/income/downloadExcel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'incomes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(error);
      alert('Failed to download excel');
    }
  };

  return (
    <div>
      <h1 className="page-title">Income Management</h1>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="brutalist-card stat-card" style={{ background: 'var(--primary)', color: 'white' }}>
          <div className="stat-title" style={{ color: 'white' }}>Total Income</div>
          <div className="stat-value" style={{ color: 'white' }}>₹{overview.totalIncome || 0}</div>
        </div>
        <div className="brutalist-card stat-card">
          <div className="stat-title">Monthly Income</div>
          <div className="stat-value">₹{overview.monthlyIncome || 0}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="brutalist-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Add New Income</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Title" className="brutalist-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <input type="number" placeholder="Amount" className="brutalist-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <input type="text" placeholder="Category" className="brutalist-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
            <input type="date" className="brutalist-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <textarea placeholder="Description" className="brutalist-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            <button type="submit" className="brutalist-button">ADD INCOME</button>
          </form>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Income History</h2>
            <button onClick={handleDownloadExcel} className="brutalist-button" style={{ padding: '0.5rem 1rem', fontSize: '1rem', background: 'var(--primary)', color: 'white' }}>
              Download Excel
            </button>
          </div>
          <div className="brutalist-table-container">
            <table className="brutalist-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(incomes || []).map((inc, index) => (
                  <tr key={inc._id}>
                    <td>{index + 1}</td>
                    <td>{inc.title || inc.description}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+₹{inc.amount}</td>
                    <td>{new Date(inc.date).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(inc._id)} 
                        className="brutalist-button accent" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '1.2rem' }}
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
