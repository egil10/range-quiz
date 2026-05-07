# Range Quiz

**Ultimate Range Quiz** — a fast, gamified web app for building intuition about real-world numeric bands: valuation multiples, concentration indices (HHI / CR), lab values, physical constants, engineering ratios, climate and macro statistics, and more.

- **Stack:** [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS + [Framer Motion](https://www.framer.com/motion/) + [Lucide](https://lucide.dev/) icons.
- **Content:** about **400** curated **metric seeds** × **9 shuffled variants** each → **~3,600** distinct multiple-choice range questions, generated deterministically from the seed library.
- **Gamification:** streaks with XP bonuses, levels, subtle audio ticks (toggleable), personal bests in `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repository.
3. Framework preset **Next.js**, build command `npm run build`, output default.
4. Deploy.

**Medical entries** are for educational “order-of-magnitude” intuition only, not diagnosis or treatment.

## License

MIT
