import { useState } from 'react';
import { createForm } from '../services/api';
import './FormBuilder.css';

const FormBuilder = ({ onFormCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const addField = (type) => {
    setFields([...fields, {
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} field`,
      name: `field_${Date.now()}`,
      required: false,
      ...(type === 'dropdown' ? { options: ['Option 1', 'Option 2'] } : {})
    }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { alert('Form title is required'); return; }
    setLoading(true);
    try {
      await createForm({
        title,
        description,
        requiresPayment,
        price: requiresPayment ? Math.round(parseFloat(price) * 100) : 0,
        fields,
      });
      setTitle(''); setDescription('');
      setRequiresPayment(false); setPrice(''); setFields([]);
      if (onFormCreated) onFormCreated();
    } catch {
      alert('Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-builder">
      <div className="form-builder-header">
        <h2>Create new form</h2>
      </div>

      <div className="form-builder-body">
        {/* Sidebar — field type buttons */}
        <div className="form-builder-sidebar">
          <h3>Add field</h3>
          {['text', 'email', 'textarea', 'number', 'dropdown'].map(type => (
            <button key={type} type="button" onClick={() => addField(type)} className="btn-add-field">
              {type === 'textarea' ? 'Long text' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="form-builder-canvas">
          <form onSubmit={handleSubmit}>
            {/* Title + Description */}
            <div className="form-meta-row">
              <div className="form-group">
                <label>Form title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Event registration" className="input-primary" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Short description (optional)" className="input-primary" />
              </div>
            </div>

            {/* Payment row */}
            <div className="payment-row">
              <div className="checkbox-group form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={requiresPayment}
                    onChange={e => setRequiresPayment(e.target.checked)} />
                  Require payment to submit
                </label>
              </div>
              {requiresPayment && (
                <div className="price-field form-group">
                  <label>Price (USD)</label>
                  <input type="number" min="0.50" step="0.01" value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 9.99" className="input-primary" required />
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="fields-container">
              {fields.length === 0 ? (
                <div className="empty-state">
                  <p>No fields yet — add one using the panel on the left.</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.name} className="field-editor-card">
                    <div className="field-editor-header">
                      <span className="field-type-badge">{field.type}</span>
                      <button type="button" className="btn-remove" onClick={() => removeField(index)}>✕</button>
                    </div>
                    <div className="field-editor-body">
                      <div className="form-group full-width">
                        <label>Label</label>
                        <input type="text" value={field.label}
                          onChange={e => updateField(index, 'label', e.target.value)}
                          className="input-secondary" />
                      </div>

                      {field.type === 'dropdown' && (
                        <div className="form-group full-width">
                          <label>Options (comma separated)</label>
                          <input type="text"
                            value={field.options ? field.options.join(', ') : ''}
                            onChange={e => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                            className="input-secondary"
                            placeholder="Option 1, Option 2, Option 3" />
                        </div>
                      )}

                      <div className="form-group checkbox-wrap">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={field.required}
                            onChange={e => updateField(index, 'required', e.target.checked)} />
                          Required field
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
