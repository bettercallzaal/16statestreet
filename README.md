# Heart of Ellsworth — 16 State Street Makerspace Platform

**Live demo:** [16statestreet.vercel.app](https://16statestreet.vercel.app)

A working prototype of what a digital-first makerspace management platform could look like for [16 State Street](https://www.heartofellsworth.org/) in Ellsworth, Maine — built as a companion piece to a Creative Space Coordinator application at Heart of Ellsworth.

---

## The Problem This Solves

Heart of Ellsworth already does incredible work. They run workshops with real artists like [Karin Otto's gelatin printing classes](https://www.bangordailynews.com/2025/11/28/bdn-maine/heart-of-ellsworth-announces-holiday-workshops-at-16-state-st/) and [Colleen Ross's embroidery sessions](https://www.bangordailynews.com/2025/11/28/bdn-maine/heart-of-ellsworth-announces-holiday-workshops-at-16-state-st/). They host [open studios where artists like Curt Larson, Ellen Lancaster, Rosalie Kell, and Amy Reisman open their doors to the public](https://www.bangordailynews.com/2025/06/04/bdn-maine/artists-of-16-state-street-makerspace-open-their-doors-to-the-public/). They organize [Art of Ellsworth](https://www.heartofellsworth.org/artofellsworth) and Maine Craft Weekend. The makerspace on the second floor is becoming a real creative hub.

But right now, the digital side is fragmented:

- **Event discovery** lives on a [Squarespace calendar page](https://www.heartofellsworth.org/calendar) — a chronological list with no filtering by type, medium, cost, or audience. If you want to find "all free workshops this month" or "what's happening this weekend," you scroll.
- **Workshop registration** goes through a [separate store page](https://www.heartofellsworth.org/store/makerspace) — disconnected from the event listing. You find the event in one place, register in another.
- **Artist visibility** is minimal — the four studio artists got a [single Bangor Daily News article](https://www.bangordailynews.com/2025/06/04/bdn-maine/artists-of-16-state-street-makerspace-open-their-doors-to-the-public/) when they opened their doors, but there's no persistent directory showing who works at the space, what they make, or when their next workshop is.
- **Space scheduling** happens informally — no public-facing calendar showing which rooms are booked, no equipment tracking, no self-service booking requests.
- **Community input** has no structured channel — no way for members to propose workshops, vote on improvements, or signal what they'd attend.
- **Data** isn't aggregated anywhere — no view of which events fill up, which time slots work best, or whether the Print Lab is being used enough to justify its overhead.

None of this is a criticism. It's the reality of every small nonprofit running a creative space. You're doing the hard work of *actually running the programs* and the digital tooling is whatever you can cobble together on a Squarespace plan.

This demo asks: **what if one platform handled all of it?**

---

## What This Platform Demonstrates

Each page answers a specific operational question a Creative Space Coordinator faces:

### `/` — Landing Page
**Question: "What's the identity of this space?"**

A single hub that communicates what 16 State Street *is* — live stats (artists, events, studios, members), upcoming programming, featured artist spotlight, and clear navigation to every section. Replaces the need to click through five different Squarespace pages to understand what the space offers.

### `/events` — Community Events
**Question: "How do people find and sign up for what interests them?"**

44 March events with RSVP, filtering by category/date/cost, and four view modes (list, calendar, table, map). This is the core improvement over the current Squarespace calendar — instead of scrolling a flat list, visitors can:
- Filter to just workshops, just free events, just this weekend
- See capacity and registration status at a glance
- Register directly from the event detail panel
- Switch between list view (browsing), calendar view (planning), and table view (comparing)

Based on [event calendar UX best practices](https://theeventscalendar.com/knowledgebase/best-practices-for-using-event-categories-and-tags-for-filtering/): events are organized into time buckets (today, this week, this weekend) rather than raw dates, categories separate format tags (Workshop, Open Studio) from topic tags (Arts, Music, Kids/Family), and quick filters reduce the most common browsing tasks to one tap.

### `/artists` — Artist & Maker Directory
**Question: "How do you build community around the people, not just the events?"**

10 artist profiles — 3 based on real HoE instructors (Karin Otto, Colleen Ross, Karen Olson) matched to their actual workshop types, plus 7 fictional makers filling out what a full community roster would look like. Each profile shows:
- Role (resident artist, instructor, community member)
- Medium and specialties
- Bio and portfolio links
- Upcoming workshops (auto-linked from the events data)
- Workshop history and membership date

This is something the current web presence completely lacks. When the [studio artists opened their doors in June 2025](https://www.bangordailynews.com/2025/06/04/bdn-maine/artists-of-16-state-street-makerspace-open-their-doors-to-the-public/), the only web presence was a news article. A persistent directory means visitors can discover artists *between* events, see their work, and know when their next class is.

### `/spaces` — Studios & Equipment
**Question: "How do you manage a physical space without double-bookings and lost equipment?"**

5 rooms modeled on the actual layout of 16 State Street:
- **Main Studio** (2nd floor, cap 20) — the primary open studio and workshop space
- **Print Lab** (2nd floor, cap 8) — dedicated printmaking with gel plates and press
- **Fiber Arts Room** (2nd floor, cap 10) — looms, sewing machines, cutting tables
- **Gallery Space** (1st floor, cap 40) — exhibitions, receptions, performances
- **Coworking Nook** (1st floor, 6 desks) — drop-in workspace

Plus 8 pieces of equipment with checkout tracking (screen printing press, sewing machines, pottery wheel, loom, projector, PA system). The weekly calendar shows which rooms are booked when, and the booking form lets people request space without email back-and-forth.

### `/analytics` — Dashboard
**Question: "How do you make programming decisions with data instead of gut feelings?"**

All computed from the actual event data — no fake numbers:
- **Overview**: total events, registrations, fill rates, sold-out count
- **Time slots**: which times of day and which days of the week draw the most attendance
- **Category breakdown**: which types of programming are most popular
- **Capacity utilization**: how well each room is being used
- **Revenue**: free vs. paid split, estimated workshop revenue
- **Top workshops**: ranked by registration numbers

This is the kind of reporting that helps a coordinator argue for budget, justify room investments, and plan next month's programming based on what actually fills up.

### `/ideas` — Community Idea Board
**Question: "How do you give the community a voice in programming?"**

A structured channel for community input — workshop proposals, improvement suggestions, partnership ideas — with voting to surface what people actually want. Pre-seeded with realistic examples:
- "Pottery Wheel Workshop Series" (workshop proposal)
- "Install Better Ventilation in Print Lab" (facility improvement)
- "Partner with MDI Biological Lab for Science Art" (partnership idea)
- "Monthly Maker Market on Main Street" (event concept)

Better than a suggestion box, a Facebook poll, or hoping people email you.

---

## How This Complements What Already Exists

This isn't meant to replace heartofellsworth.org — that site handles the broader organizational mission: downtown revitalization, [historic preservation](https://www.heartofellsworth.org/historic-preservation), [entrepreneur resources](https://www.heartofellsworth.org/entrepreneur-resource-hub), newsletters, the store, and institutional communication. That's the right tool for the Main Street America work.

This platform focuses specifically on **the makerspace at 16 State Street** — the operational layer for managing creative programming, the people who make it happen, and the physical space they share. Think of it as the difference between a city's official website and the community center's booking system.

| Currently | With This Platform |
|-----------|-------------------|
| Events on a Squarespace calendar page — chronological, no filtering | Events with category/date/cost filters, multiple views, inline RSVP |
| Registration through a separate store page | Registration directly in the event detail, capacity tracking, waitlists |
| Artist visibility through occasional press coverage | Persistent artist directory with profiles, workshop history, portfolio links |
| Room scheduling through informal coordination | Public-facing room calendar, self-service booking requests |
| No equipment tracking | Equipment checkout system with status and return dates |
| No aggregated programming data | Analytics dashboard computed from real event data |
| Community input through ad-hoc channels | Structured idea board with categories and voting |

---

## Future Build Ideas

### Near-term (things this demo is ready to support)
- **Live data connection** — replace static JSON with the existing [Heart of Ellsworth community calendar](https://www.heartofellsworth.org/calendar) feed or Google Sheets backend. The data layer is already abstracted behind a `useEvents` hook.
- **Real artist profiles** — add the actual studio artists (Curt Larson, Ellen Lancaster, Rosalie Kell, Amy Reisman) alongside instructors. Photo uploads, portfolio galleries, links to personal sites.
- **Email notifications** — confirmation emails on RSVP, reminders 24 hours before workshops, waitlist notifications when spots open up.
- **Improved event filters** — the current filtering works but isn't intuitive enough. Better UX patterns: larger touch targets for filter pills, a clear "active filters" summary bar, smarter defaults (show "this week" by default instead of all events), and a "happening now" real-time mode.
- **Printable schedules** — export a week's events as a PDF to post on the physical bulletin board at 16 State Street.

### Medium-term (features that would make this production-ready)
- **User accounts** — the Supabase auth layer already exists in the codebase. Enable it and people get persistent RSVPs, saved favorites, and friend connections across devices.
- **Payment integration** — connect Stripe for paid workshop registration. Show cost in the event card, process payment at RSVP time, auto-update capacity.
- **Instructor dashboard** — let workshop leaders see their own registrations, send messages to attendees, mark attendance, and manage waitlists.
- **Equipment reservations** — tie equipment checkout to specific bookings ("I need the screen printing press for my Saturday workshop") with conflict detection.
- **Recurring event support** — Open Studio every Sunday, Coworking every weekday — define once, generate automatically.
- **Accessibility audit** — screen reader testing, keyboard navigation improvements, WCAG 2.1 AA compliance across all interactive elements.

### Long-term (where this could go)
- **Multi-space support** — if Heart of Ellsworth's programming expands beyond 16 State Street (partner venues, outdoor spaces, pop-ups), the platform could manage multiple locations from one dashboard.
- **Membership tiers** — free community access, studio memberships with booking privileges, instructor accounts with management tools.
- **Public API** — let the City of Ellsworth's [community calendar](https://www.ellsworthmaine.gov/city-of-ellsworth-and-heart-of-ellsworth-launch-new-community-events-calendar/) pull events automatically instead of duplicating listings.
- **Grant reporting** — auto-generate attendance summaries, demographic estimates, and utilization reports for funders. Most arts nonprofits spend hours compiling this manually.
- **Mobile app wrapper** — the responsive web app is already phone-friendly. A thin native wrapper (Capacitor/Expo) would add push notifications and home screen presence.
- **Integration with existing tools** — sync with Squarespace store for payment, pull from Google Calendar for instructor availability, export to Mailchimp for newsletter segmentation by interest.

---

## The Data Is Real (Mostly)

- **44 events** based on actual March 2026 programming at Heart of Ellsworth and downtown Ellsworth venues — open studios, gelatin printing, embroidery, papermaking, live music, community meetings, kids workshops, art walks
- **3 real instructors** (Karin Otto, Colleen Ross, Karen Olson) matched to their actual workshop types and teaching styles
- **7 fictional artists** filling out what a full community roster looks like — ceramics, screen printing, painting, woodworking, photography, digital fabrication, textile dyeing
- **5 spaces** modeled on the real building — second floor studios, first floor gallery, coworking nook
- **18 bookings** derived from the actual event schedule, mapped to appropriate rooms

Everything runs offline with localStorage and static JSON. No accounts, no API keys, no backend required.

---

## Technical Details

### Stack
- **Next.js 16** (App Router, Turbopack) — React framework with file-based routing
- **TypeScript** — type safety across 50+ components
- **Tailwind CSS 4** — utility-first styling, dark theme, responsive
- **localStorage** — client-side persistence for RSVPs, bookings, ideas, votes, equipment
- **Static JSON** — demo data that works anywhere with zero infrastructure

### Architecture
```
src/
  app/                     # 6 routes
    page.tsx               # Landing page (/)
    events/page.tsx        # Events browser (/events)
    artists/page.tsx       # Artist directory (/artists)
    spaces/page.tsx        # Room booking (/spaces)
    analytics/page.tsx     # Dashboard (/analytics)
    ideas/page.tsx         # Idea board (/ideas)
  components/              # 50+ React components
    LandingPage.tsx        # Hero, stats, quick links
    EventApp.tsx           # Full event platform
    ArtistDirectory.tsx    # Artist list + medium filter
    ArtistCard.tsx         # Artist card
    ArtistDetail.tsx       # Artist slide-over panel
    SpaceBooking.tsx       # Weekly calendar + booking form
    EquipmentList.tsx      # Equipment checkout
    AnalyticsDashboard.tsx # Stats + pure CSS charts
    IdeaBoard.tsx          # Submission form + voting
    NavBar.tsx             # Site-wide navigation
    PageShell.tsx          # Shared page wrapper
  data/                    # Static JSON
    demo-events.json       # 44 events
    demo-artists.json      # 10 artist profiles
    demo-spaces.json       # 5 rooms + 8 equipment
    demo-bookings.json     # 18 sample bookings
  lib/                     # Types, utilities, constants
  hooks/                   # 15 custom React hooks
```

### Running Locally
```bash
git clone https://github.com/bettercallzaal/16statestreet.git
cd 16statestreet
npm install
echo "NEXT_PUBLIC_DEMO_MODE=true" > .env.local
npm run dev
```

### Deploying
Hosted on [Vercel](https://vercel.com) with automatic deploys from `main`. One environment variable: `NEXT_PUBLIC_DEMO_MODE=true`.

---

Built with care for Ellsworth's creative community.
