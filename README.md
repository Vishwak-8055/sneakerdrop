# SneakerDrop 👟
### Discover. Explore. Get on the List.

**SneakerDrop** is a premium sneaker discovery platform built for sneaker enthusiasts who want a curated way to explore iconic silhouettes, discover upcoming releases, and secure their place on exclusive sneaker waitlists.

Designed around a luxury streetwear aesthetic, SneakerDrop combines an immersive storefront, intelligent product discovery, detailed sneaker pages, and a secure waitlist experience.

[Live Demo](https://sneakerdrop-ovc8.vercel.app/) · [GitHub Repository](https://github.com/Vishwak-8055/sneakerdrop)

---

## ✨ Overview

SneakerDrop brings sneaker discovery and release engagement into one streamlined experience.

Rather than overwhelming users with endless product listings, the platform focuses on curated discovery, intuitive navigation, detailed product information, and frictionless waitlist registration.

### Key Highlights

- Premium storefront with a luxury-inspired visual identity.
- Dedicated sneaker discovery experience.
- Search, category filters, and availability filters.
- Price and newest-release sorting.
- Paginated product catalogue.
- Individual sneaker detail pages.
- Product image gallery and related sneaker recommendations.
- Release information and product availability.
- Per-product sneaker waitlists.
- Secure backend powered by Supabase.
- SEO-ready metadata, canonical URLs, sitemap, and robots configuration.

---

## 🚀 Features

### 01. Premium Storefront
A carefully designed storefront focused on product presentation, visual hierarchy, and a premium sneaker-shopping experience.

### 02. Discover Experience
Explore the sneaker catalogue with:
- Product search
- Category filtering
- Availability filtering
- Price sorting
- Newest-first sorting
- Pagination

### 03. Sneaker Detail Pages
Every sneaker has a dedicated product page featuring:
- Product information
- Image gallery
- Release information
- Availability details
- Related sneaker recommendations
- Individual waitlist registration

### 04. Sneaker Waitlist System
Users can register interest in individual sneakers through a dedicated waitlist.

The API includes:
- Zod request validation
- Email normalization
- Same-origin request validation
- Honeypot spam protection
- Database-level duplicate prevention
- Secure database permissions

### 05. Secure Database Architecture
Supabase PostgreSQL provides the backend infrastructure, including:
- Relational database schema
- Row Level Security (RLS)
- Database constraints and indexes
- Column-level permissions
- Storage policies
- Admin profile-based authorization

### 06. SEO & Production Hardening
- Page-specific metadata
- Canonical URLs
- Dynamic sitemap
- Robots configuration
- Security headers
- CI build workflow

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| Frontend | React |
| Language | TypeScript |
| Routing | Next.js App Router |
| Styling | Custom CSS |
| Database | Supabase PostgreSQL |
| Backend API | Next.js Route Handlers |
| Validation | Zod |
| Authentication Infrastructure | Supabase Auth |
| File Storage | Supabase Storage |
| Security | PostgreSQL RLS |
| Deployment | Vercel |
| Version Control | Git & GitHub |

---

## 🏗️ Architecture

```text
                  SNEAKERDROP
                       |
              Next.js 15 App Router
                       |
          +------------+------------+
          |            |            |
       Storefront   Discover    Product Pages
          |            |            |
          +------------+------------+
                       |
                Next.js API Routes
                       |
              Supabase Integration
                       |
          +------------+------------+
          |            |            |
       PostgreSQL    Storage     Security
       Database      Images       (RLS)
          |
    +-----+----------------+
    |                      |
 Products             Waitlists
    |                      |
 Product Images       Subscriptions
```

---

## 📁 Project Structure

```text
sneakerdrop/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── waitlist/
│   │   │       └── route.ts
│   │   │
│   │   ├── discover/
│   │   │   └── page.tsx
│   │   │
│   │   ├── products/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   │
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── ProductCard.tsx
│   │   └── WaitlistForm.tsx
│   │
│   └── lib/
│       ├── format.ts
│       ├── products.ts
│       └── supabase.ts
│
├── supabase/
│   ├── migrations/
│   ├── tests/
│   └── seed.sql
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have:
- Node.js 20 or later
- npm
- A Supabase account
- A GitHub account

### 1. Clone the repository

```bash
git clone https://github.com/Vishwak-8055/sneakerdrop.git

cd sneakerdrop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configure the required values from your Supabase project.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CURRENCY=INR
```

Use the exact variable names specified in `.env.example`.

**Security:** Only use the Supabase publishable/anon key in this application. Never expose service-role keys, database passwords, or private credentials through `NEXT_PUBLIC_` variables.

### 4. Configure Supabase

Create a Supabase project and open its SQL Editor.

Execute the following files in order:

**First: Database migration**

```text
supabase/migrations/20261030000000_init.sql
```

**Second: Sample data**

```text
supabase/seed.sql
```

Follow the authentication and admin provisioning instructions at the bottom of the migration.

### 5. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 6. Build for production

```bash
npm run build
```

---

## ☁️ Deployment

SneakerDrop is designed for deployment on Vercel.

### Deploy with Vercel

1. Push the project to GitHub.
2. Open Vercel and import the repository.
3. Select Next.js as the framework.
4. Configure the environment variables.
5. Deploy the application.
6. Update `NEXT_PUBLIC_SITE_URL` to your production domain.
7. Redeploy after changing build-time environment variables.

**Live deployment:** https://sneakerdrop-ovc8.vercel.app/

---

## 🖼️ Product Images

Product image assets are managed through Supabase Storage.

To add product images:

1. Open Supabase Storage.
2. Upload images to the public `product-images` bucket.
3. Add corresponding records to the `product_images` table.
4. Set `image_url` to the relevant storage object path.

Example:

```text
field-runner-01/front.jpg
```

The current seed data does not include product image assets.

---

## 🔐 Security

Security is built into the database and API architecture.

Current safeguards include:

- PostgreSQL Row Level Security.
- Restricted database permissions.
- Column-level write grants.
- Server-side request validation.
- Email normalization.
- Same-origin request checks.
- Honeypot spam protection.
- Unique database constraint on product and normalized email.
- Restricted waitlist data access.
- No service-role key in the application.

**Production consideration:** Rate limiting should be configured before opening the waitlist to significant public traffic. Vercel Firewall or Upstash are potential options.

---

## 🧪 Testing & Quality

The repository includes:

- TypeScript-based application code.
- Production build validation.
- GitHub Actions CI workflow.
- Supabase RLS smoke tests.
- Database constraints and security checks.

Run the production build:

```bash
npm run build
```

Run the database security checks using the provided SQL test files in `supabase/tests/`.

---

## 🗺️ Roadmap

The following capabilities are planned but are not yet implemented.

| Feature | Status |
|---|---|
| Premium storefront | Implemented |
| Sneaker discovery | Implemented |
| Product detail pages | Implemented |
| Waitlist API | Implemented |
| Supabase integration | Implemented |
| Database security | Implemented |
| Admin dashboard | Planned |
| Product CRUD interface | Planned |
| Image upload dashboard | Planned |
| Waitlist management | Planned |
| CSV export | Planned |
| Email confirmations | Planned |
| API rate limiting | Planned |
| Automated browser testing | Planned |
| Loading skeletons | Planned |

---

## 💡 Product Vision

SneakerDrop aims to make sneaker discovery more curated, engaging, and accessible.

The long-term vision is to evolve beyond a simple sneaker catalogue into a dedicated destination for sneaker enthusiasts — bringing product discovery, release awareness, and community engagement together.

---

## 👨‍💻 Author

**Vishwak Teja Ravula**

Full-Stack AI Engineer | Software Developer | Product Builder

- GitHub: [@Vishwak-8055](https://github.com/Vishwak-8055)
- Portfolio: [vishwak-8055.github.io/portfolio](https://vishwak-8055.github.io/portfolio/)

---

## 📄 License

Add a LICENSE file to this repository before specifying a distribution license.

---

<p align="center">
  **SneakerDrop — Discover Your Next Pair.**
</p>
