# Deploy Discord Music Bot to Render - Step by Step

## What You'll Get
Free 24/7 hosting for your Discord music bot on Render's free tier.

## Prerequisites
- GitHub account (free)
- Render account (free)
- Your Discord bot token and client ID

## Step 1: Download Your Bot Files
1. In this Replit project, click the three dots menu
2. Select "Download as zip"
3. Extract the zip file to your computer

## Step 2: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name it "discord-music-bot"
4. Make it public (required for free Render hosting)
5. Create repository

## Step 3: Upload Files to GitHub
1. Click "uploading an existing file"
2. Drag and drop all your bot files:
   - index.js
   - config.js
   - deploy-commands.js
   - commands/ folder
   - utils/ folder
   - render.yaml
   - README.md
   - .gitignore
3. Commit the files

## Step 4: Deploy on Render
1. Go to https://render.com
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"
4. Select "Connect a repository"
5. Choose your "discord-music-bot" repository
6. Configure deployment:
   - **Name**: discord-music-bot
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: node index.js
   - **Plan**: Free

## Step 5: Add Environment Variables
1. In Render dashboard, scroll to "Environment Variables"
2. Add these variables:
   - Key: `DISCORD_TOKEN` → Value: [Your Discord bot token]
   - Key: `CLIENT_ID` → Value: [Your Discord application ID]
3. Click "Create Web Service"

## Step 6: Deploy Slash Commands
1. Wait for initial deployment to complete
2. In Render dashboard, go to "Shell" tab
3. Run: `node deploy-commands.js`
4. You should see "Successfully reloaded application (/) commands"

## Step 7: Test Your Bot
Your bot is now online 24/7! Test it in Discord:
- `/music play [YouTube URL]`
- Use the interactive buttons
- Check the beautiful embeds

## Important Notes
- Render free tier has 750 hours/month (enough for 24/7)
- Your bot will have a random URL but Discord bots don't need web interface
- Keep your GitHub repository updated for any bot changes

## Troubleshooting
- If bot doesn't respond: Check environment variables in Render
- If commands missing: Run `node deploy-commands.js` in Shell
- If deployment fails: Check build logs in Render dashboard

Your Discord music bot is now running 24/7 for free!