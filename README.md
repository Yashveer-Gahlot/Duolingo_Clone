# 🦉 Duolingo Clone — Full-Stack Web Application

**Scaler SDE Fullstack Assignment**

A pixel-perfect, production-grade clone of the Duolingo web app, built as a decoupled full-stack system. It features an interactive lesson player with 5 exercise types, a gamified multi-unit learning path, real-time streak tracking, a hearts economy, achievements, a league leaderboard, and premium micro-animations — all powered by a FastAPI + SQLite backend.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend (Vercel) | [`https://duolingo-clone.vercel.app`](https://duolingo-clone.vercel.app) |
| ⚙️ Backend API (Render) | [`https://duolingo-api.onrender.com`](https://duolingo-api.onrender.com) |
| 📖 API Docs (Swagger) | [`/docs`](https://duolingo-api.onrender.com/docs) |

> **Note:** Replace the above URLs with your actual deployment links before submission.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><strong>🏠 Home — Skill Tree Path</strong></td>
    <td align="center"><strong>📝 Lesson Player</strong></td>
  </tr>
  <tr>
    <td><em>Multi-unit path with green/purple themed banners, zigzag skill nodes, and unit jump FAB</em></td>
    <td><em>Interactive exercises with animated feedback, hearts, XP bar, and confetti on completion</em></td>
  </tr>
  <tr>
    <td align="center"><strong>🏆 Leaderboard</strong></td>
    <td align="center"><strong>👤 Profile & Achievements</strong></td>
  </tr>
  <tr>
    <td><em>Dynamic league system with rank-based tiers (Diamond → Bronze)</em></td>
    <td><em>XP/Streak stats, achievement progress bars, following system</em></td>
  </tr>
</table>

---

## ✅ Features

### Core Features

| Feature | Description |
|---|---|
| **Interactive Lesson Player** | Full-featured player with a progress bar, heart counter, XP tracker, real-time feedback, and animated transitions between exercises |
| **5 Exercise Types** | `Multiple Choice`, `Word Bank / Translate`, `Fill in the Blank`, `Type the Answer`, `Match Pairs` — each with a distinct UI component |
| **Learning Path / Skill Tree** | Duolingo-style zigzag snake path with SVG connector lines, circular skill nodes, a popover lesson selector, and locked/unlocked/completed states |
| **Gamification Engine** | XP accumulation, daily streak tracking (date-diff logic), a hearts economy (lose a heart on a wrong answer, capped at 5), gems currency, and 8 progressive achievements |
| **Animated Feedback** | Correct (green slide-up) / incorrect (red shake) feedback bar with Framer Motion, a confetti cannon on lesson completion, and mascot celebrations |
| **Persistent Progress** | All progress stored in SQLite via SQLAlchemy ORM. Skill completion auto-unlocks the next skill; Unit 2 unlocks once Unit 1 is fully completed |
| **Leaderboard** | 🏆 Podium visualization with weekly XP rankings |
| **Profile Page** | 👤 Avatar, stats, XP progress, streak status, and achievements |
| **Synthetic Audio** | 🔊 Web Audio API sounds (correct chime, error buzz, fanfare, UI clicks) — no external audio files needed |

### Advanced & Bonus Features

| Feature | Description |
|---|---|
| **Hearts Regeneration** | Time-based refill: +1 heart every 4 hours, calculated on-demand via `datetime` diff (no cron jobs needed) |
| **Daily Goal Tracker** | Circular SVG progress ring showing daily XP vs. 50 XP goal, powered by the `DailyActivity` table |
| **Multi-Unit Course** | 2 full units (Foundations + Order Food & Travel) with 6 skills, 18 lessons, and 90 exercises total |
| **League Leaderboard** | Dynamic rank-position leagues (Diamond top 10%, Gold top 30%, Silver top 60%, Bronze rest) |
| **Achievement System** | 8 achievements across streak, XP, and accuracy categories with real-time progress tracking |
| **Dark Mode** | Full dark mode via `next-themes` with Duolingo-specific tokens (`#131f24` background, `#202f36` cards) |
| **Super Duolingo Mock** | Premium subscription UI with unlimited hearts, no-ads badge, and a gem-based purchase flow |
| **Social / Friends** | Follow/unfollow system with follower counts and a friend activity feed |
| **Settings Page** | Placeholder settings UI with account info, preference toggles, and sign-out button |
| **Mobile Responsive** | Bottom tab navigation on mobile, responsive skill tree, full-width feedback drawer |
| **Mascot Flourishes** | Animated owl mascot with mood states (happy, celebrate, sad) integrated into modals and completion screens |

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                       │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Skill    │  │ Lesson   │  │ Leader-  │  │ Profile &     │   │
│  │ Tree     │  │ Player   │  │ board    │  │ Achievements  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘   │
│       │              │             │                │             │
│       └──────────────┴─────────────┴────────────────┘             │
│                              │                                     │
│                    apiFetch() ─ typed fetch client                 │
│                              │                                     │
│              Framer Motion · Tailwind CSS · next-themes            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       SERVER (FastAPI)                            │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ users    │  │ courses  │  │ lessons  │  │ leaderboard   │   │
│  │ router   │  │ router   │  │ router   │  │ router        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘   │
│       │              │             │                │             │
│       └──────────────┴─────────────┴────────────────┘             │
│                              │                                     │
│              Pydantic Schemas · SQLAlchemy ORM                    │
│                              │                                     │
│                     SQLite (duolingo_clone.db)                     │
└──────────────────────────────────────────────────────────────────┘
```

### Core Lesson Flow (Step-by-Step)

```
1. User clicks a Skill Node on the Home Path
       │
2. Popover shows available lessons → User clicks "START"
       │
3. GET /api/lessons/{id}/exercises
   → Returns ordered list of 5 exercises (all types)
       │
4. User completes each exercise in the Lesson Player
   → Correct: +XP, green feedback, celebration animation
   → Incorrect: -1 heart, red shake, correct answer shown
       │
5. On final exercise → POST /api/lessons/{id}/complete
   Body: { user_id, xp_gained, hearts_remaining, accuracy }
       │
6. Backend processes:
   ├─ Updates user.xp, user.hearts, user.streak
   ├─ Logs DailyActivity (XP earned today)
   ├─ Increments UserProgress.completed_lessons
   ├─ If skill complete → marks is_completed, unlocks next skill
   ├─ If all Unit 1 skills done → unlocks Unit 2 first skill
   └─ Recalculates all achievement progress
       │
7. Response: { xp, streak, hearts, is_streak_active, next_skill_unlocked }
       │
8. Frontend shows LessonComplete screen with:
   → Confetti animation, XP fanfare, streak update, mascot celebration
```

---

## 🗄️ Database Schema

### Entity-Relationship Overview

```
Course ──1:N──► Unit ──1:N──► Skill ──1:N──► Lesson ──1:N──► Exercise

User ──M:N──► UserProgress (per skill)
 │
 ├──► LeaderboardEntry (1:1)
 ├──► UserAchievement ──► Achievement
 ├──► DailyActivity (per day)
 └──► UserFollow (self-referential M:N)
```

Exercise types: `multiple_choice` | `translate` | `match_pairs` | `fill_in_blank` | `type_answer`

### Table Details

| Table | Key Columns | Description |
|---|---|---|
| `users` | `id`, `username`, `email`, `xp`, `streak`, `hearts`, `gems`, `is_super`, `last_active_date`, `hearts_updated_at` | Learner profile with gamification state. Hearts cap at 5; streak resets if `last_active_date` isn't yesterday. |
| `courses` | `id`, `title`, `language_code`, `flag_icon` | Language course container (e.g., "Spanish" / `es` / 🇪🇸) |
| `units` | `id`, `course_id` (FK), `title`, `description`, `order`, `color` | Thematic unit with a hex color for UI theming (e.g., `#58cc02` green, `#ce82ff` purple) |
| `skills` | `id`, `unit_id` (FK), `title`, `icon_name`, `order`, `total_lessons` | Individual skill node on the path (e.g., "Basics 1", "Travel") |
| `lessons` | `id`, `skill_id` (FK), `title`, `order`, `xp_reward` | Single lesson within a skill, typically containing 5 exercises |
| `exercises` | `id`, `lesson_id` (FK), `type` (enum), `prompt`, `correct_answer`, `options_json` | Individual exercise; `type` is one of the 5 exercise types above |
| `user_progress` | `id`, `user_id` (FK), `skill_id` (FK), `completed_lessons`, `is_unlocked`, `is_completed` | Tracks per-user, per-skill completion. `is_unlocked` controls visibility on the path. |
| `leaderboard_entries` | `id`, `user_id` (FK), `total_xp`, `weekly_xp` | XP rankings for the league leaderboard |
| `achievements` | `id`, `key`, `name`, `description`, `icon`, `color`, `target_value`, `category` | Achievement definitions (e.g., "Wildfire" = 3-day streak, "Champion" = 100 XP) |
| `user_achievements` | `id`, `user_id` (FK), `achievement_id` (FK), `progress`, `is_unlocked`, `unlocked_at` | Per-user achievement progress tracker |
| `daily_activities` | `id`, `user_id` (FK), `activity_date`, `xp_earned`, `lessons_completed` | Daily XP log for the Daily Goal feature |
| `user_follows` | `id`, `follower_id` (FK→users), `following_id` (FK→users) | Social graph for the friends/following system |

---

## 🔌 API Endpoints

### User & Gamification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/profile?user_id=1` | Full user profile: stats, hearts regen calculation, streak status, `daily_xp` |
| `POST` | `/api/user/refill-hearts?user_id=1` | Refill hearts to 5 (costs gems or via Super Duolingo) |
| `POST` | `/api/user/purchase-super?user_id=1` | Activate Super Duolingo subscription (mock) |
| `GET` | `/api/user/achievements?user_id=1` | All achievements with current progress |
| `GET` | `/api/user/following?user_id=1` | Following/followers list with counts |
| `POST` | `/api/user/follow?follower_id=1&following_id=2` | Follow a user |
| `DELETE` | `/api/user/unfollow?follower_id=1&following_id=2` | Unfollow a user |

### Course & Lessons

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses/current?user_id=1` | Full course tree: Course → Units (with color) → Skills (with progress) → Lessons |
| `GET` | `/api/lessons/{lesson_id}/exercises` | Ordered exercises for a specific lesson |
| `POST` | `/api/lessons/{lesson_id}/complete` | Submit lesson completion. Body: `{ user_id, xp_gained, hearts_remaining, accuracy }` |

### Leaderboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leaderboard?limit=20` | Top users sorted by weekly XP |
| `GET` | `/api/leaderboard/league?user_id=1` | League info with dynamic tier (Diamond/Gold/Silver/Bronze) |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root endpoint — API name and version |
| `GET` | `/health` | Health check for deployment monitoring |
| `GET` | `/docs` | Auto-generated Swagger/OpenAPI documentation |

### CRUD Endpoints (`/api/v1`)

Standard REST endpoints are also exposed for: Courses, Units, Skills, Lessons, Exercises, Progress, and Leaderboard.

**Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Local Development & Setup

### Prerequisites

- Python 3.10+ (3.11+ recommended)
- Node.js 18+
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/duolingo-clone.git
cd duolingo-clone
```

### 2. Backend Setup (FastAPI + SQLite)

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# The database auto-seeds on first run.
# To manually (re)seed the database, run:
python -m app.seed

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The database is **automatically seeded** on first startup with:
- 1 Spanish course, 2 units, 6 skills, 18 lessons, 90 exercises
- 1 learner (240 XP, 5-day streak) + 5 leaderboard competitors

### 3. Frontend Setup (Next.js + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start the development server
npm run dev
```

### 4. Open the App

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Quick Verification

```bash
# Test backend health
curl http://localhost:8000/health

# Test course data
curl http://localhost:8000/api/courses/current?user_id=1

# Open frontend
open http://localhost:3000
```

---

## 🎨 Design System

Built to match Duolingo's bold, cheerful, tactile UI:

| Token | Value | Usage |
|---|---|---|
| Green | `#58cc02` / `#46a302` | Primary buttons, correct answers |
| Blue | `#1cb0f6` / `#1899d6` | Secondary, selections |
| Red | `#ff4b4b` / `#ea2b2b` | Danger, wrong answers |
| Gold | `#ffc800` / `#e5b200` | Premium, completed skills |
| Gray | `#e5e5e5`, `#f7f7f7`, `#afafaf` | Borders, backgrounds, disabled |

### Custom 3D Buttons

```css
.btn-3d-green  /* Primary CTA */
.btn-3d-blue   /* Secondary */
.btn-3d-red    /* Danger */
.btn-3d-gray   /* Ghost / Skip */
.btn-3d-gold   /* Premium */
```

All buttons feature `border-b-4` bottom borders with `active:translate-y-1` press effects.

---

## 📁 Project Structure

```
duolingo-clone/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan, router mounts
│   │   ├── database.py          # SQLAlchemy engine, session, Base
│   │   ├── models.py            # 12 ORM models (User, Course, Unit, Skill, ...)
│   │   ├── schemas.py           # 20+ Pydantic request/response schemas
│   │   ├── seed.py              # Database seeder (2 units, 90 exercises)
│   │   └── routers/
│   │       ├── users.py         # Profile, hearts regen, Super purchase
│   │       ├── courses.py       # Course tree with nested progress
│   │       ├── lessons.py       # Exercise fetch, lesson completion, achievements
│   │       ├── leaderboard.py   # Rankings, dynamic league tiers
│   │       ├── achievements.py  # Achievement progress recalculation
│   │       └── social.py        # Follow/unfollow, friends list
│   ├── requirements.txt
│   └── duolingo_clone.db        # Auto-generated SQLite database
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Home — Multi-unit skill tree path
│   │   ├── lesson/[id]/page.tsx # Lesson player with all exercise types
│   │   ├── leaderboard/page.tsx # League leaderboard
│   │   ├── profile/page.tsx     # Profile, achievements, following
│   │   ├── shop/page.tsx        # Gems shop & Super Duolingo
│   │   ├── settings/page.tsx    # Settings placeholder
│   │   ├── layout.tsx           # Root layout with ThemeProvider
│   │   └── globals.css          # Design system (3D buttons, animations)
│   ├── components/
│   │   ├── SkillNode.tsx        # Circular path node with popover
│   │   ├── Sidebar.tsx          # Desktop sidebar navigation
│   │   ├── MobileNav.tsx        # Mobile bottom tab bar
│   │   ├── TopNavBar.tsx        # Hearts, streak, gems, flag display
│   │   ├── FeedbackBar.tsx      # Correct/incorrect animated feedback
│   │   ├── HeartRefillModal.tsx # Heart refill confirmation modal
│   │   ├── ThemeToggle.tsx      # Dark/light mode switcher
│   │   ├── exercises/           # 5 exercise type components
│   │   ├── lesson/              # LessonComplete screen
│   │   └── ui/                  # Button, ProgressBar, DailyGoal, Mascot
│   ├── lib/
│   │   ├── api.ts               # Typed fetch client with error handling
│   │   ├── types.ts             # TypeScript interfaces for all entities
│   │   └── icons.tsx            # SVG icon library for skill nodes
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🔊 Sound Effects

Synthetic audio via the Web Audio API (no external files):

| Function | Sound | Trigger |
|---|---|---|
| `correctPing()` | Ascending chime (C5→E5) | Correct answer |
| `wrongBuzz()` | Sawtooth buzzer | Wrong answer |
| `lessonComplete()` | Rising arpeggio fanfare | Lesson finished |
| `tapClick()` | Quick sine tap | UI option selection |
| `buttonClick()` | Deeper button press | Button interactions |
| `streakCelebration()` | Warm ascending scale | Streak milestones |

---

## 🧠 Assumptions & Product Decisions

### 1. Authentication Bypass

Authentication and user registration were intentionally **not implemented**. A default user (`id=1`, username: `learner`) is seeded automatically. All API endpoints accept a `user_id` query parameter, defaulting to `1`.

**Rationale:** The assignment instructions permitted focusing on the core lesson loop and gamification rather than auth scaffolding. This allowed more time to be invested into exercise interactivity, animations, and the multi-unit progression system.

### 2. Hearts Regeneration Without Cron Jobs

Hearts regenerate at a rate of **1 heart per 4 hours**, calculated **on-demand** rather than via a background scheduler:

```python
# Simplified logic from users.py
elapsed = datetime.utcnow() - user.hearts_updated_at
regen_count = int(elapsed.total_seconds() // (4 * 3600))
if regen_count > 0 and user.hearts < 5:
    user.hearts = min(5, user.hearts + regen_count)
    user.hearts_updated_at = datetime.utcnow()
```

**Rationale:** This approach is stateless, requires zero infrastructure (no Redis, no Celery, no cron), and produces identical results. The calculation runs on every `GET /api/user/profile` call, ensuring hearts are always accurate.

### 3. SQLite as the Database

SQLite was chosen over PostgreSQL for **zero-configuration deployment** and instant local development. The schema is fully normalized and uses SQLAlchemy ORM, making migration to PostgreSQL trivial (a single connection-string change).

### 4. Streak Logic

Streaks increment only once per calendar day. The logic compares `user.last_active_date` against today:
- **Same day:** No change (prevents double-counting)
- **Yesterday:** Streak increments by 1
- **Older:** Streak resets to 1

### 5. Skill Unlock Progression

Skills unlock sequentially within a unit. When all lessons in a skill are completed, the next skill's `is_unlocked` flag is set to `True`. When all skills in Unit 1 are completed, Unit 2's first skill is automatically unlocked.

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server/client component model, file-based routing, optimized builds |
| **Language** | TypeScript 5 | End-to-end type safety across 20+ interfaces |
| **Styling** | Tailwind CSS 4 + Custom CSS | Utility-first with a custom 3D button system and Duolingo design tokens |
| **Animations** | Framer Motion 12 | Physics-based animations for feedback, transitions, confetti, and mascot |
| **Effects** | canvas-confetti | Celebration particles on lesson completion |
| **Dark Mode** | next-themes | System-aware theme switching with a Duolingo dark palette |
| **Backend** | FastAPI 0.115 | Async Python, auto-generated OpenAPI docs, Pydantic validation |
| **ORM** | SQLAlchemy 2.0 | Mapped columns, relationship loading, type-safe queries |
| **Validation** | Pydantic 2.9 | Request/response schema validation with `model_config` |
| **Database** | SQLite | Zero-config, file-based, perfect for assignments and demos |
| **Server** | Uvicorn | ASGI server with hot reload for development |

---

## 📊 Project Stats

| Metric | Count |
|---|---|
| Frontend Components | 20+ |
| Backend API Endpoints | 16 |
| Database Tables | 12 |
| Exercise Types | 5 |
| Course Units | 2 |
| Skills | 6 |
| Lessons | 18 |
| Exercises (seeded) | 90 |
| Achievements | 8 |
| Lines of Code | ~8,000+ |

---

## 📄 License

This project was built as a submission for the **Scaler SDE Fullstack Assignment**. Not intended for commercial use.

---

<p align="center">
  <strong>Built with 💚 by Yashveer Gahlot</strong><br/>
  <em>Scaler SDE Fullstack Assignment — July 2026</em>
</p>