# GitHub OAuth Authentication

Hawk supports GitHub OAuth for easy sign-in and sign-up. This guide walks you through enabling and configuring GitHub OAuth.

## Quick Start (TL;DR)

1. Create a GitHub OAuth App (takes ~2 minutes)
2. Copy your Client ID and Client Secret
3. Set `NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="true"` in your `.env` file
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to your `.env` file
5. Restart your server
6. GitHub OAuth button will appear on sign-in and sign-up pages

---

## 1) Create a GitHub OAuth App

### Step-by-step instructions:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"** or navigate to **"OAuth Apps"** → **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `Hawk` (or your preferred name)
   - **Homepage URL**: 
     - Development: `http://localhost:3060`
     - Production: `https://your-domain.com`
   - **Application description**: (Optional) `Self-hosted monitoring platform`
   - **Authorization callback URL**: 
     - Development: `http://localhost:3060/api/auth/callback/github`
     - Production: `https://your-domain.com/api/auth/callback/github`
4. Click **"Register application"**

### Important Notes:

- The callback URL must match exactly (including the protocol `http://` or `https://`)
- For production deployments, you'll need to create a separate OAuth App or update the URLs
- You can have multiple callback URLs by creating separate OAuth Apps for different environments

## 2) Get Your Credentials

After creating the OAuth App:

1. You'll see your **Client ID** on the app details page
2. Click **"Generate a new client secret"** to create a **Client Secret**
3. **Important**: Copy the client secret immediately - you won't be able to see it again

## 3) Configure Hawk

Update your `.env` or `.env.local` file with the following:

```dotenv
# Enable GitHub OAuth
NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="true"

# GitHub OAuth Credentials
GITHUB_CLIENT_ID="your_github_client_id_here"
GITHUB_CLIENT_SECRET="your_github_client_secret_here"
```

### Environment Variables Explained:

- `NEXT_PUBLIC_ENABLE_GITHUB_OAUTH`: Set to `"true"` to enable GitHub OAuth, `"false"` to disable (defaults to `"false"`)
- `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret

## 4) Restart Your Application

After updating the environment variables, restart your development server:

```bash
# If using bun
bun run dev

# If using npm
npm run dev
```

For production deployments, redeploy your application with the updated environment variables.

## 5) Verify It Works

1. Navigate to the sign-in page (`/sign-in`)
2. You should see a **"Continue with GitHub"** button
3. Click the button to test the OAuth flow
4. You'll be redirected to GitHub for authorization
5. After authorization, you'll be redirected back to your Hawk dashboard

## Features

- **Seamless authentication**: Users can sign in with their GitHub account
- **Automatic account creation**: First-time users automatically get an account created
- **Secure**: Uses OAuth 2.0 protocol for authentication
- **Optional**: Can be enabled/disabled via environment variable
- **No code changes required**: Just configure environment variables

## Disabling GitHub OAuth

To disable GitHub OAuth:

1. Set `NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="false"` in your `.env` file
2. Restart your server
3. The GitHub OAuth button will no longer appear

Alternatively, you can completely remove the GitHub OAuth environment variables:

```dotenv
# Remove or comment out these lines:
# NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="true"
# GITHUB_CLIENT_ID="..."
# GITHUB_CLIENT_SECRET="..."
```

## Production Deployment

For production deployments:

1. Create a new GitHub OAuth App with your production URLs
2. Set the environment variables on your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Heroku: Config Vars
   - Railway: Variables
   - etc.
3. Make sure to set all three variables:
   - `NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="true"`
   - `GITHUB_CLIENT_ID="your_production_client_id"`
   - `GITHUB_CLIENT_SECRET="your_production_client_secret"`

## Troubleshooting

### "Continue with GitHub" button doesn't appear

- Check that `NEXT_PUBLIC_ENABLE_GITHUB_OAUTH="true"` is set in your `.env` file
- Restart your development server
- Check browser console for any errors

### OAuth callback fails

- Verify your callback URL matches exactly: `{BASE_URL}/api/auth/callback/github`
- Check that your GitHub OAuth App's callback URL is configured correctly
- Ensure `BASE_URL` environment variable is set correctly

### "Invalid client" error

- Verify your `GITHUB_CLIENT_ID` is correct
- Make sure you're using the correct OAuth App (development vs production)

### "Invalid client secret" error

- Regenerate a new client secret in GitHub
- Update `GITHUB_CLIENT_SECRET` in your environment variables
- Restart your server

## Security Best Practices

1. **Never commit secrets**: Keep your `.env` file in `.gitignore`
2. **Use different OAuth Apps**: Create separate OAuth Apps for development and production
3. **Rotate secrets regularly**: Periodically regenerate your client secret
4. **Restrict callback URLs**: Only add callback URLs you actually use
5. **Monitor access**: Check your GitHub OAuth App's usage in the GitHub settings

## FAQ

### Can I use both email/password and GitHub OAuth?

Yes! Hawk supports both authentication methods simultaneously. Users can choose their preferred method.

### Can users link their GitHub account to an existing email/password account?

Currently, these are treated as separate accounts. Account linking may be added in future versions.

### Can I add other OAuth providers (Google, Twitter, etc.)?

The implementation uses better-auth which supports multiple OAuth providers. You can extend the configuration in `src/lib/auth.ts` to add more providers.

### Do I need to enable GitHub OAuth?

No, it's completely optional. Email/password authentication works independently.

## References

- [GitHub OAuth Apps Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [better-auth Documentation](https://www.better-auth.com/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
