# Getting Started with Hawk

Welcome to Hawk! This guide will help you get started with setting up and running your own Hawk monitoring instance.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh) - JavaScript runtime and package manager
- [Node.js](https://nodejs.org/) (v18 or later)
- A [Turso](https://turso.tech) database account (or local SQLite for development)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/macintushar/hawk.git
   cd hawk
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```dotenv
DATABASE_URL="libsql://<your-turso-database-url>"
DATABASE_TOKEN="<your-turso-auth-token>"
BETTER_AUTH_SECRET="<secure-random-string>"
BASE_URL="http://localhost:3060"
NODE_ENV="development"

# GitHub OAuth (optional)
# Set to "true" to enable GitHub OAuth
NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="false"
GITHUB_CLIENT_ID="<your-github-oauth-app-client-id>"
GITHUB_CLIENT_SECRET="<your-github-oauth-app-client-secret>"
```

> **Note**: All server variables are validated at build time via `@t3-oss/env-nextjs`.

### Required Variables

- **DATABASE_URL**: Your Turso database connection string. For local development, you can use `file:local.db`
- **DATABASE_TOKEN**: Your Turso auth token (not needed for local SQLite)
- **BETTER_AUTH_SECRET**: A secure random string for authentication. Generate one using `openssl rand -base64 32`
- **BASE_URL**: The base URL where your app is hosted (use `http://localhost:3060` for development)
- **NODE_ENV**: Set to `development` for local development, `production` for deployment

### Optional Variables

See the [GitHub OAuth Guide](./GITHUB_OAUTH.md) for optional GitHub authentication setup.

## Database Setup & Migrations

Apply database migrations:

```bash
# Apply pending migrations
bun db:migrate

# Optional: open Drizzle Studio to view your database
bun db:studio
```

## Run the App

```bash
# Start the development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

The app will be available at `http://localhost:3060` in development.

## First Steps

1. **Create an account**: Navigate to `/sign-up` and create your first user account
2. **Set up monitors**: Go to Monitors and create your first HTTP monitor
3. **Configure notifications**: Set up Slack webhooks in the Notifications section
4. **Create a status page**: Group your monitors and share with your users

## Next Steps

- [Configure Slack Notifications](./SLACK.md)
- [Enable GitHub OAuth](./GITHUB_OAUTH.md)

## Deployment

For production deployment instructions, see the main [README](../README.md#deployment).

## Troubleshooting

### Port already in use

If port 3060 is already in use, you can change it in `package.json`:

```json
"dev": "next dev --turbo --port 3000"
```

### Database connection issues

- For local development, use `DATABASE_URL="file:local.db"` and omit `DATABASE_TOKEN`
- For Turso, ensure your database URL starts with `libsql://` and you have the correct auth token

### Build errors

Run type checking to see specific errors:

```bash
bun run typecheck
```

## Need Help?

- Check out the [GitHub Issues](https://github.com/macintushar/hawk/issues)
- Read the documentation
- Join the community discussions
