import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getForms, logout, deleteForm } from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';
import FormBuilder from '../components/FormBuilder';
import './Home.css';

const Home = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [live, setLive] = useState(false);
  const [pulseId, setPulseId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();

    const socket = getSocket();
    if (!socket) return;

    socket.on('connect', () => setLive(true));
    socket.on('disconnect', () => setLive(false));

    // Live-update stats and the table the instant a submission comes in,
    // no refetch needed.
    socket.on('submission:new', ({ formId, amount }) => {
      setForms(prev => prev.map(form => {
        if (form._id !== formId) return form;
        return {
          ...form,
          submissionCount: (form.submissionCount || 0) + 1,
          totalPayments: (form.totalPayments || 0) + (amount || 0),
        };
      }));
      setPulseId(formId);
      setTimeout(() => setPulseId(null), 1500);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('submission:new');
    };
  }, []);

  useEffect(() => () => disconnectSocket(), []);

  const fetchForms = async () => {
    try {
      const data = await getForms();
      setForms(data);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await deleteForm(id);
      fetchForms();
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  };

  const copyShareLink = (id) => {
    const url = `${window.location.origin}/f/${id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  // Dashboard stats
  const totalForms = forms.length;
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionCount || 0), 0);
  const totalRevenue = forms.reduce((acc, f) => acc + (f.totalPayments || 0), 0);

  return (
    <div className="home-container">
      <div className="top-nav">
        <h2 className="nav-brand">FormPay</h2>
        <div className="top-nav-right">
          <span className={`live-indicator ${live ? 'is-live' : ''}`}>
            <span className="live-dot" /> {live ? 'Live' : 'Connecting…'}
          </span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      <header className="hero">
        <h1>Your forms, ledgered</h1>
        <p>Build forms, collect responses, and get paid — all from one place.</p>
      </header>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon forms-icon">▤</div>
          <div className="stat-info">
            <span className="stat-value">{totalForms}</span>
            <span className="stat-label">Total Forms</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon submissions-icon">✎</div>
          <div className="stat-info">
            <span className="stat-value">{totalSubmissions}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue-icon">$</div>
          <div className="stat-info">
            <span className="stat-value">${(totalRevenue / 100).toFixed(2)}</span>
            <span className="stat-label">Revenue Collected</span>
          </div>
        </div>
      </section>

      {/* Create Form Toggle */}
      <section className="create-form-section">
        <button 
          className={`btn-create-form ${showBuilder ? 'active' : ''}`} 
          onClick={() => setShowBuilder(!showBuilder)}
        >
          {showBuilder ? '✕ Close builder' : '+ New form'}
        </button>
        
        {showBuilder && (
          <div className="form-builder-section">
            <FormBuilder onFormCreated={() => { fetchForms(); setShowBuilder(false); }} />
          </div>
        )}
      </section>

      {/* Forms Table */}
      <section className="forms-list-section">
        <h2>Your Forms</h2>
        {loading ? (
          <p className="empty-text">Loading forms...</p>
        ) : forms.length === 0 ? (
          <p className="empty-text">No forms yet. Create one to get started!</p>
        ) : (
          <div className="forms-table-container">
            <table className="forms-table">
              <thead>
                <tr>
                  <th>Form Title</th>
                  <th>Fields</th>
                  <th>Submissions</th>
                  <th>Price</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map(form => (
                  <tr key={form._id} className={pulseId === form._id ? 'row-pulse' : ''}>
                    <td>
                      <Link to={`/forms/${form._id}/submissions`} className="form-title-cell form-title-link">
                        <span className="form-title">{form.title}</span>
                        {form.description && <span className="form-desc">{form.description}</span>}
                      </Link>
                    </td>
                    <td><span className="badge badge-neutral">{form.fields.length}</span></td>
                    <td><span className="badge badge-info">{form.submissionCount || 0}</span></td>
                    <td>
                      {form.requiresPayment 
                        ? <span className="badge badge-success">${(form.price / 100).toFixed(2)}</span>
                        : <span className="badge badge-neutral">Free</span>
                      }
                    </td>
                    <td>
                      <span className="revenue-value">${((form.totalPayments || 0) / 100).toFixed(2)}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action btn-share" onClick={() => copyShareLink(form._id)} title="Copy share link">⤴</button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(form._id)} title="Delete form">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
