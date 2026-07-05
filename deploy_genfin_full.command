#!/bin/bash
cd "$(dirname "$0")"
echo "============================================"
echo " GENFIN Platform — Full Deploy"
echo "============================================"
rm -f .git/HEAD.lock .git/index.lock
git add -A
git commit -m "feat: pre-auth portal, staff ops suite, QR policy certificates

Member portal:
- portal-preauth.html: 4-step pre-auth wizard
- portal.html: quick-action pre-auth link added

Staff operations portal (all new):
- shared/staff.css: staff portal design system
- login-select.html: multi-portal login hub
- superadmin.html: super admin dashboard + staff user management
- staff-claims.html: claims adjudication queue
- staff-hr.html: HR, leave, payroll, recruitment
- staff-finance.html: P&L, collections, payments, AR
- staff-inventory.html: medication stock, orders, pharmacies
- staff-members.html: member search + management

Policy documents with QR verification:
- policy-certificate.html: professional certificate with QR code + SVG art
- verify.html: QR scan landing page — VALID/EXPIRED status
- portal-documents.html: View/Print cert link"

git push origin main
echo ""
echo "Deployed to GitHub → Vercel auto-deploys"
echo "Live: https://genfin-platform.vercel.app"
echo ""
rm -- "$0"
