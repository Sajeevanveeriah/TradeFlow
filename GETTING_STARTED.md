# Getting Started with TradeFlow

This guide will walk you through setting up TradeFlow from scratch to having a fully functional SaaS application running in production.

## 📋 Table of Contents

1. [What You Need](#what-you-need)
2. [Step 1: Set Up Your Accounts](#step-1-set-up-your-accounts)
3. [Step 2: Local Development Setup](#step-2-local-development-setup)
4. [Step 3: Configure Your Database](#step-3-configure-your-database)
5. [Step 4: Set Up Payment Processing](#step-4-set-up-payment-processing)
6. [Step 5: Deploy to Production](#step-5-deploy-to-production)
7. [Step 6: Post-Deployment Configuration](#step-6-post-deployment-configuration)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## What You Need

### Required (Free Tiers Available)
- ✅ **GitHub Account** - You already have this!
- ✅ **Node.js 18+** - [Download here](https://nodejs.org/)
- ✅ **Supabase Account** - [Sign up](https://supabase.com) (Free tier: Unlimited API requests, 500MB database)
- ✅ **Vercel Account** - [Sign up](https://vercel.com) (Free tier: Unlimited deployments)
- ✅ **Stripe Account** - [Sign up](https://stripe.com) (No monthly fee, pay per transaction)

### Optional (Recommended for Full Features)
- ⚠️ **Twilio Account** - For SMS reminders (~$0.05 per SMS)
- ⚠️ **SendGrid Account** - For emails (Free tier: 100 emails/day)

**Total Monthly Cost to Start**: $0 (using free tiers)

---

## Step 1: Set Up Your Accounts

### 1.1 Create Supabase Project (5 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `tradeflow-production`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: `Sydney` (closest to Australian users)
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

**Save these credentials** (you'll need them later):
- Project URL (looks like: `https://xxxxx.supabase.co`)
- Anon/Public Key (starts with `eyJ...`)
- Service Role Key (starts with `eyJ...`)
- Database Connection String

To find them:
- Go to **Project Settings** → **API**
- Copy the `URL` and `anon` key
- Go to **Project Settings** → **Database**
- Copy the `Connection string` (URI mode)

### 1.2 Create Vercel Account (2 minutes)

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 1.3 Create Stripe Account (10 minutes)

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up and complete verification
3. For Australian business:
   - Set your country to **Australia**
   - Provide ABN (optional for testing)
   - Add bank account (for payouts)

**Important**: Start in **Test Mode** (toggle in top right)

---

## Step 2: Local Development Setup

### 2.1 Clone the Repository

```bash
# Clone your repository
git clone https://github.com/Sajeevanveeriah/TradeFlow.git
cd TradeFlow
```

### 2.2 Install Dependencies

```bash
# Install all packages
npm install
```

This will install:
- Next.js and React
- Prisma (database)
- Stripe SDK
- All other dependencies (~200MB, takes 2-3 minutes)

### 2.3 Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Now open `.env` in your text editor and fill in the values:

```env
# ====================
# REQUIRED SETTINGS
# ====================

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TradeFlow

# Database (from Supabase - Step 1.1)
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# Supabase (from Supabase - Step 1.1)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Your anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Your service role key

# JWT Secret (generate a random string)
# You can use this command to generate one:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-random-64-character-string-here
JWT_EXPIRES_IN=24h

# Stripe (we'll fill these in Step 4)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Leave empty for now

# ====================
# OPTIONAL SETTINGS (can skip for now)
# ====================

# Twilio (SMS) - Optional
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# SendGrid (Email) - Optional
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=TradeFlow

# Feature Flags
ENABLE_SMS_REMINDERS=false
ENABLE_EMAIL_REMINDERS=false
TRIAL_DAYS=14
```

**Generate JWT Secret**:
```bash
# Run this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as your `JWT_SECRET`.

---

## Step 3: Configure Your Database

### 3.1 Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the Prisma client based on your schema.

### 3.2 Push Database Schema to Supabase

```bash
npm run prisma:push
```

This will:
- Create all database tables
- Set up relationships
- Add indexes

You should see output like:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

### 3.3 Verify Database (Optional)

Open Prisma Studio to view your database:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can see all your tables:
- users
- customers
- bookings
- quotes
- payments
- reminders
- team_members
- activity_logs

---

## Step 4: Set Up Payment Processing

### 4.1 Get Stripe API Keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (click "Reveal test key", starts with `sk_test_`)

4. Add to your `.env` file:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 4.2 Create Subscription Products

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**

**Create Product 1: Starter**
- Name: `TradeFlow Starter`
- Description: `For solo tradies getting started`
- Pricing:
  - Price: `29` AUD
  - Billing period: `Monthly`
  - Payment type: `Recurring`
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

**Create Product 2: Professional**
- Name: `TradeFlow Professional`
- Description: `For growing trade businesses`
- Pricing: `59` AUD monthly
- Copy the Price ID

**Create Product 3: Premium**
- Name: `TradeFlow Premium`
- Description: `For established businesses with teams`
- Pricing: `99` AUD monthly
- Copy the Price ID

### 4.3 Add Price IDs to Environment

Add these to your `.env`:
```env
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxxxx
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxx
```

---

## Step 5: Deploy to Production

### 5.1 Test Locally First

Before deploying, make sure everything works:

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test these features**:
1. ✅ Landing page loads
2. ✅ Click "Start Free Trial" → Sign up page
3. ✅ Create an account (use a real email)
4. ✅ Login with your account
5. ✅ Dashboard loads with statistics
6. ✅ Navigate to Customers, Bookings, Quotes

If everything works, you're ready to deploy! If you encounter errors, see the [Troubleshooting](#troubleshooting) section.

### 5.2 Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Find `Sajeevanveeriah/TradeFlow` and click **"Import"**
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

5. Click **"Environment Variables"**
6. Add all variables from your `.env` file:
   - Click **"Add"** for each variable
   - **Important**: Don't include `NODE_ENV` (Vercel sets this automatically)
   - For `NEXT_PUBLIC_APP_URL`, use: `https://your-project.vercel.app` (or your custom domain)

7. Click **"Deploy"**
8. Wait 2-3 minutes for deployment

You'll get a URL like: `https://trade-flow-xxxxx.vercel.app`

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? TradeFlow
# - Directory? ./
# - Override settings? No

# Then deploy to production
vercel --prod
```

---

## Step 6: Post-Deployment Configuration

### 6.1 Set Up Stripe Webhook (IMPORTANT!)

This is critical for handling payments and subscriptions.

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://your-app.vercel.app/api/payments/webhook`
   - Replace `your-app.vercel.app` with your actual Vercel URL
4. Description: `TradeFlow Payment Webhook`
5. Click **"Select events"**
6. Add these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Click **"Add endpoint"**
8. Copy the **Signing secret** (starts with `whsec_`)

9. Add to Vercel environment variables:
   - Go to your project settings in Vercel
   - Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`
   - Click **"Save"**

10. **Redeploy** your application:
    - Go to Deployments
    - Click "..." on the latest deployment
    - Click "Redeploy"

### 6.2 Test Your Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Click **"Start Free Trial"**
3. Create a test account
4. You should be redirected to the dashboard

**Test Payment** (optional):
1. In your dashboard, try to create a quote
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

### 6.3 Set Up Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In Vercel:
   - Go to your project
   - Settings → Domains
   - Add your domain (e.g., `tradeflow.com.au`)
3. Follow the DNS configuration instructions
4. Wait 24-48 hours for DNS propagation
5. Vercel automatically provisions SSL certificate

---

## Troubleshooting

### "Prisma Client did not initialize yet"

**Solution**: Run `npm run prisma:generate` again

### "Database connection failed"

**Solution**:
1. Check your `DATABASE_URL` is correct
2. Make sure your Supabase project is active
3. Verify the password in the connection string

### "Invalid JWT token"

**Solution**:
1. Make sure `JWT_SECRET` is set in your `.env`
2. Clear your browser localStorage and login again

### "Stripe error: No API key provided"

**Solution**:
1. Verify `STRIPE_SECRET_KEY` is in your `.env`
2. Make sure you're using the **test** key (starts with `sk_test_`)

### Build fails on Vercel

**Solution**:
1. Check all environment variables are set in Vercel
2. Look at the build logs for specific errors
3. Make sure `DATABASE_URL` is accessible from Vercel

### SMS/Email not sending

**Solution**:
- SMS and email are optional. If not configured, the app will log warnings but continue working.
- To enable, set up Twilio and SendGrid accounts and add their credentials.

---

## Next Steps

### 1. Set Up Optional Services

#### Enable SMS Reminders (Twilio)

1. Sign up at [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Get a phone number:
   - Console → Phone Numbers → Buy a number
   - Choose **Australia (+61)**
   - Select a mobile number
3. Get credentials:
   - Account SID (from Console Dashboard)
   - Auth Token (from Console Dashboard)
4. Add to Vercel environment variables:
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+61412345678
ENABLE_SMS_REMINDERS=true
```
5. Redeploy

#### Enable Email Notifications (SendGrid)

1. Sign up at [https://signup.sendgrid.com](https://signup.sendgrid.com)
2. Verify your email
3. Create an API key:
   - Settings → API Keys → Create API Key
   - Choose "Full Access"
4. Verify sender email:
   - Settings → Sender Authentication
   - Verify single sender (use your email)
5. Add to Vercel environment variables:
```env
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=hello@yourdomain.com
SENDGRID_FROM_NAME=TradeFlow
ENABLE_EMAIL_REMINDERS=true
```
6. Redeploy

### 2. Switch to Production Mode

When you're ready to accept real payments:

1. **Stripe**: Switch to Live Mode
   - Dashboard → Toggle "Test Mode" to "Live Mode"
   - Get new API keys
   - Create products again in live mode
   - Update Vercel environment variables

2. **Update Environment**:
```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

3. **Test thoroughly** before announcing!

### 3. Marketing & Growth

Now that your app is live, focus on:

1. **Get Your First Customer**
   - Reach out to tradies in your network
   - Offer extended trial (30 days instead of 14)
   - Get feedback and testimonials

2. **Content Marketing**
   - Write blog posts about tradie business tips
   - Create how-to videos
   - Share on LinkedIn, Facebook groups

3. **SEO Optimization**
   - Add meta descriptions
   - Create sitemap
   - Submit to Google Search Console

4. **Partnerships**
   - Contact trade associations
   - Partner with trade suppliers
   - Integrate with hipages

### 4. Monitoring

Set up monitoring to track issues:

**Vercel Analytics**:
- Go to your project → Analytics tab
- Enable Web Analytics (free)

**Sentry** (Error Tracking):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Uptime Monitoring**:
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Monitor your URL every 5 minutes

---

## Production Checklist

Before launching to customers:

- [ ] All environment variables set in Vercel
- [ ] Database migrations completed
- [ ] Stripe webhook configured and tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Test user signup flow
- [ ] Test booking creation
- [ ] Test quote generation
- [ ] Test payment processing (with test card)
- [ ] Email reminders working (if enabled)
- [ ] SMS reminders working (if enabled)
- [ ] Error pages working (404, 500)
- [ ] Mobile responsive design tested
- [ ] Security headers verified
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] Support email/contact configured

---

## Estimated Timeline

- **Setup accounts**: 30 minutes
- **Local development**: 20 minutes
- **Database configuration**: 10 minutes
- **Deploy to Vercel**: 15 minutes
- **Configure Stripe**: 20 minutes
- **Post-deployment setup**: 15 minutes

**Total**: ~2 hours to go from zero to live application!

---

## Cost Summary

### Development/Testing (Free)
- Vercel: Free tier
- Supabase: Free tier (500MB database)
- Stripe: No monthly fee (test mode)
- **Total**: $0/month

### Production (First 100 Users)
- Vercel: Free tier (or $20/month Pro for custom domain)
- Supabase: Free tier or $25/month Pro (for backups)
- Stripe: 1.75% + $0.30 per transaction
- Twilio (optional): ~$0.05 per SMS
- SendGrid (optional): Free tier (100 emails/day)
- **Estimated**: $0-50/month

### At Scale (1,000 Users)
- Vercel: $20/month (Pro plan)
- Supabase: $25/month (Pro plan)
- Stripe: Transaction fees (~$150-300/month based on volume)
- Twilio: ~$50/month (1,000 SMS)
- SendGrid: $15/month (40,000 emails)
- **Estimated**: $260-410/month
- **Revenue**: ~$53,000/month (1,000 users × $53 avg)
- **Net Profit**: ~$52,600/month (98% margin)

---

## Need Help?

- **GitHub Issues**: [Report a bug](https://github.com/Sajeevanveeriah/TradeFlow/issues)
- **GitHub Discussions**: [Ask a question](https://github.com/Sajeevanveeriah/TradeFlow/discussions)
- **Documentation**: This guide + README.md + DEPLOYMENT.md

---

**You're ready to launch! 🚀**

Follow this guide step-by-step, and you'll have a fully functional SaaS application running in production within 2 hours.

Good luck with TradeFlow!
