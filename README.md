# Friday — Gaborone Event App

> Your city's pulse. Discover parties, restaurant nights, campus events, and public happenings in Gaborone, Botswana.

---

## 📁 Project Structure

```
friday/
├── public/
│   ├── images/
│   │   ├── black background.png   ← Your dark theme logo
│   │   ├── white background.png   ← Your light theme logo
│   │   ├── icon-192.png           ← PWA icon (make this)
│   │   └── icon-512.png           ← PWA icon (make this)
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── DesktopSidebar.jsx
│   │   ├── posts/
│   │   │   ├── PostCard.jsx
│   │   │   └── PostFeed.jsx
│   │   ├── comments/
│   │   │   └── CommentsSection.jsx
│   │   └── ui/
│   │       ├── VibeButton.jsx
│   │       └── FilterChips.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/
│   │   └── demoData.js
│   ├── hooks/
│   │   └── useToast.js
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── Create.jsx
│   │   ├── Profile.jsx
│   │   ├── PostDetail.jsx
│   │   └── Settings.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── vite.config.js
├── package.json
└── SUPABASE_SQL.sql
```

---

## ⚡ Step 1 — Set Up Supabase

### 1.1 Run the SQL

1. Go to [supabase.com](https://supabase.com) → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `SUPABASE_SQL.sql` from this project
5. Copy the entire contents and paste into the editor
6. Click **Run** (▶)

This creates:
- `profiles` table
- `posts` table
- `reactions` table
- `comments` table
- `comment_likes` table
- All RLS policies
- All indexes
- Auto-create profile trigger
- Storage buckets

### 1.2 Enable Auth

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it is by default)
3. Optional: disable "Confirm email" during development so you can test without email confirmation
   - **Auth** → **Settings** → uncheck "Enable email confirmations"

### 1.3 Phone Auth (later)

When ready to add phone OTP:
1. **Authentication** → **Providers** → **Phone**
2. Enable it and add your Twilio or Africa's Talking credentials
3. In the code, add `signInWithOtp({ phone })` to AuthContext

---

## ⚡ Step 2 — Add Your Logo Files

Put your logo images in `public/images/`:

- `public/images/black background.png` — used on dark theme
- `public/images/white background.png` — used on light theme

### Create PWA Icons

You need two icon files for the PWA install prompt:

- `public/images/icon-192.png` — 192×192px
- `public/images/icon-512.png` — 512×512px

**Easiest way:** Use your logo, put it on a black background, export as PNG at 192×192 and 512×512.

Free tools: [favicon.io](https://favicon.io), Figma, Canva.

---

## ⚡ Step 3 — Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://huyorbthvenltgexmzfk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eW9yYnRodmVubHRnZXhtemZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzE3NjUsImV4cCI6MjA5MjU0Nzc2NX0.Z_FfFLVgHPjKngqEliSM4M8bPJJaZ12ed3XYd1j6e5I
```

The `.env` file is already created for you with these values.

---

## ⚡ Step 4 — Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

The app will show **demo events** if the database is empty or unreachable. Once you post real events, they'll show instead.

---

## ⚡ Step 5 — Build for Production

```bash
npm run build
```

Output goes to `/dist`. Preview the build:

```bash
npm run preview
```

---

## ⚡ Step 6 — Deploy on Vercel

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: your account
# - Link to existing project: N
# - Project name: friday
# - In which directory is your code located: ./
# - Want to override: N
```

### Option B: Vercel Dashboard (easier)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Set **Framework Preset** to `Vite`
5. Add **Environment Variables**:
   - `VITE_SUPABASE_URL` = your URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **Deploy**

### Add your domain

After deploy, go to **Settings → Domains** in Vercel to add a custom domain.

---

## ⚡ Step 7 — Test PWA Install on Phone

### On Android (Chrome):
1. Open the app URL in Chrome
2. Tap the **⋮** menu (top right)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **Add**
5. The app icon appears on your home screen

### On iPhone (Safari):
1. Open the app URL in Safari
2. Tap the **Share** button (box with arrow, bottom center)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. The app icon appears on your home screen

### Test checklist:
- [ ] App opens full screen (no browser chrome)
- [ ] Bottom navigation works
- [ ] Theme matches system (dark/light)
- [ ] Feed loads (demo or real data)
- [ ] WhatsApp button opens WhatsApp
- [ ] Sign up / sign in works
- [ ] Create post works (when logged in)

---

## 🗄️ Database Schema Reference

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| username | text | Unique, 3-30 chars, lowercase |
| display_name | text | |
| avatar_url | text | |
| cover_url | text | |
| bio | text | |
| phone_number | text | |
| whatsapp_number | text | |
| is_verified | boolean | Default false |
| created_at | timestamptz | |

### posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| title | text | Required |
| description | text | |
| image_url | text | |
| category | text | Enum |
| location_name | text | |
| area | text | |
| event_date | date | |
| event_time | time | |
| price_text | text | e.g. "Free", "P50" |
| contact_phone | text | |
| whatsapp_number | text | |
| is_featured | boolean | Default false |
| created_at | timestamptz | |

### reactions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK → posts |
| user_id | uuid | FK → auth.users |
| reaction_type | text | Default 'vibe' |
| created_at | timestamptz | |
| UNIQUE | | (post_id, user_id) |

### comments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK → posts |
| user_id | uuid | FK → auth.users |
| parent_comment_id | uuid | Nullable, self-ref |
| content | text | 1–500 chars |
| created_at | timestamptz | |

### comment_likes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| comment_id | uuid | FK → comments |
| user_id | uuid | FK → auth.users |
| created_at | timestamptz | |
| UNIQUE | | (comment_id, user_id) |

---

## 🔮 What to Build Next

- [ ] Image upload (Supabase Storage) — replace URL input
- [ ] Phone OTP auth (Africa's Talking or Twilio)
- [ ] Push notifications (web push)
- [ ] Event RSVP / going feature
- [ ] Verified badge request flow
- [ ] Admin dashboard to feature events
- [ ] Event sharing (Open Graph meta)
- [ ] Map view of events
- [ ] Gaborone area expansion → other BW cities

---

## 🛟 Troubleshooting

**App shows demo data only**
→ Check your `.env` values match your Supabase project. Check RLS policies are applied. Check the browser console for errors.

**Sign up / login not working**
→ Go to Supabase → Auth → Settings → try disabling "Confirm email" for dev mode.

**Profile not created after signup**
→ Make sure the trigger `on_auth_user_created` ran. Go to Supabase → SQL Editor and re-run the trigger section.

**PWA not installing**
→ You need HTTPS. Make sure you're testing on your Vercel URL, not `localhost`.

**Logo not showing**
→ Check the filenames match exactly: `black background.png` and `white background.png` in `public/images/`.
