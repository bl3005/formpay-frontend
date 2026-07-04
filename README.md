# FormPay — Frontend

React frontend for FormPay, a full-stack form builder that lets users create forms, collect responses, and simulate payment collection — all with live real-time updates via WebSocket.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| HTTP | Axios |
| Real-time | Socket.IO Client |
| Styling | Custom CSS (no UI library) |
| Fonts | Fraunces · Inter · JetBrains Mono |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── FormBuilder.jsx       # Form builder with field editor
│   │   └── MockCardElement.jsx   # Simulated card input (Luhn-validated)
│   ├── pages/
│   │   ├── Login.jsx             # Sign in
│   │   ├── Register.jsx          # Create account
│   │   ├── Home.jsx              # Dashboard with live stats
│   │   ├── PublicForm.jsx        # Public form fill + payment flow
│   │   └── FormSubmissions.jsx   # Per-form live submission table
│   ├── services/
│   │   ├── api.js                # Axios API calls
│   │   └── socket.js             # Socket.IO singleton with JWT auth
│   ├── App.jsx                   # Routes
│   ├── App.css                   # Shared primitives (inputs, buttons, badges)
│   └── index.css                 # Global tokens, typography, body
├── index.html
└── package.json
```

---

## Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/` | Dashboard | Private |
| `/f/:id` | Public form | Public |
| `/forms/:id/submissions` | Submission details | Private |

---

## Features

- **Form builder** — sidebar field palette (text, email, long text, number, dropdown), inline label editing, required field toggle, optional payment price
- **Dashboard** — live stats (form count, total submissions, revenue), forms table with share link and delete
- **Live updates** — Socket.IO with JWT auth; stats and submission table update instantly when someone submits, no page refresh
- **Public form** — renders any form by shareable link; simulated card payment with Luhn validation
- **Submissions view** — full table of every response, one column per field, new rows flash in live

---

## Environment Variables

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Getting Started

```bash
npm install
npm run dev       # development
npm run build     # production build
npm run preview   # preview production build locally
```

---

## Design System

Custom **"form as receipt/ledger"** design — no component library.

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#F9F6EF` | Page background |
| `--surface` | `#FFFFFF` | Cards, inputs |
| `--ink` | `#1A1917` | Text, borders |
| `--stamp` | `#D94F35` | Accent — CTAs, errors |
| `--ledger` | `#27654A` | Success, revenue |
| `--rule` | `#E0D9CC` | Dividers |

Shared primitives (`form-group`, `input-primary`, `btn-submit`, `badge-*`) live in `App.css` — import it in any page that uses them.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import on [Vercel](https://vercel.com), set preset to **Vite**
3. Add env var: `VITE_API_URL=https://your-backend-url/api`
4. Deploy — Vercel handles the build automatically

> Ensure your backend CORS config allows requests from your Vercel domain.