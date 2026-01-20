# Gemini API Key Setup

## Quick Setup Guide

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (it will be displayed)

### Step 2: Add API Key to Your Project

1. Open the `.env.local` file in the root directory
2. Add the following line:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** Replace `your_gemini_api_key_here` with your actual API key from Step 1.

### Step 3: Restart the Dev Server

After adding the API key:
1. Stop the dev server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 4: Test the Feature

1. Go to Admin Panel: `/en/admin` (or `/es/admin`, `/de/admin`)
2. Navigate to Fleet Management
3. Click "Generate Luxury Description" button on any yacht
4. The AI should generate a description using Gemini

## API Priority

The system will use:
1. **Gemini API** (if `GEMINI_API_KEY` is set) - Preferred
2. **OpenAI API** (if only `OPENAI_API_KEY` is set) - Fallback

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - your key won't be committed to git
- ⚠️ Never share your API key publicly
- 💰 Gemini Pro has generous free tier - check usage at [Google AI Studio](https://aistudio.google.com/)

## Troubleshooting

**Error: "API key not configured"**
- Make sure `.env.local` exists in the root directory
- Verify the key is correct
- Restart the dev server after adding the key

**Error: "Failed to generate description"**
- Check your Gemini account has quota/credits
- Verify the API key is valid
- Check the browser console for detailed error messages

## Cost Information

Gemini Pro version:
- Generous free tier available
- Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)
- The system uses `gemini-1.5-pro` model for high-quality descriptions
- With Pro version, you get better quality and more tokens
