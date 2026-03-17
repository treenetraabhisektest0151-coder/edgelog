# EdgeLog — Professional Forex Trading Journal

A full-stack personal trading journal built with **Next.js 14**, **Firebase**, **Tailwind CSS**, and **Recharts**.  
100% free-tier. No paid APIs. Deploy to Vercel in minutes.

---

## Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | Firebase Email/Password — per-user data isolation |
| 📊 Dashboard | Balance, PnL periods, equity curve, win rate, streak |
| 📓 Journal | Full trade form with live R:R & P&L calc, sort, filter, CSV export |
| 🧠 Psychology | Mood/confidence/fear sliders, discipline toggle, mistake tracker |
| 🖼️ Screenshots | Before/After/Markup image upload via Firebase Storage |
| 📈 Analytics | 5 Recharts charts: win rate by pair, session profit, strategy perf, mood scatter, cumulative PnL |
| 📅 Calendar | Monthly P&L grid — green/red/gold color-coded days |
| 📰 News | Manual economic event logger with impact levels |
| 🖼 Gallery | Screenshot grid with lightbox viewer |
| ⚙️ Settings | Profile, starting balance, risk %, broker |
| 🏷️ Tags | #SMC #ICT #Scalp #PerfectSetup #Mistake — filterable |
| 📤 CSV Export | One-click export of all filtered trades |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom design system
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Charts**: Recharts
- **State**: Zustand + Firestore real-time `onSnapshot`
- **Fonts**: Syne (display) + DM Mono (numbers)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd edgelog
npm install
```

### 2. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create project** (disable Google Analytics if you want)
3. **Authentication** → Sign-in method → Email/Password → Enable
4. **Firestore Database** → Create database → Production mode → choose a region
5. **Storage** → Get started → Production mode
6. **Project Settings** → Your apps → `</>` Web → Register app → copy config

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

### 4. Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /trades/{tradeId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    match /news/{newsId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Firebase Storage Rules

In Firebase Console → Storage → **Rules** tab:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trades/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Firestore Indexes

In Firebase Console → Firestore → **Indexes** → Composite → Add index:

| Collection | Fields | Order |
|-----------|--------|-------|
| `trades` | `userId` ASC, `date` DESC, `time` DESC | |
| `news`   | `userId` ASC, `date` DESC | |

> **Tip**: When you first run the app, Firestore will log errors with direct links to create these indexes automatically.

### 7. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

```bash
# Option A: Vercel CLI
npx vercel --prod

# Option B: Push to GitHub, then import at vercel.com
```

**Add environment variables in Vercel:**
1. Dashboard → Your project → Settings → Environment Variables
2. Add all 6 `NEXT_PUBLIC_FIREBASE_*` values
3. Redeploy

---

## Folder Structure

```
edgelog/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, providers)
│   │   ├── globals.css         # Design system (cards, table, forms, badges)
│   │   ├── page.tsx            # Auth redirect
│   │   ├── auth/page.tsx       # Sign in / Sign up
│   │   └── (app)/              # Route group — all protected pages
│   │       ├── layout.tsx      # Sidebar navigation shell
│   │       ├── dashboard/      # KPIs, equity curve, recent trades
│   │       ├── journal/        # Trade log, filters, form modal, CSV
│   │       ├── analytics/      # 5 Recharts charts + filters
│   │       ├── calendar/       # Monthly P&L calendar
│   │       ├── news/           # Economic event logger
│   │       ├── gallery/        # Screenshot grid + lightbox
│   │       └── settings/       # Profile + account settings
│   ├── components/
│   │   ├── ui/                 # StatCard, Modal, ImageUpload, TagSelector
│   │   ├── dashboard/          # EquityCurveChart, RecentTrades
│   │   ├── journal/            # TradeForm, TradeTable, TradeFilters
│   │   └── analytics/          # Charts (5 chart types)
│   ├── context/
│   │   ├── AuthContext.tsx     # Firebase Auth provider
│   │   └── TradeStore.ts       # Zustand store + Firestore sync
│   ├── lib/
│   │   ├── firebase.ts         # Firebase init
│   │   └── constants.ts        # Pairs, sessions, strategies, colors
│   ├── types/index.ts          # All TypeScript types
│   └── utils/index.ts          # Calculations + formatters
├── public/favicon.svg
├── .env.local.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Trade P&L Calculation

```
Pips = (Exit - Entry) × pipMultiplier   [BUY]
     = (Entry - Exit) × pipMultiplier   [SELL]

pipMultiplier = 100     (JPY pairs)
              = 10      (XAU/Gold)
              = 1       (BTC/ETH)
              = 10000   (standard forex)

P&L  = Pips × pipValue × lotSize
pipValue = $10/pip/lot (standard)
```

---

## Free Tier Limits

| Service | Free Limit | Notes |
|---------|-----------|-------|
| Firebase Auth | 10,000 users/month | More than enough |
| Firestore reads | 50,000/day | ~1,000 trades reads 50× = fine |
| Firestore writes | 20,000/day | Each trade = 1 write |
| Storage | 5 GB | ~5,000 screenshots @ 1MB each |
| Vercel | Unlimited hobby deploys | Custom domain supported |

---

## License

Personal use. Free to modify and deploy for yourself.
