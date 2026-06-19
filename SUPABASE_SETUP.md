# Supabase Database Setup Guide

This guide will help you set up Supabase for the MIRROR application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" 
3. Choose your organization (or create one)
4. Fill in the project details:
   - **Name**: mirror-app (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your Credentials

1. Once your project is ready, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: Something like `https://xyzcompany.supabase.co`
   - **anon public key**: Something like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Configure Environment Variables

1. In your project root, create a `.env.local` file (if it doesn't exist):
```bash
cp .env.local.example .env.local
```

2. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (in the left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

This will create:
- `users` table with all required fields
- `wardrobe_items` table for clothing items
- `outfits` table for saved outfits
- Row Level Security (RLS) policies for data isolation
- Performance indexes for faster queries

## Step 5: Verify the Setup

1. In Supabase, go to **Table Editor** (in the left sidebar)
2. You should see three tables: `users`, `wardrobe_items`, `outfits`
3. Click on the `users` table to verify the schema

## Step 6: Test the Connection

1. Restart your development server:
```bash
npm run dev
```

2. Open the app at `http://localhost:3000`
3. Complete the onboarding flow
4. Check your Supabase dashboard > Table Editor > `users` table
5. You should see a new user record created

## Step 7: Enable Authentication (Optional)

For production, you'll want to enable proper authentication:

1. In Supabase, go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates if needed
4. Update the onboarding flow to use proper authentication

## Troubleshooting

**Issue**: "Connection refused" or "Failed to connect"
- **Solution**: Verify your Supabase URL and API key are correct in `.env.local`
- Make sure you copied the entire API key (it's long)

**Issue**: "Table does not exist"
- **Solution**: Make sure you ran the SQL schema in the SQL Editor
- Check for any errors in the SQL execution

**Issue**: "Permission denied"
- **Solution**: Verify RLS policies were created successfully
- Check the Authentication tab to ensure policies are enabled

**Issue**: TypeScript errors about Supabase
- **Solution**: Restart the TypeScript server in your IDE
- Run `npm install` again to ensure all dependencies are installed

## Database Schema Overview

### Users Table
- Stores user profile information
- Includes style DNA from AI analysis
- RLS ensures users can only see their own data

### Wardrobe Items Table
- Stores individual clothing items
- Includes AI-generated tags and cutout images
- Links to users table via user_id

### Outfits Table
- Stores saved outfit combinations
- Includes AI-generated outfit recommendations
- Links to users table via user_id

## Next Steps

Once your database is set up:
1. Test the onboarding flow end-to-end
2. Verify data is being saved to Supabase
3. Implement AI integration for body/face analysis
4. Add wardrobe upload functionality with AI cutout
5. Test the outfit generator

## Security Notes

- Never commit `.env.local` to version control
- The anon key is safe for client-side use with RLS enabled
- For production, consider using Row Level Security strictly
- Regularly rotate your database password
- Enable additional authentication providers as needed
