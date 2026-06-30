# FinnetTrust User Dashboard & Post Manager

A full-stack app for browsing users and managing their posts, built for the
FinnetTrust technical assessment.

**Live demo:** _(add Vercel/Render URLs here after deploying)_
**Repo:** _(add Git repo link here)_

---

## Project structure

```
.
├── server/                 FastAPI backend
│   ├── app/
│   │   ├── main.py         App entrypoint, CORS, startup seeding, error handlers
│   │   ├── database.py     SQLAlchemy engine/session config
│   │   ├── models.py       User, Post ORM models
│   │   ├── schemas.py      Pydantic request/response shapes
│   │   ├── seed.py         Idempotent Faker-based seed script
│   │   └── routers/
│   │       ├── users.py    GET /api/users, GET /api/users/:id
│   │       └── posts.py    GET/POST /api/users/:id/posts
│   └── requirements.txt
│
└── client/                 React frontend
    └── src/
        ├── components/      UserSidebar, ProfileCard, PostsFeed, PostItem, NewPostForm, Avatar
        ├── store/           RTK Query API slice + Redux store
        ├── types.ts         Shared TypeScript interfaces matching the API contract
        ├── App.tsx
        └── index.css        Design tokens (Tailwind v4 @theme)
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm

---

## Setup & running locally

### Backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The database is auto-created and auto-seeded on first run (8 users, 3–6 posts
each, generated with Faker using a fixed seed so the data is reproducible).
Re-running the server does **not** duplicate data — seeding checks for
existing rows first.

API docs (interactive): `http://localhost:8000/docs`
Health check: `http://localhost:8000/health`

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`. The API base URL is read from
`VITE_API_URL` (see `client/.env`, defaults to `http://localhost:8000`).

### Seed data

No manual step needed — auto-seeds on first backend startup. To reset, stop
the server and delete `server/finnet.db`, then restart.

---

## Design decisions & trade-offs

**Database: SQLite over Postgres.**
Zero setup, single file, trivial to reset for graders re-running this. The
ORM (SQLAlchemy) is the actual data boundary in the code, so swapping to
Postgres later is a one-line connection-string change, not a rewrite. The
trade-off is SQLite's weaker concurrent-write story, which doesn't matter at
this scope but would matter in production.

**Seed data: Kenya-localized, not generic Faker defaults.**
Names, emails, and company names use Faker's `en_KE` provider so they read
as real Kenyan identities rather than the default US-style fixtures. Faker's
`en_KE` address provider still falls back to generic English town-name
templates, though, so cities and street addresses are hand-curated from
real Kenyan locations (Nairobi, Mombasa, Kisumu, etc. and real street names
like Moi Avenue, Kimathi Street) instead of using it as-is. Post bodies are
hand-written rather than Faker's `paragraph()` — that method produces
grammatically valid but meaningless word salad, which doesn't read
convincingly as a real social/business post feed; a small bank of genuine,
locally-grounded post topics (M-Pesa, traffic on Thika Road, NSSF payroll
changes, etc.) is sampled per user instead.

**Company/address as flat columns, not separate tables.**
The spec needs these only as read-only fields attached to a user — there's
no independent querying or reuse of "company" or "address" as their own
entities. Normalizing them into separate tables would add joins with no
corresponding benefit here. The API still returns them as nested
`company: { name }` / `address: { city, street }` objects (reshaped in the
Pydantic schema layer) so the contract matches the spec exactly while the
storage stays simple.

**Optimistic UI updates via RTK Query, not a manual refetch.**
New posts are inserted into the cache immediately (with a temporary negative
ID) so they appear at the top of the feed with zero perceived latency. If
the request fails, the optimistic patch is rolled back automatically and the
user sees a clear inline error instead of a silently vanished post. On
success, the temporary entry is swapped for the real server record (real ID,
server-trimmed strings) rather than triggering a full refetch — fewer
network round-trips, no UI flicker.

**Validation duplicated on client and server, deliberately.**
The backend is the source of truth (rejects blank/whitespace-only title or
body with a 422 and field-level messages). The frontend mirrors the same
check before submitting, purely so a person gets instant feedback without
waiting on a network round-trip for an error they could've been told about
immediately. If the two ever disagree, the server's validation wins — the
frontend always surfaces server-returned field errors over its own.

**Design language: navy/teal "ledger" aesthetic, not a generic dashboard
template.**
Given this is a fintech client and the core content is a post *history*,
the UI leans into a statement/ledger metaphor — numbered entries, a
monospace face for data (emails, post numbers), a single teal accent
reserved for actions and state, rather than a generic SaaS color scheme.
Numbered markers on posts are meaningful here (real recency order), not
decorative.

**Sidebar responsiveness.**
On desktop the user list is a persistent left column (per spec's
"sidebar" option); on mobile it collapses into a horizontal scrollable strip
above the content rather than a separate dropdown, so user-switching stays
one tap away instead of being buried in a menu.

**No external state library beyond RTK Query.**
RTK Query's cache (loading/error/data states, tag-based invalidation) covers
everything the spec asks for — there was no need for a separate data-fetching
library or extra global state.

---

## Extra features beyond the spec

- Optional `GET /api/users/:userId` endpoint
- Optional pagination (`skip`/`limit`) on the posts endpoint
- Deterministic seed data (same data every fresh run, useful for grading)
- Reduced-motion support (`prefers-reduced-motion`) on all animations
- Field-level validation errors surfaced inline on the form, not just a
  generic toast

---

## Libraries used (beyond the obvious framework choices)

- **Faker** (backend) — realistic seed data without hand-writing fixtures
- **Redux Toolkit / RTK Query** (frontend) — data fetching, caching, and
  optimistic updates in one place, avoiding hand-rolled loading/error state
  per component
- **Tailwind CSS v4** — utility-first styling with design tokens defined
  once in `index.css` (`@theme`) and reused across all components
