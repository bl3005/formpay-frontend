import { useState } from 'react';

const fmt4 = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
const fmtExp = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

const MockCardElement = ({ value, onChange }) => {
  const [focused, setFocused] = useState(null);

  const handle = (field, formatter) => (e) => {
    const val = formatter ? formatter(e.target.value) : e.target.value;
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="mock-card-element">
      <div className="mock-card-number-row">
        <input
          type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
          value={value.cardNumber}
          onChange={handle('cardNumber', fmt4)}
          onFocus={() => setFocused('number')}
          onBlur={() => setFocused(null)}
          className="mock-card-input"
          maxLength={23}
        />
      </div>
      <div className="mock-card-split-row">
        <input
          type="text" inputMode="numeric" placeholder="MM/YY"
          value={value.expiry}
          onChange={handle('expiry', fmtExp)}
          onFocus={() => setFocused('expiry')}
          onBlur={() => setFocused(null)}
          className="mock-card-input mock-card-expiry"
          maxLength={5}
        />
        <input
          type="text" inputMode="numeric" placeholder="CVC"
          value={value.cvc}
          onChange={handle('cvc', v => v.replace(/\D/g, '').slice(0, 4))}
          onFocus={() => setFocused('cvc')}
          onBlur={() => setFocused(null)}
          className="mock-card-input mock-card-cvc"
          maxLength={4}
        />
      </div>
      <p className="mock-card-hint">
        Test mode — use any Luhn-valid card number (e.g. <code>4242 4242 4242 4242</code>),
        any future expiry, any 3-digit CVC. Use <code>4000 0000 0000 0002</code> to test a decline.
      </p>
    </div>
  );
};

export default MockCardElement;
