# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BetPirate is a Remix-based web application for managing Superbowl proposition betting pools. Users submit picks for propositions (over/under, win/loss, etc.), pay an entry fee, and compete on a leaderboard. Admins manage sheets, propositions, and track answers.

## Commands

### Development
```sh
npm run dev              # Start dev server with hot reloading
npm run build            # Build for production
npm start                # Run production build
npm run typecheck        # Run TypeScript type checking
```

### Testing
```sh
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
```

For React component tests, include `/** @jest-environment jsdom */` docblock at the top of the file.

### Database (Prisma)

**Local development:**
```sh
npx prisma db push       # Apply schema changes to local DB (development only)
npx prisma migrate dev   # Create and apply a migration
npx prisma studio        # Open database GUI
tsx prisma/seed.ts       # Seed the database
```

**Production:**
```sh
npx prisma migrate deploy  # Apply migrations in production
```

**Hosted database (Fly.io):**
```sh
fly proxy 5432 -a betpirate-db  # Proxy to remote DB for local connections
```

### Deployment
```sh
fly deploy               # Deploy to Fly.io
```

## Architecture

### Tech Stack
- **Framework**: Remix (v2.5+) with React 18
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Custom phone-number-based authentication using remix-auth
- **SMS**: Twilio integration for phone verification
- **Styling**: Tailwind CSS + DaisyUI
- **Deployment**: Fly.io
- **Node**: >= 20.11.0

### Directory Structure

```
app/
├── components/        # Reusable React components
├── lib/              # Custom libraries (e.g., remix-auth-phone-number)
├── models/           # Database access layer (*.server.ts files)
├── routes/           # Remix file-based routes
├── services/         # Business logic (auth, SMS, session)
├── styles/           # Global styles (Tailwind)
├── utils/            # Utility functions
└── root.tsx          # App shell and root loader

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Database seeding script
```

### Data Model

Core entities:
- **Sailor**: User account (phone-based authentication, admin flag)
- **Sheet**: A betting event (e.g., "Superbowl LVIII") with status (DRAFT/OPEN/CLOSED)
- **Proposition**: A single bet within a sheet (e.g., "Will team X score over 24.5 points?")
- **PropositionOption**: Answer choices for a proposition
- **Submission**: A user's complete set of picks for a sheet (includes tiebreaker, payment status)
- **PropositionSelection**: Links a submission to the user's chosen option for each proposition

### Authentication Flow

1. Uses custom `PhoneNumberStrategy` in `app/lib/remix-auth-phone-number/`
2. Phone number is validated as Canadian format using `libphonenumber-js`
3. On login, user is created if they don't exist (auto-registration)
4. Session stored using `remix-auth` with sailor ID
5. Root loader (`app/root.tsx`) fetches authenticated sailor for all routes

### Route Organization

Remix uses file-based routing. Key route patterns:

- `sheets.$sheetId._index` - View a sheet (landing page for a betting event)
- `sheets.$sheetId.submissions.new` - Submit picks for a sheet
- `sheets.$sheetId.submissions.$submissionId` - View a specific submission
- `sheets.$sheetId.leaders` - Leaderboard for a sheet
- `sheets.$sheetId.admin` - Admin controls for managing sheet
- `sheets.$sheetId.propositions.$propositionId.answer` - Set correct answer (admin only)
- `dashboard` - User dashboard with live results
- `onboard._index` - User onboarding flow
- `login` - Phone-based login

Routes are organized in folders when they have nested components or related logic.

### Models Pattern

Files in `app/models/` follow the pattern `[entity].server.ts` and contain Prisma queries. All database access goes through these model files, not directly from routes.

Example functions:
- `readSheet(id)` - Fetch sheet with propositions and options
- `readSheetWithSubmissions(id)` - Fetch sheet with all user submissions
- `readSheetLeaders(sheetId)` - Raw SQL query to calculate leaderboard rankings
- `readSheetDashboard(sheetId)` - Combines leader data with selections for live dashboard

### Services Layer

- `auth.server.ts` - Exports `authenticator` instance with phone number strategy
- `session.server.ts` - Session storage configuration
- `sms.server.ts` / `twilio.server.ts` - SMS sending abstraction
- `dummysms.server.ts` - Mock SMS service for development

### TypeScript Configuration

- Path alias `~/*` maps to `./app/*`
- Use `~` prefix for all imports from the app directory (e.g., `import { db } from "~/utils/db.server"`)
- Tests excluded from compilation (in `**/__tests__/` directories)

### Environment Variables

Required in `.env`:
```
DATABASE_URL=          # PostgreSQL connection string
SESSION_SECRET=        # Secret for session encryption
TWILIO_ACCOUNT_SID=    # Twilio account SID (for SMS)
TWILIO_AUTH_TOKEN=     # Twilio auth token
```

### Leaderboard Calculation

Leaderboard rankings are calculated via raw SQL in `readSheetLeaders()` and `readSheetDashboard()`. The query:
1. Joins submissions → selections → options → propositions
2. Counts correct answers where `selection.optionId = proposition.answerId`
3. Ranks users by correct count (using SQL `RANK()` function)
4. Returns sailor username, submission ID, correct count, and ranking

This is complex logic that requires understanding the join relationships across 5 tables.

### Admin Workflow

1. Create a new Sheet (in DRAFT status)
2. Add Propositions to the sheet with multiple options each
3. Set sheet to OPEN status to allow submissions
4. Users submit picks while sheet is OPEN
5. Set sheet to CLOSED when betting window closes
6. Admin marks correct answers for each proposition
7. Leaderboard automatically updates based on correct answers
8. Admin manually marks submissions as paid when receiving payment

### Common Patterns

- All server-side code files use `.server.ts` suffix
- Database client imported from `~/utils/db.server`
- Forms use `@conform-to/react` + `@conform-to/zod` for validation
- SMS sending abstracted through service layer (allows dummy implementation for dev)
- Test files live alongside implementation files in `__tests__/` directories
