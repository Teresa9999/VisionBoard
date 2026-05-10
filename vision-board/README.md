# Vision Board

A standalone local Next.js demo for a vision-board journey. The current flow runs without login, Eazo host embedding, or a PostgreSQL connection; it stores demo sessions in server memory so the full prototype can be opened directly in a browser.

## Getting Started

Install dependencies:

```bash
npm install
```

If you prefer Bun:

```bash
bun install
```

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app defaults to standalone demo mode. Set `LOCAL_DEMO=false` and `NEXT_PUBLIC_LOCAL_DEMO=false` only if you intentionally want to re-enable the old hosted auth path.

## Environment Variables

Copy `.env.example` to `.env` and fill in your private key:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `EAZO_PRIVATE_KEY` | Your Eazo developer private key (hex, 64 chars). Used server-side to decrypt the user session token. |

You can generate a keypair in the Eazo developer settings. Never expose the private key to the browser.

## Learn More

- [Eazo Documentation](https://docs.eazo.ai)
- [Next.js Documentation](https://nextjs.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
