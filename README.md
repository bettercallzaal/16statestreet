# Heart of Ellsworth — 16 State Street Makerspace Platform

A working demo of what a fully digital-first makerspace management platform could look like for **16 State Street** in Ellsworth, Maine. Built as a companion piece to a Creative Space Coordinator application at Heart of Ellsworth.

## Why This Exists

16 State Street is becoming Ellsworth's creative hub — a makerspace, gallery, coworking space, and community gathering point. Running a space like that well means juggling event programming, artist relationships, room scheduling, equipment tracking, and community engagement all at once.

Most creative spaces cobble this together with spreadsheets, Facebook groups, and paper sign-up sheets. This demo asks: **what if one platform handled all of it?**

The goal isn't to ship production software — it's to show the kind of thinking a Creative Space Coordinator brings to the role:

- **How do you organize 44+ monthly events** so the community can actually find what they're looking for?
- **How do you showcase artists and makers** in a way that builds real community, not just a list of names?
- **How do you manage shared studios and equipment** without double-bookings and lost tools?
- **How do you make data-driven decisions** about programming, capacity, and revenue?
- **How do you give the community a voice** in what happens at their creative space?

Each page in the platform answers one of those questions.

## What's In the Demo

| Page | What It Shows | Why It Matters |
|------|---------------|----------------|
| **Landing** (`/`) | Hero, live stats, upcoming events, featured artist, quick links | First impression — shows the space has a clear identity and active programming |
| **Events** (`/events`) | Full event browser with RSVP, filtering, calendar/list/table views | The core job — managing and promoting 44 March events with registration tracking |
| **Artists** (`/artists`) | 10 artist/maker profiles with medium filtering and detail panels | Community building — residents, instructors, and community members all visible |
| **Spaces** (`/spaces`) | Weekly room calendar, booking form, equipment checkout | Space management — 5 rooms, 8 pieces of equipment, no scheduling conflicts |
| **Analytics** (`/analytics`) | Attendance, time slots, categories, capacity, revenue | Data-driven decisions — pure CSS charts computed from real event data |
| **Ideas** (`/ideas`) | Community idea submission with voting | Community voice — workshops, improvements, partnerships proposed and ranked |

### The Data Is Real (Mostly)

- **44 events** based on actual March 2026 programming at Heart of Ellsworth and downtown Ellsworth venues
- **3 real instructors** (Karin Otto, Colleen Ross, Karen Olson) matched to their actual workshop types, plus 7 fictional artists filling out the community
- **5 spaces** modeled on the actual layout of 16 State Street (Main Studio, Print Lab, Fiber Arts Room, Gallery, Coworking Nook)
- **18 bookings** derived from the real event schedule, mapped to appropriate rooms

Everything runs offline with localStorage and static JSON. No accounts, no API keys, no backend required.

## Technical Choices

**Next.js 16 + TypeScript + Tailwind CSS** — modern React stack that's fast to build in and deploys anywhere. The app router gives us clean URL-based navigation between the six sections.

**Static JSON + localStorage** — no backend means the demo works forever without maintenance. RSVP data, bookings, equipment checkouts, and idea votes all persist in the browser. Refresh the page and your data is still there.

**Pure CSS visualizations** — the analytics dashboard uses zero chart libraries. Every bar chart, progress bar, and stat card is just Tailwind utility classes and inline widths. Keeps the bundle small and proves you don't always need D3.

**Mobile-first dark theme** — the slate/rose color scheme works on phones, tablets, and desktops. The NavBar collapses to a hamburger menu. Every interactive element is touch-friendly.

**Component architecture** — 18 new components built on top of the existing event platform. Shared patterns: slide-over panels (artists reuse the event detail pattern), card grids, filter pills, form modals. Consistent enough to feel like one product.

## Running Locally

```bash
git clone https://github.com/bettercallzaal/16statestreet.git
cd 16statestreet
npm install
echo "NEXT_PUBLIC_DEMO_MODE=true" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no API keys needed.

## Project Structure

```
src/
  app/                    # Next.js routes
    page.tsx              # Landing page (/)
    events/page.tsx       # Events browser (/events)
    artists/page.tsx      # Artist directory (/artists)
    spaces/page.tsx       # Room booking (/spaces)
    analytics/page.tsx    # Dashboard (/analytics)
    ideas/page.tsx        # Idea board (/ideas)
  components/             # React components
    LandingPage.tsx       # Hero, stats, quick links
    EventApp.tsx          # Full event platform (existing)
    ArtistDirectory.tsx   # Artist list + filter
    ArtistCard.tsx        # Individual artist card
    ArtistDetail.tsx      # Artist slide-over panel
    SpaceBooking.tsx      # Weekly calendar + booking form
    EquipmentList.tsx     # Equipment checkout grid
    AnalyticsDashboard.tsx # Stats + CSS charts
    IdeaBoard.tsx         # Submission form + voting
    NavBar.tsx            # Site-wide navigation
    PageShell.tsx         # Shared page wrapper
  data/                   # Static JSON
    demo-events.json      # 44 March events
    demo-artists.json     # 10 artist profiles
    demo-spaces.json      # 5 rooms + 8 equipment items
    demo-bookings.json    # 18 sample bookings
  lib/                    # Utilities, types, constants
```

## Deploying

Hosted on Vercel with automatic deploys from `main`. One environment variable:

```
NEXT_PUBLIC_DEMO_MODE=true
```

---

Built with care for Ellsworth's creative community.
