# GENFIN Platform

Digital platform for GENFIN Medical Aid Fund — Zimbabwe's managed health care partner covering 60,000+ lives.

Developed and operated by [Jonomi Digital](https://jonomi.digital) · Project lead: Dr Washington Kapapiro.

## Structure

| Path | What it is |
|---|---|
| `website/` | Public marketing website (static HTML/CSS/JS, GENFIN Design System tokens) — currently the Vercel deploy root |

## Stack & roadmap

- **Now:** static site on Vercel, Supabase (Postgres) capturing quote requests
- **Next:** Next.js migration of the marketing site; member web app; enterprise admin (React); WhatsApp Business API; biometric verification
- Production member-data workloads are planned for Zimbabwe-resident hosting (ADC Harare) per POTRAZ data-residency requirements — Vercel/Supabase serve the public site and early platform development.

## Local development

Open `website/index.html` in a browser — no build step required.

## Deployment

Pushed commits to `main` auto-deploy via Vercel (root directory: repo root, output directory: `website`).
