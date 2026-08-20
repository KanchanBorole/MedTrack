# MedTrack — Medicine Donation & Tracking Platform

MedTrack is a web app that connects individuals, NGOs, and hospitals to reduce medicine waste. Users can list surplus medicines for donation, post requests for medicines they need, track expiry dates, and find organizations on an interactive map.

## Demo Video Link - https://drive.google.com/file/d/1EEoPlTfpcRhhIPBW_qfe-ZVjbN1fNccM/view?usp=drive_link
## What the app does

- **Landing page** — Explains the platform, shows live stats, and features recent medicine listings.
- **Sign up / Sign in** — Create an account as an Individual, NGO, or Hospital. Each role gets a tailored dashboard.
- **Dashboard** — See your listings, expiry reminders, available donations, and active requests at a glance.
- **Browse** — Search and filter all medicines by name, category, listing type (donate/request), and city.
- **Add Medicine** — List a medicine for donation or post a request. Set name, category, quantity, expiry date, and notes.
- **Organizations map** — View all NGOs, hospitals, and donors on an interactive map with contact details.
- **Dark / Light theme** — Toggle between dark and light mode. Your choice is remembered on next visit.

## Tech stack

| Piece            | Technology                  |
|------------------|-----------------------------|
| Framework        | React 18 + TypeScript       |
| Build tool       | Vite                        |
| Styling          | Tailwind CSS                |
| Icons            | lucide-react                |
| Maps             | Leaflet                     |
| Backend / Auth   | Supabase (PostgreSQL + Auth)|
| Routing          | react-router-dom            |

## Prerequisites

Before you begin, make sure you have these installed on your computer:

1. **Node.js** — version 18 or higher. Download it from https://nodejs.org. To check if it is installed, open a terminal and run:
   ```
   node --version
   ```
   You should see something like `v18.x.x` or higher.

2. **npm** — comes bundled with Node.js. Check with:
   ```
   npm --version
   ```

3. **A Supabase project** — the app uses Supabase for its database and authentication. A project is already set up for this app, so the connection details are included in the `.env` file (see below).

## Local setup — step by step

Follow these steps to run the app on your own computer.

### Step 1: Get the code

Download or clone the project files to your computer. Open a terminal and navigate into the project folder:

```
cd path/to/project
```

### Step 2: Install dependencies

The app uses several libraries (React, Tailwind, Supabase client, Leaflet, etc.). Install them all at once:

```
npm install
```

This downloads everything listed in `package.json` into a `node_modules` folder. It may take a minute or two.

### Step 3: Check your environment file

The app needs a Supabase URL and an API key to connect to the database. These are stored in a file called `.env` at the root of the project. This file already exists and contains:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

If you are using the pre-configured Supabase project, you do not need to change anything. If you want to use your own Supabase project, replace these two values with your own project's URL and anon key (found in your Supabase dashboard under Settings > API).

### Step 4: Set up the database

The database schema is defined in a SQL migration file at:

```
supabase/migrations/20260813060312_medicine_tracker_schema.sql
```

This file creates two tables:

- **profiles** — stores user information (name, role, phone, city, location, etc.)
- **medicines** — stores medicine listings (name, quantity, expiry date, donation or request, status, etc.)

It also sets up **Row Level Security (RLS)** policies so that:
- Every signed-in user can browse all medicines and view all organization profiles.
- Each user can only create, edit, and delete their own listings.

If you are using the pre-configured Supabase project, this migration has already been applied. If you are setting up your own Supabase project, run this SQL file in the Supabase SQL Editor (Dashboard > SQL Editor > paste the file contents > Run).

### Step 5: Start the development server

Run:

```
npm run dev
```

You will see output like:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and go to **http://localhost:5173**. You should see the MedTrack landing page.

### Step 6: Create an account

1. Click **Get started** on the landing page.
2. Choose your account type: Individual, NGO, or Hospital.
3. Enter your name, email, and a password (at least 6 characters).
4. Optionally add your phone number and city.
5. Click **Create account**.

You will be taken to your dashboard. You can now list medicines, browse what others have posted, and find organizations on the map.

## Build for production

To create an optimized production build:

```
npm run build
```

This generates a `dist/` folder with minified, optimized files ready to deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

To preview the production build locally:

```
npm run preview
```

## Other useful commands

| Command               | What it does                                      |
|-----------------------|---------------------------------------------------|
| `npm run dev`         | Starts the development server with hot reload     |
| `npm run build`       | Creates an optimized production build             |
| `npm run preview`     | Previews the production build locally             |
| `npm run typecheck`   | Checks TypeScript types for errors (no build)     |
| `npm run lint`        | Runs ESLint to check code style and issues        |

## Project structure

```
project/
├── .env                          # Supabase connection details
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Tailwind theme, colors, animations
├── vite.config.ts                # Vite config with path alias
├── supabase/
│   └── migrations/
│       └── ..._medicine_tracker_schema.sql  # Database schema + RLS
└── src/
    ├── main.tsx                  # App entry, wraps with ThemeProvider
    ├── App.tsx                   # Routes (landing, auth, dashboard)
    ├── index.css                 # Tailwind + custom component styles
    ├── components/
    │   ├── AppLayout.tsx         # Sidebar + mobile drawer
    │   ├── MapView.tsx           # Leaflet map
    │   ├── MedicineCard.tsx      # Medicine listing card
    │   ├── PageHeader.tsx        # Reusable page title header
    │   ├── ThemeToggle.tsx       # Dark/light toggle button
    │   └── ui/
    │       └── RoleSelector.tsx  # Account type picker
    ├── lib/
    │   ├── auth.tsx              # Auth context + session handling
    │   ├── supabase.ts           # Supabase client + TypeScript types
    │   ├── theme.tsx             # Theme provider (dark/light)
    │   ├── useCountUp.ts         # Animated number counter hook
    │   └── utils.ts              # Date, expiry, and text helpers
    └── pages/
        ├── LandingPage.tsx       # Public landing page
        ├── AuthPage.tsx          # Sign in / Sign up
        ├── DashboardPage.tsx     # Main dashboard
        ├── BrowsePage.tsx        # Search and filter medicines
        ├── AddMedicinePage.tsx   # Create/edit a medicine listing
        └── MapPage.tsx           # Organizations map view
```

## Features in detail

### Three account types
- **Individual** — Donate surplus medicines or request medicines you need.
- **NGO** — Post medicine needs and receive donations from the community.
- **Hospital** — Coordinate medicine supply and connect with donors.

### Expiry tracking
Every medicine listing can have an expiry date. The app automatically calculates how many days are left and shows a color-coded badge:
- **Green** — More than 30 days remaining (safe)
- **Yellow** — 7 to 30 days remaining (expiring soon)
- **Red** — Less than 7 days or already expired (critical)

The dashboard highlights expiring medicines with a pulsing reminder section.

### Search and filter
The browse page lets you search by medicine name, filter by category (Pain Relief, Antibiotics, Vitamins, etc.), filter by listing type (donate or request), and filter by city.

### Interactive map
The organizations page shows all NGOs, hospitals, and donors on an interactive Leaflet map. Click any entry in the sidebar to see their details, including phone number and address.

### Dark mode
Click the sun/moon icon in the top-right corner (or in the sidebar on dashboard pages) to switch between light and dark mode. The map, cards, forms, and all UI elements adapt automatically. Your preference is saved and remembered across visits.

## Troubleshooting

**"Node version too old"** — Make sure you have Node.js 18 or higher. Check with `node --version`.

**"Cannot connect to Supabase"** — Double-check the `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values. Restart the dev server after changing `.env` (press Ctrl+C, then run `npm run dev` again).

**"Database tables missing"** — If you are using your own Supabase project, make sure you ran the migration SQL file in the Supabase SQL Editor.

**"Port 5173 already in use"** — Vite will automatically pick the next available port (e.g., 5174). Check the terminal output for the correct URL.

**"Blank page after login"** — Make sure your Supabase project has email authentication enabled (Dashboard > Authentication > Providers > Email). Email confirmation should be turned off for local development.
