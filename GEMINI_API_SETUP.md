# Gemini API Key Setup Guide

This guide will help you set up the Google Gemini API key for the Balearic Yacht Charters AI Assistant.

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy your API key (it should start with `AIza...`)

## Step 2: Add API Key to Local Environment

1. Open or create `.env.local` file in the project root directory
2. Add the following line:
   ```
   GEMINI_API_KEY=AIza...your_actual_api_key_here
   ```
3. Replace `AIza...your_actual_api_key_here` with your actual API key from Step 1
4. Save the file

## Step 3: Restart Development Server

After adding the API key, you **must restart** your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test the AI Assistant

1. Navigate to the Admin Panel: `http://localhost:3000/admin`
2. Find the **AI Assistant** component on the dashboard
3. Try asking a question like: "Translate 'luxury yacht charter' to Spanish"
4. If configured correctly, you should receive a response

## Troubleshooting

### Error: "API Key not configured"
- **Solution**: Make sure `GEMINI_API_KEY` is in your `.env.local` file
- **Solution**: Restart your dev server after adding the key
- **Solution**: Check that the file is named exactly `.env.local` (not `.env` or `.env.example`)

### Error: "Invalid API Key format"
- **Solution**: Your API key should start with `AIza`
- **Solution**: Make sure you copied the entire key without extra spaces
- **Solution**: Get a new API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Error: "Invalid API Key" or "Access Forbidden"
- **Solution**: Verify your API key is correct in Google AI Studio
- **Solution**: Check that your API key has the necessary permissions
- **Solution**: Make sure you haven't exceeded your API quota

### Error: "Rate limit exceeded"
- **Solution**: Wait a few minutes and try again
- **Solution**: Check your usage limits at [Google AI Studio](https://aistudio.google.com/)

## Step 5: Deploy to Vercel (Production)

**IMPORTANT**: You must also add the API key to your Vercel project:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Balearic Yacht Charters**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your API key (starting with `AIza...`)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application for the changes to take effect

## Security Notes

- ⚠️ **Never commit** `.env.local` to Git (it's already in `.gitignore`)
- ⚠️ **Never share** your API key publicly
- ⚠️ The API key is server-side only (not exposed to the browser)
- ✅ API key is stored securely in Vercel Environment Variables for production

## API Usage & Limits

- Google Gemini API has a generous free tier
- Check your usage and limits at [Google AI Studio](https://aistudio.google.com/)
- The AI Assistant uses the `gemini-1.5-flash` model for fast responses

## Support

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Check the server logs for API errors
3. Verify your API key is active in Google AI Studio
4. Ensure your dev server was restarted after adding the key
