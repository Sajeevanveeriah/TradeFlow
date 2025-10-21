# TradeFlow Quick Start Guide

**Get your SaaS running in under 2 hours!**

This is a condensed guide to get you from zero to deployed as quickly as possible. For detailed explanations, see [GETTING_STARTED.md](./GETTING_STARTED.md).

---

## ⚡ Prerequisites (15 minutes)

1. **Sign up for these accounts** (all have free tiers):
   - ✅ [Supabase](https://supabase.com) - Database
   - ✅ [Vercel](https://vercel.com) - Hosting
   - ✅ [Stripe](https://stripe.com) - Payments

2. **Install on your computer**:
   - ✅ [Node.js 18+](https://nodejs.org/) (includes npm)

---

## 🚀 Step 1: Local Setup (20 minutes)

### Clone & Install

```bash
# Clone repository
git clone https://github.com/Sajeevanveeriah/TradeFlow.git
cd TradeFlow

# Install dependencies (takes 2-3 minutes)
npm install
```

### Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Open .env in your text editor
# We'll fill it in next steps
```

---

## 🗄️ Step 2: Set Up Database (10 minutes)

### Create Supabase Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Settings:
   - Name: `tradeflow-production`
   - Password: Create a strong one (save it!)
   - Region: `Sydney`
4. Wait 2 minutes for setup

### Get Credentials

1. **Project Settings** → **API**:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJxxx...
   ```

2. **Project Settings** → **Database**:
   ```
   Connection string (URI): postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
   ```

### Update .env File

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Generate JWT Secret

```bash
# Run this command
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output to .env
JWT_SECRET=[paste-output-here]
```

### Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:push
```

You should see: ✅ "Your database is now in sync"

---

## 💳 Step 3: Set Up Stripe (15 minutes)

### Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test Mode**
3. Copy keys:
   ```
   Publishable key: pk_test_xxx
   Secret key: sk_test_xxx (click "Reveal")
   ```

### Update .env

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Create Products (Do this later - it's optional for testing)

Skip for now, you can test without subscription products. Add them before going live.

---

## ✅ Step 4: Validate Setup (2 minutes)

```bash
# Run validation script
npm run validate-env
```

You should see all ✅ green checks for required variables.

If you see ❌ errors, fix them before continuing.

---

## 🖥️ Step 5: Test Locally (10 minutes)

```bash
# Start development server
npm run dev
```

Open http://localhost:3000

### Test These Features:

1. ✅ Landing page loads
2. ✅ Click "Start Free Trial"
3. ✅ Create account with your email
4. ✅ Login works
5. ✅ Dashboard shows

**If all working, proceed to deployment!**

---

## ☁️ Step 6: Deploy to Vercel (20 minutes)

### Deploy via Dashboard

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `Sajeevanveeriah/TradeFlow`
4. Click **"Import"**

### Add Environment Variables

In Vercel project settings, add these variables (copy from your `.env`):

**Required:**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
DATABASE_URL=[your-database-url]
NEXT_PUBLIC_SUPABASE_URL=[your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
JWT_SECRET=[your-jwt-secret]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-stripe-pk]
STRIPE_SECRET_KEY=[your-stripe-sk]
```

**Note:** Don't add `NODE_ENV` - Vercel sets this automatically!

### Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL: `https://trade-flow-xxx.vercel.app`

---

## 🔗 Step 7: Configure Stripe Webhook (10 minutes)

**This is CRITICAL for payments to work!**

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://your-app.vercel.app/api/payments/webhook`
   - Use your actual Vercel URL!
4. Click **"Select events"** → Add these:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy **Signing secret** (starts with `whsec_`)

### Update Vercel Environment

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
3. Click **"Save"**

### Redeploy

1. Go to **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## 🎉 Step 8: Test Production (5 minutes)

1. Visit your Vercel URL
2. Sign up with a real email
3. Login to dashboard
4. Try creating a customer
5. Try creating a booking

### Test Payment (Optional)

Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## ✅ You're Live!

Your TradeFlow SaaS is now running in production! 🚀

**Your URLs:**
- Application: `https://your-app.vercel.app`
- Database: Supabase Dashboard
- Payments: Stripe Dashboard
- Deployments: Vercel Dashboard

---

## 📊 What's Working Now

- ✅ User authentication (signup/login)
- ✅ Customer CRM
- ✅ Booking management
- ✅ Quote generation with GST
- ✅ Dashboard with statistics
- ✅ Secure API endpoints
- ✅ Database with all tables
- ✅ Payment infrastructure (Stripe)

---

## 🔧 Optional Enhancements (Do Later)

### Custom Domain

1. Buy domain (e.g., tradeflow.com.au)
2. Vercel → Settings → Domains
3. Follow DNS configuration
4. Wait 24-48 hours

### SMS Reminders (Twilio)

1. Sign up at https://twilio.com
2. Buy Australian number (+61)
3. Add credentials to Vercel environment
4. Redeploy

### Email Notifications (SendGrid)

1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add credentials to Vercel environment
5. Redeploy

### Create Stripe Products

1. Stripe Dashboard → Products
2. Create 3 products:
   - Starter: $29 AUD/month
   - Professional: $59 AUD/month
   - Premium: $99 AUD/month
3. Copy Price IDs
4. Add to Vercel environment:
   ```
   STRIPE_PRICE_STARTER_MONTHLY=price_xxx
   STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
   STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
   ```
5. Redeploy

---

## 🐛 Common Issues

**Database connection fails:**
- Check DATABASE_URL is correct
- Verify Supabase project is active

**Login doesn't work:**
- Make sure JWT_SECRET is set
- Clear browser cache and try again

**Payment doesn't process:**
- Verify STRIPE_WEBHOOK_SECRET is set
- Check Stripe webhook is configured
- Make sure you redeployed after adding webhook secret

**Build fails on Vercel:**
- Check all environment variables are added
- Look at build logs for specific errors

---

## 📚 Next Steps

1. **Read the full guides:**
   - [GETTING_STARTED.md](./GETTING_STARTED.md) - Comprehensive setup
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment details
   - [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-launch checklist

2. **Go to production:**
   - Switch Stripe to Live Mode
   - Update environment variables
   - Test thoroughly

3. **Get customers:**
   - Reach out to tradies in your network
   - Share on social media
   - Join trade forums

---

## 💡 Pro Tips

- **Keep Test Mode on** until you have 5+ beta testers
- **Offer extended trials** (30 days) to early users
- **Get testimonials** from beta users
- **Join tradie Facebook groups** for marketing
- **Partner with trade suppliers** for referrals

---

## 🆘 Need Help?

- **GitHub Issues:** https://github.com/Sajeevanveeriah/TradeFlow/issues
- **Discussions:** https://github.com/Sajeevanveeriah/TradeFlow/discussions

---

## 🎯 Timeline Summary

| Task | Time |
|------|------|
| Prerequisites (account signup) | 15 min |
| Local setup | 20 min |
| Database configuration | 10 min |
| Stripe setup | 15 min |
| Validate & test locally | 12 min |
| Deploy to Vercel | 20 min |
| Configure webhook | 10 min |
| Test production | 5 min |
| **TOTAL** | **~2 hours** |

---

**You're ready to launch! 🚀**

Now go get your first customer and start building your SaaS empire!
