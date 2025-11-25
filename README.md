# Clear & Care Conversation Platform

A coaching application for educators navigating difficult conversations using the Clear & Care framework.

## Quick Deploy to Vercel

### 1. Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `clear-care-platform`
3. Keep it **Public** (or Private if you prefer)
4. Click **Create repository**
5. You'll see instructions - keep this page open

### 2. Upload This Code to GitHub

**Option A: Using GitHub's Upload Feature (Easiest)**
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop ALL the files from this folder
3. Click **"Commit changes"**

**Option B: Using Git Command Line**
```bash
cd clear-care-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clear-care-platform.git
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `clear-care-platform` repository
4. Before clicking Deploy, add your **Environment Variables**:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://rynayijfalelzcooggec.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase |
   | `ANTHROPIC_API_KEY` | Your Claude API key |

5. Click **Deploy**
6. Wait 2-3 minutes - your app will be live!

## Features

- **Conversation Prep Wizard** - Guided CARE and CLEAR preparation
- **AI-Powered Conversation Starters** - Claude generates personalized openers
- **Live Conversation Mode** - Timer, checklists, and note capture
- **Practice Scenarios** - Role-play with Claude AI
- **Warmth/Structure Quadrant** - Visual calibration tool
- **Post-Conversation Reflection** - Rate and improve

## The Framework

**CLEAR (Structure)**
- **C**ontext - Observable facts only
- **L**isten First - Questions before statements
- **E**xpectations - Specific, measurable
- **A**greements - Mutual accountability
- **R**evisit - Scheduled follow-up

**CARE (Warmth)**
- **C**onnection - Lead with relationship
- **A**cknowledge - Validate experience
- **R**espect - Assume positive intent
- **E**mpathy - Name the emotion

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Supabase (Database)
- Claude API (AI features)
- Vercel (Hosting)

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Add your credentials to .env.local
npm run dev
```

## Created By

J Fraser - Director of Educational Equity, Brooklyn Center Community Schools

---

© 2025 Clear & Care. All rights reserved.
