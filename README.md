# TradeFlow - Smart Scheduling & Booking Platform for Australian Tradies

A production-ready SaaS application built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Stripe. Designed specifically for Australian trade professionals to manage bookings, customers, quotes, and payments.

## Features

### Core Features (MVP)
- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **Customer CRM** - Manage customer database with full CRUD operations
- ✅ **Booking Management** - Schedule jobs with conflict detection and reminders
- ✅ **Quote Generation** - Create professional quotes with GST calculation
- ✅ **Payment Processing** - Stripe integration for online payments
- ✅ **SMS/Email Reminders** - Twilio and SendGrid integration
- ✅ **Subscription Tiers** - Starter ($29), Professional ($59), Premium ($99)
- ✅ **Australian Localization** - ABN validation, GST, Australian phone numbers

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod validation

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication

**Payments & Communications:**
- Stripe (payment processing)
- Twilio (SMS)
- SendGrid (email)

**Deployment:**
- Vercel (hosting)
- Supabase (database)

## 📚 Documentation

Choose your path:

- **🚀 [QUICKSTART.md](./QUICKSTART.md)** - Get deployed in under 2 hours (recommended for beginners)
- **📖 [GETTING_STARTED.md](./GETTING_STARTED.md)** - Comprehensive step-by-step guide with explanations
- **☁️ [DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed production deployment guide
- **✅ [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre-launch checklist

## Quick Start

**Want to get started immediately?** Follow our [QUICKSTART.md](./QUICKSTART.md) guide!

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (or Supabase account)
- Stripe account (for payments)
- Twilio account (for SMS - optional)
- SendGrid account (for email - optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sajeevanveeriah/TradeFlow.git
cd TradeFlow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+61412345678

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=hello@tradeflow.com.au
```

4. **Set up the database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

5. **Validate your environment**
```bash
# Check if everything is configured correctly
npm run validate-env
```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Need help?** See the [QUICKSTART.md](./QUICKSTART.md) guide for a step-by-step walkthrough.

## Project Structure

```
TradeFlow/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── customers/     # Customer CRM
│   │   │   ├── quotes/        # Quote generation
│   │   │   └── payments/      # Stripe payments
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   └── ui/                # UI components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # JWT utilities
│   │   ├── stripe.ts          # Stripe utilities
│   │   ├── email.ts           # SendGrid integration
│   │   ├── sms.ts             # Twilio integration
│   │   ├── validations.ts     # Zod schemas
│   │   ├── utils.ts           # Helper functions
│   │   ├── api-response.ts    # API response helpers
│   │   └── rate-limit.ts      # Rate limiting
│   └── middleware.ts          # Next.js middleware
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## API Documentation

### Authentication

#### POST /api/auth/signup
Register a new tradie account.

**Request:**
```json
{
  "email": "tradie@example.com",
  "password": "SecurePass123",
  "businessName": "Smith Electrical",
  "phone": "0412345678",
  "tradeType": "electrician",
  "abn": "12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### POST /api/auth/login
Login to existing account.

#### GET /api/auth/me
Get current user profile (requires auth).

### Customers

#### GET /api/customers
List all customers (paginated).

**Query Parameters:**
- `search` - Search by name, email, or phone
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

#### POST /api/customers
Create a new customer.

#### GET /api/customers/[id]
Get customer details with booking history.

#### PATCH /api/customers/[id]
Update customer.

#### DELETE /api/customers/[id]
Delete customer.

### Bookings

#### GET /api/bookings
List all bookings with filters.

**Query Parameters:**
- `status` - Filter by status (SCHEDULED, IN_PROGRESS, COMPLETED, etc.)
- `customerId` - Filter by customer
- `startDate` - Filter by date range (ISO 8601)
- `endDate` - Filter by date range (ISO 8601)

#### POST /api/bookings
Create a new booking with conflict detection.

#### GET /api/bookings/[id]
Get booking details.

#### PATCH /api/bookings/[id]
Update booking.

#### DELETE /api/bookings/[id]
Cancel booking (soft delete).

### Quotes

#### GET /api/quotes
List all quotes.

#### POST /api/quotes
Create a new quote with automatic GST calculation.

#### POST /api/quotes/[id]/send
Send quote to customer via email/SMS.

### Payments

#### POST /api/payments/create-intent
Create Stripe payment intent.

#### POST /api/payments/webhook
Stripe webhook handler (for production).

#### GET /api/payments
List all payments.

## Database Schema

See `prisma/schema.prisma` for the complete database schema including:

- **Users** - Tradie accounts with subscription management
- **Customers** - Customer CRM with contact details
- **Bookings** - Scheduled jobs with status tracking
- **Quotes** - Professional quotes with line items
- **Payments** - Payment transactions via Stripe
- **Reminders** - SMS/email reminders for bookings
- **TeamMembers** - Team management (Premium tier)
- **ActivityLog** - Audit trail for all actions

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Configure environment variables (copy from `.env`)
- Deploy

3. **Set up Stripe Webhook**
- In Stripe Dashboard, add webhook URL: `https://your-app.vercel.app/api/payments/webhook`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET` env var
- Redeploy

4. **Configure Custom Domain** (optional)
- In Vercel project settings, add custom domain (e.g., `tradeflow.com.au`)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Subscription Pricing

| Tier | Monthly | Yearly | Features |
|------|---------|--------|----------|
| **Starter** | $29 | $290 | Calendar, CRM, SMS reminders, 50 customers |
| **Professional** | $59 | $590 | + Quotes, Payments, 200 customers |
| **Premium** | $99 | $990 | + Team scheduling, Xero integration, unlimited |

All plans include:
- 14-day free trial
- No credit card required
- Cancel anytime

## Unit Economics

- **Gross Margin:** 96-98%
- **CAC Target:** $90
- **LTV:** $1,440 (24-month retention)
- **LTV:CAC Ratio:** 16:1
- **Operating Costs:** $178/month for 100 users

## Security Features

- ✅ JWT authentication with bcrypt password hashing
- ✅ Rate limiting on sensitive endpoints
- ✅ HTTPS only (enforced by Vercel)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (input sanitization)
- ✅ CSRF tokens
- ✅ Secure headers (X-Frame-Options, CSP)

## Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production (checks for errors)
npm run build
```

## Roadmap

### Phase 1: MVP (Weeks 1-6) ✅
- User authentication
- Customer CRM
- Booking management
- Quote generation
- Stripe payments
- SMS/Email reminders

### Phase 2: PMF (Weeks 7-24)
- [ ] Mobile app (React Native)
- [ ] Team scheduling (Premium tier)
- [ ] Materials tracking
- [ ] Xero integration
- [ ] hipages integration
- [ ] Advanced analytics

### Phase 3: Scale (Months 7-12)
- [ ] AI-powered scheduling optimization
- [ ] Route planning for multiple jobs
- [ ] Inventory management
- [ ] Customer portal
- [ ] API access for integrations

## Support

For issues and questions:
- GitHub Issues: https://github.com/Sajeevanveeriah/TradeFlow/issues
- GitHub Discussions: https://github.com/Sajeevanveeriah/TradeFlow/discussions
- Email: Open an issue on GitHub for fastest response

## License

Proprietary - All rights reserved

## Contributing

This is a SaaS application. Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

---

**Built with ❤️ for Australian tradies**
