#!/bin/bash
cd "$(dirname "$0")"
echo "============================================"
echo " GENFIN — Deploy countdown + auto-hold"
echo "============================================"
git push origin main
echo ""
echo "Pushed to GitHub → Vercel auto-deploys"
echo "Live: https://genfin-platform.vercel.app"
echo "Site locks: Tue 21 Jul 2026, 21:00 CAT"
echo ""
read -p "Press Enter to close..."
