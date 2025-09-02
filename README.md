This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Google Login and Maps setup

This project uses Google Identity Services for Login with Google and Google Maps JavaScript + Places for location picking on the cart page.

1) Copy `.env.example` to `.env.local` and fill the values:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

2) In the Google Cloud Console:
 - For Google Identity: create an OAuth 2.0 Client ID (Web), add your local and prod origins to Authorized JavaScript origins.
 - For Maps: enable Maps JavaScript API and Places API; restrict the key to your domain(s).

3) Restart the dev server after changing env vars.

Once configured, the Google button appears on `/login`, and the Cart map modal supports place search and selection.


You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses a single global font: Lexend (via `@fontsource/lexend/variable.css`). The base `font-sans` maps to Lexend so all text renders consistently.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
