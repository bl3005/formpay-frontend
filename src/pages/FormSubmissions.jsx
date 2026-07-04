import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFormSubmissions } from '../services/api';
import { getSocket } from '../services/socket';
import './FormSubmissions.css';

const FormSubmissions = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFormSubmissions(id);
        setForm(data.form);
        setSubmissions(data.submissions);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = getSocket();
    if (!socket) return;

    socket.on('submission:new', (payload) => {
      if (payload.formId !== id) return;
      setSubmissions(prev => [payload.submission, ...prev]);
      setNewIds(prev => new Set(prev).add(payload.submission._id));
      setTimeout(() => {
        setNewIds(prev => {
          const next = new Set(prev);
          next.delete(payload.submission._id);
          return next;
        });
      }, 2500);
    });

    return () => socket.off('submission:new');
  }, [id]);

  if (loading) return <div className="submissions-loading">Loading submissions…</div>;
  if (error) return <div className="submissions-error">{error}</div>;

  return (
    <div className="submissions-container">
      <Link to="/" className="back-link">← Back to dashboard</Link>

      <div className="submissions-header">
        <h1>{form.title}</h1>
        {form.description && <p>{form.description}</p>}
        <div className="submissions-meta">
          <span className="badge badge-info">{submissions.length} response{submissions.length !== 1 ? 's' : ''}</span>
          {form.requiresPayment && (
            <span className="badge badge-success">${(form.price / 100).toFixed(2)} per response</span>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <p className="empty-text">No responses yet. Share your form link to start collecting submissions.</p>
      ) : (
        <div className="submissions-table-container">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Submitted</th>
                {form.fields.map(field => (
                  <th key={field.name}>{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id} className={newIds.has(sub._id) ? 'row-pulse' : ''}>
                  <td className="submitted-at mono">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  {form.fields.map(field => (
                    <td key={field.name}>
                      {sub.answers?.[field.name] || <span className="empty-answer">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;
