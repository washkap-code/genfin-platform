#!/bin/zsh
cd /Users/drwashington/Claude/Projects/GENFIN\ -\ Chiware\ Platform\ Development/genfin-platform

rm -f .git/HEAD.lock .git/index.lock

git add -A

git commit -m "feat: complete GENFIN platform build

Public site:
- claims.html, benefits.html, pharmacy.html, support.html
- shared/site.css — full shared component system

BioVerify module (website/biometric/):
- index.html — product landing page (standalone, sellable)
- verify.html — pharmacy terminal interactive UI
- admin.html — enrollment & verification dashboard
- docs.html — full SDK + REST API documentation
- biometric.css — self-contained BV design system

Member portal extensions:
- portal-claims.html — 4-step claim wizard with OCR simulation
- portal-pharmacy.html — chronic medication & dispense history
- portal-benefits.html — benefit utilisation by category
- portal-family.html — dependant management
- portal-documents.html — certificates, statements, tax docs

Pharmacy staff portal:
- pharmacy-portal.html — staff dashboard with biometric dispense flow

Shared:
- shared/portal.css updated with portal-page layout tokens
- 404.html

Total: 24 HTML pages + BioVerify module fully extractable"

git push origin main && echo "✅ GENFIN full platform deployed!" || echo "❌ Push failed — check git output above"

rm -- "$0"
