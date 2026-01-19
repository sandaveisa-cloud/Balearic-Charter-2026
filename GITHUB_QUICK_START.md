# Quick GitHub Setup

## ✅ Already Done:
- ✅ Git repository initialized
- ✅ .gitignore file created
- ✅ All files staged

## 📝 Next Steps:

### 1. Configure Git (if not done):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Create First Commit:
```bash
git commit -m "Initial commit: Luxury yacht charter website with multi-language support"
```

### 3. Create Repository on GitHub:
1. Go to https://github.com/new
2. Repository name: **ship-charter-logistics**
3. Choose Public or Private
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

### 4. Connect and Push:
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ship-charter-logistics.git

# Push to GitHub
git push -u origin main
```

**Note:** If you get an error about branch name, use:
```bash
git branch -M main
git push -u origin main
```

### 5. Authentication:
- Use a **Personal Access Token** (not password)
- Create token: GitHub → Settings → Developer settings → Personal access tokens
- Required scope: `repo`

Done! 🎉
