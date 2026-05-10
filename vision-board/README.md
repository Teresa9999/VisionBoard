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
| `AIPING_API_KEY` | AI Ping API key. Used server-side by `/api/generate-image` to call the image generation API. |
| `AIPING_BASE_URL` | AI Ping API base URL. Defaults to `https://aiping.cn/api/v1`. |
| `LOCAL_DEMO` | Keep as `true` for the public demo flow without user auth. |
| `NEXT_PUBLIC_LOCAL_DEMO` | Keep as `true` for the public demo flow without user auth. |
| `EAZO_PRIVATE_KEY` | Your Eazo developer private key (hex, 64 chars). Used server-side to decrypt the user session token. |

You can generate a keypair in the Eazo developer settings. Never expose the private key to the browser.

## Learn More

- [Eazo Documentation](https://docs.eazo.ai)
- [Next.js Documentation](https://nextjs.org/docs)

## Deploy on Vercel

Deploy the `vision-board` directory as the Vercel project root. Configure these environment variables in Vercel Project Settings:

```text
LOCAL_DEMO=true
NEXT_PUBLIC_LOCAL_DEMO=true
AIPING_API_KEY=your_aiping_key
AIPING_BASE_URL=https://aiping.cn/api/v1
```

The browser calls `/api/generate-image` on your own Vercel domain. That server-side function calls AI Ping with `AIPING_API_KEY`, so the key is never exposed to users.
