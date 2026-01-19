# GitHub Setup Guide

## Step 1: Configure Git (if not already done)

Run these commands to set your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or for this repository only:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Create Initial Commit

The repository has been initialized and files are staged. Create your first commit:

```bash
git commit -m "Initial commit: Luxury yacht charter website with multi-language support"
```

## Step 3: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Repository name: `ship-charter-logistics`
5. Description: "Luxury yacht charter website for Balearic Islands and Costa Blanca"
6. Choose **Public** or **Private** (your preference)
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click **"Create repository"**

## Step 4: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/ship-charter-logistics.git

# Verify the remote was added
git remote -v
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 5: Push to GitHub

```bash
# Push your code to GitHub
git push -u origin main
```

If you're using `master` instead of `main`:

```bash
git branch -M main
git push -u origin main
```

## Step 6: Authentication

If prompted for authentication:
- **Personal Access Token**: Use a GitHub Personal Access Token (not your password)
- To create one: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Required scopes: `repo` (full control of private repositories)

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ship-charter-logistics.git
```

### If you need to change the branch name:
```bash
git branch -M main
```

### If authentication fails:
- Make sure you're using a Personal Access Token, not your password
- Check that the token has `repo` permissions

## Next Steps

After pushing:
1. Visit your repository on GitHub
2. Verify all files are there
3. Set up branch protection rules if needed
4. Add collaborators if working in a team
