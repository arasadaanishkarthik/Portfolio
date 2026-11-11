Hi This is Anish Karthik 
This is my Portfolio
LIVE WEBSITE: https://arasadaanishkarthik.github.io/Portfolio/

## Contact form setup

Install dependencies with `npm install`. For local Vercel testing, create `.env.local` from `.env.example`, set `EMAIL_USER` and `EMAIL_PASS` to a Gmail address and Gmail App Password, then run `npx vercel dev`.

The contact API is available at `POST /api/contact`. The form sends name, email, subject, and message to the configured `EMAIL_USER`. Vercel production requires the persistent rate limiter, so configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; without them, local development uses a temporary in-memory limit.

On Vercel, use the repository root with the Other framework preset, add the environment variables in Project Settings > Environment Variables, and redeploy after saving them. Do not commit `.env.local` or Gmail credentials.
