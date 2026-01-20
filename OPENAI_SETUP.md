# OpenAI API Key Setup

## Quick Setup Guide

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (it starts with `sk-...`)

### Step 2: Add API Key to Your Project

1. Create a file named `.env.local` in the root directory (if it doesn't exist)
2. Add the following line:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Replace `sk-your-actual-api-key-here` with your actual API key from Step 1.

### Step 3: Restart the Dev Server

After adding the API key:
1. Stop the dev server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 4: Test the Feature

1. Go to Admin Panel: `/en/admin` (or `/es/admin`, `/de/admin`)
2. Navigate to Fleet Management
3. Click "Generate Luxury Description" button on any yacht
4. The AI should generate a description

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - your key won't be committed to git
- ⚠️ Never share your API key publicly
- 💰 OpenAI charges per API call - monitor your usage at [OpenAI Usage](https://platform.openai.com/usage)

## Troubleshooting

**Error: "OpenAI API key not configured"**
- Make sure `.env.local` exists in the root directory
- Verify the key starts with `sk-`
- Restart the dev server after adding the key

**Error: "Failed to generate description"**
- Check your OpenAI account has credits
- Verify the API key is valid
- Check the browser console for detailed error messages

## Cost Information

The AI Description Generator uses `gpt-4o-mini` model which is cost-effective:
- Approximately $0.15 per 1M input tokens
- Approximately $0.60 per 1M output tokens
- Each description generation uses ~1000 tokens (~$0.001 per generation)
