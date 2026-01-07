# 🎫 SAAS TICKETING MANAGEMENT - MASTER PLAN

**Project Name**: Multi-Tenant Ticketing Management Platform
**Timeline**: 3 Bulan (Januari - Maret 2025)
**First Event**: April 2025 (20,000 tickets)
**Target 2025**: 50 Tenants
**Revenue Model**: Rp 5,000/ticket (bersih)
**Deployment**: Docker (Server Ready)

---

## 📋 TABLE OF CONTENTS

1. [Requirements Checklist](#requirements-checklist)
2. [Timeline Overview](#timeline-overview)
3. [Team Structure](#team-structure)
4. [Tech Stack](#tech-stack)
5. [Database Architecture](#database-architecture)
6. [Week-by-Week Roadmap](#week-by-week-roadmap)
7. [Budget & ROI](#budget--roi)
8. [Risk Management](#risk-management)
9. [Success Criteria](#success-criteria)
10. [Immediate Action Plan](#immediate-action-plan)

---

## ✅ REQUIREMENTS CHECKLIST

### Core Features (13 Poin - SEMUA HARUS ADA)

- [x] **1. Menjual Tiket Konser**
  - Event creation & management
  - Ticket types dengan pricing
  - Stock management (no overselling)
  - Checkout flow
  - Payment integration (3 gateways)

- [x] **2. Affiliate System**
  - Registration & approval
  - Unique referral codes
  - Link tracking (cookie + URL param)
  - Commission calculation
  - Commission dashboard
  - Payout management

- [x] **3. Tiered Pricing (Auto-switching)**
  - Early Bird, H-60, H-30, Regular
  - Time-based activation (cron job)
  - Automatic price changes
  - Countdown display
  - Urgency messaging

- [x] **4. Embeddable Widget**
  - Ticket purchase widget (iframe)
  - Leaderboard widget (iframe)
  - Customizable (colors, size)
  - CORS enabled
  - Responsive design

- [x] **5. Sales Monitoring + Withdrawal**
  - Real-time dashboard
  - Sales analytics & charts
  - Withdrawal request system
  - Auto withdrawal (scheduled)
  - Manual approval flow
  - Bank transfer integration

- [x] **6. Multi-User Management**
  - Roles: Owner, Admin, Staff, Scanner
  - Permission system
  - User invitation flow
  - Activity audit log
  - Role-based UI

- [x] **7. Scanner Barcode (Check-in)**
  - PWA scanner app
  - QR code scanning
  - Online + Offline mode
  - Anti-duplicate check-in
  - Real-time stats

- [x] **8. Re-entry Verification**
  - Search by email/phone/barcode
  - Check-in status lookup
  - Allow re-entry if valid
  - Verification logging

- [x] **9. Custom Branding**
  - Logo upload
  - Color customization
  - Email template branding
  - PDF ticket branding
  - Custom domain support

- [x] **10. Add-on Bundling**
  - Add-on creation (merchandise, etc)
  - Bundle with tickets
  - Quantity selection
  - Stock management
  - Optional vs required

- [x] **11. Leaderboard Gamification**
  - Real-time rankings
  - Points calculation
  - Embeddable widget
  - Animated updates
  - Prize structure support

- [x] **12. Add-on Standalone**
  - Sell without ticket
  - Separate checkout flow
  - Independent inventory

- [x] **13. Mobile-Friendly**
  - Responsive checkout
  - Touch-optimized scanner
  - Mobile dashboard
  - PWA support

### Additional Requirements

- [x] **20,000 Tickets Capacity** (April event)
- [x] **50 Tenants** (2025 target)
- [x] **Free Tier** (max 20 tickets)
- [x] **Payment Gateways**: Nobu QR, Duitku, Midtrans
- [x] **Docker Deployment**

---

## 📅 TIMELINE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│ JANUARI (Week 1-4)                                  │
│ ├─ Week 1: Foundation & Infrastructure             │
│ ├─ Week 2: Payment Integration (3 gateways)        │
│ ├─ Week 3: Core Ticketing Engine                   │
│ └─ Week 4: Scanner App + Multi-User                │
├─────────────────────────────────────────────────────┤
│ FEBRUARI (Week 5-8)                                 │
│ ├─ Week 5: Affiliate + Tiered Pricing              │
│ ├─ Week 6: Add-ons + Leaderboard                   │
│ ├─ Week 7: Withdrawal + Dashboard                  │
│ └─ Week 8: Integration + Testing                   │
├─────────────────────────────────────────────────────┤
│ MARET (Week 9-12)                                   │
│ ├─ Week 9: Production Setup + Dry Run              │
│ ├─ Week 10: Tenant Onboarding + Support            │
│ ├─ Week 11: April Event Preparation                │
│ └─ Week 12: Final Polish + Go-Live                 │
├─────────────────────────────────────────────────────┤
│ APRIL Week 1: 🎯 PRODUCTION EVENT (20,000 tickets) │
└─────────────────────────────────────────────────────┘
```

---

## 👥 TEAM STRUCTURE

### Required Team (6 Developers)

#### Backend Team (3 Developers)

**BACKEND LEAD (Dev 1)**
- Responsibilities:
  - Architecture decisions
  - Multi-tenant system
  - Core ticketing engine
  - Affiliate system
  - Withdrawal system
- Skills: Laravel/NestJS, PostgreSQL, Redis, Architecture
- Rate: Rp 25jt/bulan

**BACKEND 2 (Dev 2)**
- Responsibilities:
  - Payment integration (Duitku)
  - Checkout flow
  - Tiered pricing automation
  - Analytics & reporting
  - Leaderboard backend
- Skills: Laravel/NestJS, Payment APIs, Cron jobs
- Rate: Rp 18jt/bulan

**BACKEND 3 (Dev 3)**
- Responsibilities:
  - Payment integration (Nobu, Midtrans)
  - Ticket generation (QR, PDF)
  - Scanner API
  - Check-in system
  - Custom branding
- Skills: Laravel/NestJS, QR generation, PDF libraries
- Rate: Rp 18jt/bulan

#### Frontend Team (2 Developers)

**FRONTEND LEAD (Dev 4)**
- Responsibilities:
  - Dashboard UI
  - Event management
  - User management
  - Affiliate portal
  - Withdrawal UI
- Skills: Next.js, React, TypeScript, TailwindCSS
- Rate: Rp 22jt/bulan

**FRONTEND 2 (Dev 5)**
- Responsibilities:
  - Scanner PWA app
  - Checkout flow UI
  - Tier management UI
  - Add-on UI
  - Leaderboard UI
  - Embeddable widgets
- Skills: Next.js, PWA, Service Workers, IndexedDB
- Rate: Rp 15jt/bulan

#### Fullstack Developer

**FULLSTACK (Dev 6)**
- Responsibilities:
  - Bridge between FE/BE
  - Integration work
  - Testing
  - Bug fixes
  - Offline mode (scanner)
  - Custom branding implementation
- Skills: Full-stack (Laravel + Next.js)
- Rate: Rp 18jt/bulan

### Optional (Highly Recommended)

**DEVOPS (+1)**
- Infrastructure, Deployment, Monitoring, Security
- Rate: Rp 20jt/bulan

**QA/TESTER (+1)**
- Testing, Load testing, Security testing
- Rate: Rp 12jt/bulan

---

## 🛠️ TECH STACK

### Backend
- **Framework**: Laravel 11 (Recommended)
  - Why: Fast development, familiar untuk Indonesian devs, proven untuk ticketing
  - Alternative: NestJS (TypeScript)
- **Language**: PHP 8.2+
- **API**: RESTful (Laravel API Resources)
- **Auth**: Laravel Sanctum (JWT)
- **Queue**: Laravel Queue + Redis
- **Email**: Laravel Mail (SendGrid/SMTP)

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand (simpler than Redux)
- **Data Fetching**: SWR
- **Forms**: React Hook Form + Zod validation

### Database
- **Primary**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Search**: PostgreSQL Full-Text Search (Phase 2: Meilisearch)

### Storage
- **Files**: S3 / MinIO (self-hosted)
- **CDN**: CloudFlare

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Server**: Already available (verify specs: min 16GB RAM, 8 vCPU)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (errors), Laravel Telescope (dev)
- **Logging**: Laravel Logs + File rotation

### Payment Gateways
- **Nobu QR**: QR code generation
- **Duitku**: VA + E-wallet + QRIS
- **Midtrans**: GoPay

### Scanner App
- **Platform**: PWA (Progressive Web App)
- **QR Library**: html5-qrcode
- **Offline Storage**: IndexedDB
- **Sync**: Service Worker Background Sync

---

## 🗄️ DATABASE ARCHITECTURE

### Strategy: Shared Schema Multi-Tenant

**Decision**: Start dengan shared schema (fast development)
- Add `tenant_id` ke semua tables
- Row-level isolation via Laravel Global Scopes
- Migrate ke DB-per-tenant di Phase 2 jika needed

### Core Tables

#### Master Tables (Platform Level)
```sql
tenants
├─ id, subdomain, custom_domain
├─ plan (free, paid)
├─ settings (branding, limits)
└─ status

users (platform users)
├─ id, tenant_id, email, password
├─ role (owner, admin, staff, scanner)
└─ permissions

subscriptions
├─ tenant_id, plan
└─ status
```

#### Tenant Tables (Per Tenant Data)
```sql
events
├─ tenant_id, name, slug, description
├─ venue_name, venue_address
├─ start_date, end_date
├─ cover_image_url
└─ settings, status

ticket_types
├─ event_id, name, description
├─ base_price, currency
├─ total_quantity, available_quantity
├─ sale_starts_at, sale_ends_at
└─ status

pricing_tiers
├─ ticket_type_id, name
├─ price, starts_at, ends_at
├─ quantity_limit
└─ priority

orders
├─ tenant_id, event_id
├─ order_number, buyer_email, buyer_name
├─ subtotal, discount, fees, total
├─ affiliate_id, payment_method
├─ payment_status, payment_gateway_ref
└─ status

order_items
├─ order_id, item_type (ticket/addon)
├─ ticket_type_id, addon_id
├─ item_name, unit_price, quantity
└─ subtotal

tickets
├─ order_id, ticket_type_id, event_id
├─ ticket_number, barcode, qr_code_data
├─ attendee_name, attendee_email
├─ checked_in, checked_in_at
└─ status

checkin_logs
├─ ticket_id, event_id
├─ action_type (check_in, verification)
├─ scanned_by, location
└─ success, failure_reason

affiliates
├─ tenant_id, event_id
├─ full_name, email, phone
├─ referral_code, referral_url
├─ commission_type, commission_value
├─ total_clicks, total_conversions
├─ total_commission_earned
└─ status

addons
├─ event_id, name, description
├─ price, has_stock, available_stock
├─ can_sell_standalone
├─ participates_in_leaderboard
└─ category

leaderboards
├─ event_id, addon_id
├─ name, description, config
├─ starts_at, ends_at
└─ is_active

leaderboard_entries
├─ leaderboard_id
├─ buyer_email, buyer_name
├─ total_quantity, points
└─ rank

withdrawal_requests
├─ tenant_id, event_id
├─ gross_amount, platform_fee, net_amount
├─ bank_name, bank_account_number
├─ status (pending, approved, completed)
└─ processed_at

webhook_events
├─ source (nobu, duitku, midtrans)
├─ event_type, payload
├─ processed, processed_at
└─ signature_valid
```

### Redis Data Structures

```
Stock Management:
ticket:{type_id}:stock → integer (available count)
reservation:{uuid} → hash {ticket_type_id, quantity, expires_at}

Leaderboard:
leaderboard:{id} → sorted set (score: points, member: email|name)

Session/Cache:
session:{user_id} → hash
cart:{session_id} → hash
cache:{key} → string/hash (general caching)

Queue:
queues:default → list
queues:emails → list
queues:payments → list
```

---

## 📆 WEEK-BY-WEEK ROADMAP

### JANUARI

#### Week 1: Foundation & Infrastructure

**Day 1-2: Project Setup**
- [ ] Docker compose (PostgreSQL, Redis, Laravel, Next.js)
- [ ] Repository structure (monorepo recommended)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment configuration
- [ ] Database schema design (FINAL)
- [ ] API specification draft
- [ ] Sprint planning session

**Day 3-5: Backend Foundation**
- [ ] Laravel 11 setup
- [ ] Multi-tenant middleware (subdomain routing)
- [ ] Tenant model + migration
- [ ] Global scope untuk tenant isolation
- [ ] Auth system (Sanctum JWT)
- [ ] Event model + API (CRUD)
- [ ] Ticket type model + API
- [ ] Stock management architecture (Redis)
- [ ] Payment abstraction layer design

**Day 6-7: Frontend Foundation**
- [ ] Next.js 14 setup
- [ ] TailwindCSS + shadcn/ui
- [ ] Layout structure
- [ ] Routing setup
- [ ] API client (Axios + SWR)
- [ ] Auth context + protected routes
- [ ] Design system (colors, typography)
- [ ] Form components, buttons, tables

**Deliverable:**
✅ Development environment ready
✅ Multi-tenant architecture working
✅ Basic auth functional
✅ Component library v0.1

---

#### Week 2: Payment Integration (CRITICAL)

**Backend (All 3 Payment Gateways - PARALLEL)**

**Dev 1: Nobu QR Integration**
- [ ] API integration (QR generation)
- [ ] Callback handler
- [ ] Payment status polling
- [ ] Testing dengan sandbox
- [ ] Error handling

**Dev 2: Duitku Integration**
- [ ] VA bank channels
- [ ] E-wallet (OVO, DANA, ShopeePay)
- [ ] QRIS
- [ ] Callback handler
- [ ] Testing

**Dev 3: Midtrans GoPay**
- [ ] Snap integration
- [ ] GoPay deeplink
- [ ] Callback handler
- [ ] Refund API
- [ ] Testing

**Integration (All Backend Devs)**
- [ ] Payment facade pattern (unified interface)
- [ ] Gateway selector logic
- [ ] Webhook router
- [ ] Payment status state machine
- [ ] Idempotency implementation
- [ ] Database transactions untuk payment flow

**Frontend**
- [ ] Payment gateway selection UI
- [ ] Payment status page
- [ ] Countdown timer (payment expiry)
- [ ] Success/failure pages
- [ ] Order summary component
- [ ] Payment instructions modal
- [ ] QR code display component
- [ ] Virtual account display

**Deliverable:**
✅ All 3 gateways integrated and tested
✅ Payment flow end-to-end working
✅ Idempotency confirmed
✅ Webhooks reliable

---

#### Week 3: Core Ticketing Features

**Stream 1: Ticketing Engine (Backend 1 + Frontend 1)**

Backend:
- [ ] Ticket type CRUD with pricing
- [ ] Stock management (Redis atomic ops)
- [ ] Lua script untuk reserve
- [ ] TTL untuk auto-release
- [ ] Background sync to PostgreSQL
- [ ] Order creation API
- [ ] Order items relationship
- [ ] Stock deduction flow
- [ ] Overselling prevention testing

Frontend:
- [ ] Event creation form (name, description, date, venue, image)
- [ ] Ticket type creation form (name, price, stock, limits)
- [ ] Event listing (tenant dashboard)
- [ ] Event detail page (public view)

**Stream 2: Checkout Flow (Backend 2 + Frontend 2)**

Backend:
- [ ] Shopping cart session (Redis)
- [ ] Cart validation (stock, limits)
- [ ] Buyer information collection
- [ ] Order total calculation
- [ ] Reservation creation (10 min TTL)
- [ ] Integration dengan payment gateways

Frontend:
- [ ] Ticket selection UI (quantity selector, real-time stock)
- [ ] Cart summary
- [ ] Buyer information form (name, email, phone, validation)
- [ ] Checkout page (order summary, payment gateway selection)
- [ ] Mobile-responsive checkout

**Stream 3: Ticket Delivery (Backend 3 + Fullstack)**

Backend:
- [ ] Ticket model + generation
- [ ] QR code generation (unique hash + signature)
- [ ] PDF ticket template (basic design dengan QR)
- [ ] Email sending (Laravel Mail + Queue)
- [ ] Ticket download endpoint

Fullstack:
- [ ] Ticket generation job (queue)
- [ ] Email template design (HTML)
- [ ] PDF generation library setup
- [ ] S3/MinIO upload untuk PDFs
- [ ] Download ticket page
- [ ] Testing email delivery

**Deliverable:**
✅ Complete checkout flow working
✅ Stock management bulletproof
✅ Tickets generated and emailed
✅ PDF tickets downloadable

---

#### Week 4: Scanner App + Multi-User

**Stream 1: Scanner PWA (Frontend 2 + Fullstack)**

Frontend 2:
- [ ] PWA setup (manifest, service worker)
- [ ] Camera access (getUserMedia)
- [ ] QR scanning library (html5-qrcode)
- [ ] Barcode decoding
- [ ] Signature verification
- [ ] Check-in UI (success/error animations, sounds)
- [ ] Check-in history log
- [ ] Scanner statistics

Fullstack:
- [ ] IndexedDB setup
- [ ] Pre-load attendee API
- [ ] Download & store in IndexedDB
- [ ] Offline check-in logic
- [ ] Background sync service worker
- [ ] Conflict resolution
- [ ] Offline indicator UI

Backend 3:
- [ ] Check-in endpoint (validate, prevent duplicate)
- [ ] Re-entry verification endpoint
- [ ] Check-in logs table
- [ ] Real-time stats API
- [ ] Bulk check-in sync endpoint

**Stream 2: Multi-User System (Backend 1 + Frontend 1)**

Backend:
- [ ] User roles table (owner, admin, staff, scanner)
- [ ] Permissions system (Laravel gates/policies)
- [ ] User invitation system
- [ ] User management API
- [ ] Activity audit log

Frontend:
- [ ] User management page
- [ ] Invite user modal
- [ ] Edit user role
- [ ] Role-based UI
- [ ] Profile settings page
- [ ] Activity log viewer

**Stream 3: Free Tier (Backend 2)**
- [ ] Tenant plan model (free, paid)
- [ ] Ticket limit enforcement (20 tickets max)
- [ ] Track ticket count (Redis counter)
- [ ] Block checkout if exceeded
- [ ] Upgrade prompt API
- [ ] Usage tracking API

**Deliverable:**
✅ Scanner app working (online + offline)
✅ Multi-user system functional
✅ Free tier enforced
✅ Role-based access working

---

### FEBRUARI

#### Week 5: Affiliate System + Tiered Pricing

**Stream 1: Affiliate System (Backend 1 + Frontend 1)**

Backend:
- [ ] Affiliate model (personal info, referral code, commission)
- [ ] Affiliate registration API
- [ ] Referral tracking (cookie + URL param)
- [ ] Associate order with affiliate
- [ ] Commission calculation
- [ ] Commission model + tracking
- [ ] Affiliate payout API
- [ ] Affiliate analytics API

Frontend:
- [ ] Affiliate registration page (public)
- [ ] Affiliate dashboard (stats, sales, commission)
- [ ] Referral link generator (copy, QR, social share)
- [ ] Payout request page
- [ ] Admin affiliate management

**Stream 2: Tiered Pricing (Backend 2 + Frontend 2)**

Backend:
- [ ] Pricing tier model (name, price, dates, priority)
- [ ] Tier CRUD API
- [ ] Automatic tier activation (cron job every 1 min)
- [ ] Update current_price in cache/DB
- [ ] Tier switching notification
- [ ] Price calculation API
- [ ] Tier analytics

Frontend:
- [ ] Pricing tier creation UI
- [ ] Tier timeline visualization
- [ ] Tier templates (presets)
- [ ] Public event page (current price, next tier countdown)

**Stream 3: Custom Branding (Backend 3 + Fullstack)**

Backend:
- [ ] Tenant branding settings model
- [ ] Branding API (CRUD)
- [ ] Email template variables
- [ ] PDF ticket template variables

Fullstack:
- [ ] Branding settings page (logo upload, color pickers)
- [ ] Email template builder
- [ ] PDF ticket customization
- [ ] Custom domain setup guide

**Deliverable:**
✅ Affiliate system operational
✅ Automatic tier pricing working
✅ Custom branding functional
✅ Referral tracking accurate

---

#### Week 6: Add-ons + Leaderboard

**Stream 1: Add-on System (Backend 1 + Frontend 1)**

Backend:
- [ ] Add-on model (name, price, stock, standalone, leaderboard)
- [ ] Add-on CRUD API
- [ ] Add-on to order items
- [ ] Stock management (Redis)
- [ ] Order items relationship

Frontend:
- [ ] Add-on creation form
- [ ] Add-on listing (admin)
- [ ] Checkout add-on selection
- [ ] Standalone add-on purchase page
- [ ] Add-on inventory management

**Stream 2: Leaderboard (Backend 2 + Frontend 2)**

Backend:
- [ ] Leaderboard model (event + addon linkage, config)
- [ ] Leaderboard entries model
- [ ] Redis sorted set implementation (ZINCRBY)
- [ ] Real-time ranking API (top N, user rank)
- [ ] Leaderboard update job (on order completion)
- [ ] Leaderboard embed API (public, CORS, cache)

Frontend:
- [ ] Leaderboard creation page
- [ ] Leaderboard display page (top 10/50/100)
- [ ] Real-time updates (WebSocket/polling)
- [ ] Embeddable widget (iframe generator)
- [ ] Leaderboard admin

**Stream 3: Embeddable Widget (Fullstack)**
- [ ] Ticket widget page `/embed/tickets/{eventId}`
- [ ] Leaderboard widget page `/embed/leaderboard/{id}`
- [ ] Widget customization API
- [ ] Widget documentation
- [ ] CORS configuration
- [ ] Rate limiting for widgets

**Deliverable:**
✅ Add-on system working (bundle + standalone)
✅ Leaderboard real-time updates
✅ Embeddable widgets functional
✅ Gamification engaging

---

#### Week 7: Withdrawal System + Dashboard

**Stream 1: Withdrawal System (Backend 1 + Frontend 1)**

Backend:
- [ ] Withdrawal request model
- [ ] Withdrawal calculation API (sales, fees, balance)
- [ ] Withdrawal request API
- [ ] Automatic withdrawal scheduling
- [ ] Withdrawal history API
- [ ] Bank transfer integration prep

Frontend:
- [ ] Balance dashboard
- [ ] Withdrawal request page
- [ ] Withdrawal history table
- [ ] Admin withdrawal approval
- [ ] Automatic withdrawal settings

**Stream 2: Analytics Dashboard (Backend 2 + Frontend 2)**

Backend:
- [ ] Dashboard stats API
- [ ] Sales analytics API (by ticket type, date, hour, affiliate)
- [ ] Real-time dashboard (WebSocket/Polling)
- [ ] Export functionality (CSV)
- [ ] Event performance comparison

Frontend:
- [ ] Main dashboard page (stats cards, charts, recent orders)
- [ ] Sales reports page
- [ ] Event analytics page
- [ ] Affiliate performance page
- [ ] Real-time notifications

**Stream 3: Mobile Optimization (All Frontend)**
- [ ] Mobile checkout optimization
- [ ] Mobile scanner optimization
- [ ] Mobile dashboard
- [ ] Responsive tables
- [ ] Mobile performance (lazy loading, code splitting)
- [ ] Testing on devices (iOS, Android)

**Deliverable:**
✅ Withdrawal system complete
✅ Analytics dashboard comprehensive
✅ Mobile experience optimized
✅ All features responsive

---

#### Week 8: Integration + Testing

**ALL DEVELOPERS - Focus on Quality**

Backend Testing:
- [ ] API integration tests (all endpoints)
- [ ] Payment flow testing (all gateways, webhooks, timeout)
- [ ] Stock management testing (concurrent checkout, overselling)
- [ ] Affiliate tracking testing
- [ ] Tier switching testing

Frontend Testing:
- [ ] E2E testing (Playwright/Cypress)
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility testing
- [ ] Performance testing (Lighthouse)

Load Testing:
- [ ] k6 script setup
- [ ] Scenarios (5000 concurrent checkout, 100 scanners)
- [ ] Database performance
- [ ] Redis performance

Security Testing:
- [ ] SQL injection testing
- [ ] XSS prevention
- [ ] CSRF validation
- [ ] Authentication bypass attempts
- [ ] Rate limiting verification

Bug Fixing:
- [ ] Critical bugs (P0) - immediate fix
- [ ] High priority (P1) - fix this week
- [ ] Medium/Low (P2/P3) - document

Documentation:
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide
- [ ] Scanner manual
- [ ] Deployment guide

**Deliverable:**
✅ All critical bugs fixed
✅ System handles 20K load
✅ Security vulnerabilities addressed
✅ Documentation complete

---

### MARET

#### Week 9: Production Setup + Dry Run

DevOps/Backend Lead:
- [ ] Production environment setup (Docker deployment)
- [ ] PostgreSQL configuration (production-ready)
- [ ] Redis configuration (persistence enabled)
- [ ] SSL certificates (Let's Encrypt)
- [ ] Domain DNS configuration
- [ ] Environment variables (production secrets)
- [ ] Monitoring setup (logs, error tracking, uptime)
- [ ] Backup strategy (daily, 30 days retention)
- [ ] Security hardening (firewall, rate limiting, DDoS)

All Team - Dry Run:
- [ ] Create test event (20,000 tickets)
- [ ] Create 10 test affiliates
- [ ] Simulate 1000 purchases
- [ ] Scanner dry run (1000 attendees)
- [ ] Withdrawal testing
- [ ] Performance monitoring
- [ ] Full regression testing

**Deliverable:**
✅ Production environment live
✅ Dry run successful
✅ Monitoring operational
✅ Backups configured

---

#### Week 10: Tenant Onboarding + Support Prep

Frontend Team:
- [ ] Onboarding flow polish (welcome wizard, tooltips)
- [ ] Help documentation
- [ ] In-app help system

Backend Team:
- [ ] Tenant migration script
- [ ] Admin tools (impersonate tenant, analytics)
- [ ] Email templates (all notifications)
- [ ] Notification system

Business Prep:
- [ ] Pricing page
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Support system setup (email, WhatsApp, ticket system)
- [ ] Training materials
- [ ] Beta tester recruitment (5-10 tenants)

**Deliverable:**
✅ Onboarding smooth
✅ Documentation complete
✅ Support system ready
✅ Beta testers recruited

---

#### Week 11: April Event Preparation

Event Setup:
- [ ] Create April event (production)
- [ ] Configure 20,000 ticket capacity
- [ ] Ticket types + pricing tiers
- [ ] Add-ons creation
- [ ] Branding customization
- [ ] Payment gateway verification
- [ ] Affiliate setup (recruit 5-10)
- [ ] Leaderboard setup

Scanner Preparation:
- [ ] Scanner devices setup (10 devices)
- [ ] Scanner app installed (PWA)
- [ ] Pre-load attendee data (test 20K download)
- [ ] Scanner staff training (2 hours)
- [ ] Gate assignments (5 gates × 2 scanners)

Load Testing (Final):
- [ ] Simulate 20K ticket sales
- [ ] 5000 purchases in 4 hours (peak)
- [ ] Monitor system performance
- [ ] Scan simulation (20K check-ins)
- [ ] Identify bottlenecks, optimize

Contingency Planning:
- [ ] Backup scenarios (internet down, payment down, server down)
- [ ] Incident response plan
- [ ] Manual fallback procedures

**Deliverable:**
✅ April event fully configured
✅ Load testing passed (20K capacity)
✅ Scanner staff trained
✅ Contingency plans ready

---

#### Week 12: Final Polish + Go-Live

Final Testing:
- [ ] Complete system test (all features)
- [ ] Security audit (final check)
- [ ] Performance verification
- [ ] Mobile, cross-browser, accessibility final check

Bug Fixes:
- [ ] Fix remaining P0/P1 bugs
- [ ] Document P2/P3 for post-launch
- [ ] Code cleanup

Monitoring & Alerts:
- [ ] Set up alerts (server down, high error rate, payment failure)
- [ ] On-call rotation (24/7 for April event)
- [ ] Real-time dashboard

Documentation Final:
- [ ] Admin handbook
- [ ] User manual
- [ ] API documentation
- [ ] Deployment procedures
- [ ] Troubleshooting guide

Go-Live Checklist:
- [ ] Production environment verified
- [ ] SSL valid, DNS configured
- [ ] Payment gateways live
- [ ] Email sending working
- [ ] Monitoring active, backups running
- [ ] Support team ready
- [ ] April event published

Soft Launch:
- [ ] Announce to limited audience (internal, beta testers)
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Gradual ramp up

Day Before Event:
- [ ] Final system check (all green)
- [ ] Scanner devices charged
- [ ] Staff briefing (final)
- [ ] Verify internet at venue
- [ ] Support team on standby

**Deliverable:**
✅ System production-ready
✅ All stakeholders briefed
✅ Monitoring & alerts active
✅ **GO-LIVE!**

---

## 💰 BUDGET & ROI

### Development Costs (3 Months)

#### Team Salaries

| Role | Rate/Month | Duration | Total |
|------|-----------|----------|-------|
| Backend Lead | Rp 25jt | 3 months | Rp 75jt |
| Backend 2 | Rp 18jt | 3 months | Rp 54jt |
| Backend 3 | Rp 18jt | 3 months | Rp 54jt |
| Frontend Lead | Rp 22jt | 3 months | Rp 66jt |
| Frontend 2 | Rp 15jt | 3 months | Rp 45jt |
| Fullstack | Rp 18jt | 3 months | Rp 54jt |
| **Subtotal** | | | **Rp 348jt** |

#### Optional (Recommended)

| Role | Rate/Month | Duration | Total |
|------|-----------|----------|-------|
| DevOps | Rp 20jt | 3 months | Rp 60jt |
| QA/Tester | Rp 12jt | 3 months | Rp 36jt |
| **Subtotal** | | | **Rp 96jt** |

**Total Team Cost:**
- Minimum (6 devs): **Rp 348 juta**
- Recommended (8 devs): **Rp 444 juta**

### Infrastructure & Services (3 Months)

| Item | Cost |
|------|------|
| Server | Rp 0 (sudah ada) |
| Domain & SSL | Rp 500k |
| Email service (SendGrid) | Rp 1.5jt |
| Storage (S3/MinIO) | Rp 1jt |
| Monitoring (Sentry) | Rp 1jt |
| Payment gateway fees | Rp 3jt |
| Misc (testing, tools) | Rp 3jt |
| **Total Infrastructure** | **Rp 10 juta** |

### Contingency (20%)

```
(444 + 10) × 20% = Rp 91 juta
```

### GRAND TOTAL

```
═══════════════════════════════════════
Team (recommended): Rp 444 juta
Infrastructure:      Rp  10 juta
Contingency:         Rp  91 juta
─────────────────────────────────────
GRAND TOTAL:         Rp 545 juta
═══════════════════════════════════════

BREAKDOWN:
- Minimum (6 devs): Rp 358 juta
- Recommended (8 devs): Rp 545 juta
```

### ROI Analysis

**2025 Revenue Projection:**

```
April Event:
20,000 tickets × Rp 5,000 = Rp 100 juta

Remaining 2025 (May-Dec):
Target: 49 tenants × avg 500 tickets = 24,500 tickets
24,500 × Rp 5,000 = Rp 122.5 juta

TOTAL 2025 REVENUE: Rp 222.5 juta

Break-even: Bulan 12-18 (dengan operational costs)
```

---

## ⚠️ RISK MANAGEMENT

### Critical Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| Payment gateway approval delayed | MEDIUM | CRITICAL | **Apply TODAY**, use existing account if possible | Backend Lead |
| 20K stock overselling | LOW | CATASTROPHIC | Redis Lua atomic ops + extensive testing Week 7-8 | Backend 2 |
| Scanner offline failure | MEDIUM | HIGH | Offline-first PWA + pre-load + training + backup devices | Frontend 2 |
| Developer unavailability | MEDIUM | HIGH | Contract with clear deliverables + backup list | PM |
| Scope creep | HIGH | HIGH | **FREEZE SCOPE** - No new features until May | All |
| April event cancelled | LOW | MEDIUM | Have 2-3 backup smaller events in March | PM |
| Server capacity insufficient | MEDIUM | HIGH | Load test Week 11, scale up if needed | DevOps |
| Security breach | LOW | CATASTROPHIC | Security audit Week 8, penetration testing | Backend Lead |

### Risk Response Strategies

**Payment Gateway Delay:**
- Apply semua gateway accounts hari ini
- Fallback: Start dengan 1 gateway, add others later
- Contact: Escalate ke account manager jika > 2 weeks

**Overselling Prevention:**
- Redis atomic operations (Lua script)
- Load testing 100 concurrent checkouts
- Real-time monitoring dashboard
- Alert jika stock < 0 (should never happen)

**Scanner Offline:**
- PWA offline-first architecture
- Pre-load ALL attendees sebelum event
- IndexedDB local storage (works without internet)
- Backup: Manual printed check-in list

**Developer Unavailable:**
- Clear contracts dengan deliverables
- Knowledge sharing sessions weekly
- Documentation semua critical code
- Backup developer list (freelancers)

**Scope Creep:**
- **FREEZE SCOPE** after Week 1
- All new requests → Phase 2 backlog
- Only P0 bugs/blockers allowed
- Product owner approval for ANY changes

---

## 🎯 SUCCESS CRITERIA

### April Event (MUST ACHIEVE)

**Technical:**
- [x] 20,000 tickets sold successfully
- [x] 0 overselling incidents
- [x] 99%+ payment success rate
- [x] Check-in < 2 min average per person
- [x] Scanner works offline 100%
- [x] 0 critical bugs during event
- [x] Customer satisfaction > 4/5

**Operational:**
- [x] 10 scanner devices operational
- [x] Staff trained (minimum 2 sessions)
- [x] Support team available 24/7
- [x] No data loss incidents
- [x] All payments reconciled

**Business:**
- [x] Event organizer satisfaction
- [x] Media coverage (optional)
- [x] Testimonial from organizer
- [x] Case study material collected

### Technical Metrics

**Performance:**
- API response time: p95 < 500ms, p99 < 1000ms
- Checkout conversion rate: > 80%
- Payment success rate: > 99%
- Check-in speed: < 10 seconds per person
- System uptime: 99.9%
- Email delivery rate: > 99%
- Scanner latency: < 100ms

**Scale:**
- Concurrent users: 1000+ (peak)
- Tickets/hour: 5000+ (peak sales)
- Check-ins/hour: 10,000+ (peak entry)
- Database connections: < 100 active
- Redis memory: < 2GB used

### 2025 Year-End Goals

- [x] 50+ active tenants
- [x] 100,000+ tickets sold total
- [x] Rp 222.5 juta revenue achieved
- [x] < 1% refund rate
- [x] 4.5+ star average rating
- [x] 99% uptime (yearly)
- [x] 0 data breach incidents
- [x] 0 payment fraud incidents

---

## 🚀 IMMEDIATE ACTION PLAN

### TODAY (Day 1) - CRITICAL

**Management/Business:**
- [ ] **APPROVE THIS PLAN** (Go/No-Go decision)
- [ ] Budget approval (Rp 358-545 juta)
- [ ] Timeline commitment (3 months, April deadline)

**Team:**
- [ ] Recruit/Assign 6 developers (names + skillsets)
- [ ] Confirm availability (full-time, Jan-March)
- [ ] Contracts prepared (clear deliverables)

**Payment Gateways (URGENT!):**
- [ ] **Nobu QR**: Apply for API access
  - Contact: _______________
  - Documents needed: _______________
- [ ] **Duitku**: Merchant account application
  - Contact: _______________
  - Documents needed: _______________
- [ ] **Midtrans**: Account setup (if not existing)
  - Contact: _______________
  - Documents needed: _______________

**Infrastructure:**
- [ ] Verify server specs (min: 16GB RAM, 8 vCPU, 200GB SSD)
- [ ] Server access untuk team (SSH keys)
- [ ] Domain name ready (main + wildcard for subdomains)

**Project Setup:**
- [ ] Create GitHub/GitLab repository
- [ ] Add all developers to repo
- [ ] Project management tool (Jira/Linear/Notion)
- [ ] Communication channel (Slack/Discord)

**Kick-off Meeting:**
- [ ] Schedule for tomorrow or Day 2
- [ ] Agenda: Plan walkthrough, Q&A, Sprint 1 planning
- [ ] All team members present

---

### DAY 2-3: Development Environment

**All Developers:**
- [ ] Clone repository
- [ ] Local development environment setup
- [ ] Docker compose running locally
- [ ] Access to all tools (DB, Redis, etc)

**Backend Lead:**
- [ ] Database schema finalization
- [ ] Create migrations (all tables)
- [ ] Seed data for development
- [ ] API endpoint specification (complete list)

**Frontend Lead:**
- [ ] Component library selection confirmed
- [ ] Design tokens (colors, spacing, typography)
- [ ] Routing structure defined
- [ ] API client setup

**DevOps (if available):**
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] Docker build automation
- [ ] Development server deployment
- [ ] Monitoring setup (basic)

---

### DAY 4-5: Sprint 1 Kickoff

**Backend:**
- [ ] Laravel 11 installed and configured
- [ ] Multi-tenant middleware (skeleton)
- [ ] Auth endpoints (/login, /register)
- [ ] Tenant CRUD API
- [ ] Event CRUD API (basic)

**Frontend:**
- [ ] Next.js 14 installed and configured
- [ ] Layout components (dashboard, public)
- [ ] Login/Register pages
- [ ] Dashboard home (skeleton)
- [ ] Event list page (skeleton)

**Fullstack:**
- [ ] Integration testing (auth flow)
- [ ] Documentation structure
- [ ] Team sync meeting (daily standup started)

---

### END OF WEEK 1 (Day 7)

**Checkpoint:**
- [ ] All developers productive
- [ ] Development environment stable
- [ ] Multi-tenant routing working
- [ ] Auth system functional
- [ ] Basic CRUD operational
- [ ] Team velocity established
- [ ] Sprint 2 planning complete

**Next Week Preview:**
- Payment integration (all 3 gateways)
- Parallel development streams
- Daily standups (15 min)
- Weekly demo (Friday)

---

## 📞 CRITICAL DECISIONS NEEDED

### IMMEDIATE (Answer in 24 hours):

1. **Approved to proceed?**
   - [ ] Yes, proceed with full plan
   - [ ] Yes, but with modifications: _______________
   - [ ] No, need more discussion

2. **Team availability?**
   - [ ] 6 developers ready to start: _______________
   - [ ] 8 developers (with DevOps/QA): _______________
   - [ ] Need to recruit: _______________

3. **Payment gateway accounts?**
   - [ ] Nobu: Existing account / Need to apply
   - [ ] Duitku: Existing account / Need to apply
   - [ ] Midtrans: Existing account / Need to apply
   - Contact persons: _______________

4. **Server specs?**
   - RAM: _______________
   - CPU: _______________
   - Storage: _______________
   - OS: _______________

5. **Tech stack confirmation?**
   - [ ] Laravel (recommended)
   - [ ] NestJS (alternative)
   - [ ] Other: _______________

### IMPORTANT (Answer this week):

6. **Free tier abuse prevention?**
   - [ ] Limit 1 event per tenant untuk free tier
   - [ ] Limit 20 tickets per event
   - [ ] Other: _______________

7. **Refund policy?**
   - [ ] Full refund (conditions: _______________)
   - [ ] Partial refund (percentage: _______________)
   - [ ] No refunds
   - [ ] Case-by-case

8. **Branding for April event?**
   - [ ] Platform branding (our logo)
   - [ ] Tenant branding (organizer logo)
   - [ ] White-label (no platform branding)

9. **Support channels?**
   - [ ] Email: _______________
   - [ ] WhatsApp: _______________
   - [ ] Phone: _______________
   - [ ] Ticket system

10. **Testing events?**
    - [ ] Yes, have 2-3 small events in March
    - [ ] No, April is first event
    - Details: _______________

---

## 📚 APPENDIX

### Useful Resources

**Documentation:**
- Laravel: https://laravel.com/docs
- Next.js: https://nextjs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Redis: https://redis.io/docs/
- TailwindCSS: https://tailwindcss.com/docs

**Payment Gateways:**
- Nobu: (contact for API docs)
- Duitku: https://docs.duitku.com/
- Midtrans: https://docs.midtrans.com/

**Tools:**
- Docker: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/actions
- Playwright (E2E testing): https://playwright.dev/
- k6 (Load testing): https://k6.io/docs/

**Libraries:**
- shadcn/ui: https://ui.shadcn.com/
- html5-qrcode: https://github.com/mebjas/html5-qrcode
- QR Code generation: https://github.com/endroid/qr-code
- PDF generation: https://github.com/dompdf/dompdf

### Glossary

- **Multi-tenant**: Single application serves multiple customers (tenants)
- **PWA**: Progressive Web App - web app that works offline
- **IndexedDB**: Browser database for offline storage
- **Redis**: In-memory data store for caching and queues
- **Lua Script**: Server-side script for atomic Redis operations
- **JWT**: JSON Web Token for authentication
- **CORS**: Cross-Origin Resource Sharing (for embeddable widgets)
- **Idempotency**: Same request produces same result (no duplicates)
- **Race Condition**: Multiple processes compete for same resource
- **Webhook**: HTTP callback from payment gateway
- **TTL**: Time To Live (expiration time)
- **Atomic Operation**: Operation that completes fully or not at all

---

## ✅ CONCLUSION

This is a **COMPREHENSIVE, AGGRESSIVE, but ACHIEVABLE** plan yang memenuhi **SEMUA 13 requirements** dalam **3 bulan**.

**Success depends on:**
1. ✅ Full team commitment (6 developers, full-time)
2. ✅ No scope creep (freeze features until post-April)
3. ✅ Fast decision making (no delays on approvals)
4. ✅ Parallel execution (multiple streams working simultaneously)
5. ✅ Risk acceptance (April event is first major test)

**Expected Outcome:**
- **End of March**: Fully functional platform with ALL 13 features
- **April Event**: Successfully handle 20,000 tickets
- **2025**: Scale to 50 tenants, Rp 222.5 juta revenue

---

**Document Version**: 1.0
**Last Updated**: 2025-01-04
**Next Review**: After Week 4 (End of January)

**Status**: 🟡 AWAITING APPROVAL

---

## 📝 APPROVAL SIGNATURES

**Approved by:**

| Name | Role | Signature | Date |
|------|------|-----------|------|
| _______________ | Project Owner | _______________ | _______________ |
| _______________ | Technical Lead | _______________ | _______________ |
| _______________ | Finance/Budget | _______________ | _______________ |

**Notes:**
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

---

**END OF MASTER PLAN**
