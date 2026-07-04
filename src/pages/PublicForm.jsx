import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicForm, submitForm, createPaymentIntent, confirmPayment } from '../services/api';
import MockCardElement from '../components/MockCardElement';
import './PublicForm.css';

const PublicForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [answers, setAnswers] = useState({});
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const formData = await getPublicForm(id);
        setForm(formData);
        const initial = {};
        (formData.fields || []).forEach(f => { initial[f.name] = ''; });
        setAnswers(initial);
        if (formData.requiresPayment) {
          const pd = await createPaymentIntent(id);
          setPaymentId(pd.paymentId);
        }
      } catch {
        setPageError('Form not found or is no longer available.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (form.requiresPayment) {
        const result = await confirmPayment(paymentId, card);
        if (result.status !== 'succeeded') throw new Error('Payment was not successful.');
      }
      await submitForm(id, answers, form.requiresPayment ? paymentId : undefined);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="public-form-loading">Loading form…</div>;
  if (pageError || !form) return <div className="public-form-error">{pageError || 'Form unavailable.'}</div>;

  if (success) {
    return (
      <div className="public-form-page">
        <div className="public-form-card">
          <div className="public-form-success">
            <div className="success-icon">✓</div>
            <h2>Submitted!</h2>
            <p>Your response has been recorded. Thank you.</p>
          </div>
        </div>
      </div>
    );
  }

  const cardReady = !form.requiresPayment || (card.cardNumber && card.expiry && card.cvc);

  return (
    <div className="public-form-page">
      <div className="public-form-brand">FormPay</div>

      <div className="public-form-card">
        <div className="public-form-header">
          <h1>{form.title}</h1>
          {form.description && <p>{form.description}</p>}
          {form.requiresPayment && (
            <div className="payment-badge">
              ${(form.price / 100).toFixed(2)} to submit
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="public-form">
          {error && <div className="auth-error">{error}</div>}

          {form.fields.map((field) => (
            <div key={field.name} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required"> *</span>}
              </label>

              {field.type === 'text' && (
                <input type="text" className="input-primary"
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(p => ({ ...p, [field.name]: e.target.value }))}
                  required={field.required} />
              )}
              {field.type === 'email' && (
                <input type="email" className="input-primary"
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(p => ({ ...p, [field.name]: e.target.value }))}
                  required={field.required} />
              )}
              {field.type === 'number' && (
                <input type="number" className="input-primary"
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(p => ({ ...p, [field.name]: e.target.value }))}
                  required={field.required} />
              )}
              {field.type === 'textarea' && (
                <textarea className="input-primary" rows={4}
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(p => ({ ...p, [field.name]: e.target.value }))}
                  required={field.required} />
              )}
              {field.type === 'dropdown' && (
                <select className="input-primary"
                  value={answers[field.name] || ''}
                  onChange={e => setAnswers(p => ({ ...p, [field.name]: e.target.value }))}
                  required={field.required}>
                  <option value="">Select an option…</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {form.requiresPayment && (
            <div className="payment-section">
              <span className="payment-section-label">Card details</span>
              <MockCardElement value={card} onChange={setCard} />
            </div>
          )}

          <div className="public-form-actions">
            <span className="form-submit-note">
              {form.requiresPayment ? 'Simulated payment — no real charge' : 'Free submission'}
            </span>
            <button type="submit" className="btn-submit" disabled={submitting || !cardReady}>
              {submitting ? 'Processing…' : form.requiresPayment
                ? `Pay $${(form.price / 100).toFixed(2)} & submit`
                : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicForm;
