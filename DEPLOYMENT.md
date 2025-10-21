# TradeFlow Deployment Guide

This guide will help you deploy TradeFlow to production on Vercel with Supabase PostgreSQL.

## Prerequisites

Before deploying, make sure you have:

1. ✅ A Vercel account (https://vercel.com)
2. ✅ A Supabase account (https://supabase.com)
3. ✅ A Stripe account (https://stripe.com)
4. ✅ A Twilio account (https://twilio.com) - optional for SMS
5. ✅ A SendGrid account (https://sendgrid.com) - optional for email
6. ✅ Your code pushed to GitHub

## Step 1: Set Up Supabase Database

1. **Create a new Supabase project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Choose a name: `tradeflow-production`
   - Select region: `Sydney (ap-southeast-1)` for Australian users
   - Set a strong database password
   - Wait for project to be provisioned (~2 minutes)

2. **Get database credentials**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI mode)
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

3. **Get Supabase API credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
     - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
     - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

## Step 2: Set Up Stripe

1. **Create Stripe account** (or use existing)
   - Go to https://dashboard.stripe.com
   - Switch to "Test mode" for testing
   - Later, switch to "Live mode" for production

2. **Get API keys**
   - Go to Developers → API keys
   - Copy:
     - Publishable key (starts with `pk_test_` or `pk_live_`)
     - Secret key (starts with `sk_test_` or `sk_live_`)

3. **Create subscription products**
   - Go to Products → Add product
   - Create three products:
     - **Starter**: $29 AUD/month
     - **Professional**: $59 AUD/month
     - **Premium**: $99 AUD/month
   - Copy each Price ID (starts with `price_`)

4. **Create webhook endpoint** (do this AFTER deploying to Vercel)
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/payments/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook secret (starts with `whsec_`)

## Step 3: Set Up Twilio (Optional - for SMS)

1. **Create Twilio account**
   - Go to https://www.twilio.com/try-twilio
   - Verify your phone number

2. **Get Australian phone number**
   - Go to Phone Numbers → Buy a number
   - Choose country: Australia (+61)
   - Select a mobile number (starts with +614)
   - Purchase number (~$1-2/month)

3. **Get credentials**
   - Go to Console Dashboard
   - Copy:
     - Account SID
     - Auth Token

## Step 4: Set Up SendGrid (Optional - for Email)

1. **Create SendGrid account**
   - Go to https://signup.sendgrid.com
   - Complete verification

2. **Create API key**
   - Go to Settings → API Keys
   - Create API key with "Full Access"
   - Copy the key (starts with `SG.`)

3. **Verify sender email**
   - Go to Settings → Sender Authentication
   - Verify your domain or single sender email
   - Use this email as `SENDGRID_FROM_EMAIL`

## Step 5: Deploy to Vercel

1. **Push code to GitHub**
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

2. **Import project to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Click "Import"

3. **Configure environment variables**

In Vercel project settings → Environment Variables, add:

```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=TradeFlow

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=generate-a-random-64-character-string
JWT_EXPIRES_IN=24h

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (get this after creating webhook)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...

# Twilio (optional)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+61412345678

# SendGrid (optional)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=hello@tradeflow.com.au
SENDGRID_FROM_NAME=TradeFlow

# Feature Flags
ENABLE_SMS_REMINDERS=true
ENABLE_EMAIL_REMINDERS=true
TRIAL_DAYS=14
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

5. **Run database migrations**

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run Prisma migration
vercel env pull .env.production
npx prisma migrate deploy
```

Or use Vercel dashboard:
- Go to Deployments → [Latest Deployment] → More → Redeploy

## Step 6: Set Up Custom Domain (Optional)

1. **Add domain in Vercel**
   - Go to Project Settings → Domains
   - Add domain: `tradeflow.com.au`
   - Follow DNS configuration instructions

2. **Configure DNS**
   - Add A record pointing to Vercel's IP
   - Or add CNAME record pointing to `cname.vercel-dns.com`

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificate
   - Wait ~24-48 hours for DNS propagation

## Step 7: Update Stripe Webhook

Now that your app is deployed:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL to: `https://your-app.vercel.app/api/payments/webhook`
3. Copy webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
5. Redeploy

## Step 8: Test the Deployment

1. **Create a test account**
   - Go to https://your-app.vercel.app/signup
   - Sign up with test email
   - Verify you can login

2. **Test API endpoints**
```bash
# Replace with your deployed URL and token
curl https://your-app.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Test Stripe payment** (use test cards)
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

4. **Check logs**
   - Go to Vercel Dashboard → Deployments → [Latest] → Functions
   - Monitor for any errors

## Step 9: Monitoring & Analytics

1. **Enable Vercel Analytics**
   - Go to Project Settings → Analytics
   - Enable Web Analytics

2. **Set up Sentry** (optional - for error tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

3. **Set up logging**
   - Use Vercel logs for function monitoring
   - Set up alerts for errors

## Production Checklist

Before launching:

- [ ] Environment variables are set correctly
- [ ] Database migrations have run successfully
- [ ] Stripe is in **Live mode** (not test mode)
- [ ] Webhook endpoint is configured and working
- [ ] Custom domain is connected (if using)
- [ ] SSL certificate is active
- [ ] Test user signup flow
- [ ] Test booking creation
- [ ] Test payment processing
- [ ] Test email reminders (if enabled)
- [ ] Test SMS reminders (if enabled)
- [ ] All API endpoints return expected responses
- [ ] Error pages are working (404, 500)
- [ ] Rate limiting is enabled
- [ ] Security headers are set

## Troubleshooting

### Build fails with Prisma error
```bash
# In vercel.json, ensure build command includes prisma generate
"buildCommand": "prisma generate && next build"
```

### Environment variables not working
- Make sure they're added in Vercel Dashboard → Environment Variables
- Redeploy after adding new variables
- Check variable names match exactly

### Stripe webhook not receiving events
- Verify webhook URL is correct
- Check webhook secret matches
- Test webhook in Stripe Dashboard → Developers → Webhooks → Test webhook

### Database connection error
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure connection string includes password

### SMS not sending
- Verify Twilio credentials
- Check phone number format (+61412345678)
- Ensure Twilio account has credit

## Scaling

As your user base grows:

1. **Database**
   - Supabase automatically scales
   - Upgrade to Pro plan for more connections
   - Enable connection pooling

2. **Vercel**
   - Free tier: Good for MVP (100GB bandwidth)
   - Pro tier: $20/month (1TB bandwidth)
   - Enterprise: Custom pricing

3. **Monitoring**
   - Set up alerts for 500 errors
   - Monitor database query performance
   - Track API response times

## Cost Estimate (First 100 Users)

- Vercel: $0 (Free tier) or $20/month (Pro)
- Supabase: $0 (Free tier) or $25/month (Pro)
- Stripe: 1.75% + $0.30 per transaction
- Twilio: ~$0.05 per SMS
- SendGrid: $0 (Free tier up to 100 emails/day)

**Total:** ~$0-50/month for first 100 users

## Support

For deployment issues:
- Email: support@tradeflow.com.au
- GitHub: https://github.com/your-username/tradeflow/issues

---

**Deployment complete! Your TradeFlow app is now live.**
