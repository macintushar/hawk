<p align="center">
   <img src="./public/logo-full.svg" alt="Hawk" width="240" />
   <h3 align="center"><i>Monitoring for your stack, within your stack.</i></h3>
</p>

> **Note**: Hawk is still in development. Features may change or break.

Hawk is an open‑source, self‑hosted monitoring platform. Track uptime and performance for your services, get alerted on incidents, and publish beautiful public status pages, all in one place.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/macintushar/hawk)

## Features

- **Monitors**: Create HTTP monitors with custom CRON schedules and failure thresholds
- **Incidents**: Automatic incident creation/resolution based on consecutive failures
- **Notifications (Slack)**: Send alerts to Slack via Incoming Webhooks on down/up events
- **Public status pages**: Share live uptime charts and incident history with your users
- **Authentication**: Secure sign‑in/sign‑up flows with email/password and optional GitHub OAuth
- **Dashboard**: Overview cards, recent activity, and quick actions for fast navigation

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)

### Installation

```bash
# Clone the repository
git clone https://github.com/macintushar/hawk.git
cd hawk

# Install dependencies
bun install
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```dotenv
DATABASE_URL="libsql://<your-turso-database-url>"
DATABASE_TOKEN="<your-turso-auth-token>"
BETTER_AUTH_SECRET="<secure-random-string>"
BASE_URL="http://localhost:3000"
NODE_ENV="development"

# GitHub OAuth (optional)
# Set to "true" to enable GitHub OAuth
NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="false"
GITHUB_CLIENT_ID="<your-github-oauth-app-client-id>"
GITHUB_CLIENT_SECRET="<your-github-oauth-app-client-secret>"
```

> _Note: All server variables are validated at build time via `@t3-oss/env-nextjs`._

#### Setting up GitHub OAuth (Optional)

If you want to enable GitHub OAuth for sign-in/sign-up:

1. Create a GitHub OAuth App:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Set **Application name**: `Hawk` (or your preferred name)
   - Set **Homepage URL**: `http://localhost:3060` (or your production URL)
   - Set **Authorization callback URL**: `http://localhost:3060/api/auth/callback/github` (update the base URL for production)
   - Click "Register application"

2. Copy the credentials:
   - Copy the **Client ID**
   - Generate and copy a **Client Secret**

3. Update your `.env.local` file:
   ```dotenv
   NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="true"
   GITHUB_CLIENT_ID="<your-client-id>"
   GITHUB_CLIENT_SECRET="<your-client-secret>"
   ```

4. Restart your development server

The GitHub OAuth button will now appear on the sign-in and sign-up pages.

### Database Setup & Migrations

Apply migrations:

```bash
# Apply pending migrations
bun db:migrate

# Optional: open Drizzle Studio
bun db:studio
```

### Run the App

```bash
# Start the dev server
bun run dev

# Build for production
bun run build
```

The app will be available at `http://localhost:3060` in development.

## Usage

- **Create monitors**: Name, URL, CRON schedule, and failure threshold
- **Receive alerts**: Configure Slack webhooks in the Notifications screen
- **Publish status pages**: Group monitors and share a public URL with your users

See `docs/SLACK.md` for a step‑by‑step guide to configuring Slack Incoming Webhooks.

## Deployment

- One‑click deploy to Vercel using the button above
- Set the same environment variables on Vercel (including `BASE_URL` pointing to your deployed URL)
- Run migrations as part of your deployment workflow if needed

## Tech Stack / Libraries

- Next.js (App Router) + TypeScript
- tRPC 11 + React Query 5
- Drizzle ORM + Turso (libSQL) / SQLite (local)
- Tailwind CSS, shadcn/ui, Radix UI
- Recharts
- Better‑Auth, Zod, Day.js

## Contributing

Contributions are welcome! Please fork the repository and open a pull request. For larger changes, consider opening an issue first to discuss your proposal.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT © [Tushar Selvakumar](https://github.com/macintushar)

## Contact

Questions or suggestions? Open an issue or reach out on GitHub.

## Contributors

<a href="https://github.com/macintushar/hawk/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=macintushar/hawk" />
</a>
