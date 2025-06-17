# Discord Music Bot - Render Deployment Guide

A beautiful Discord music bot with YouTube playback, interactive buttons, and embedded UI.

## Features
- YouTube music streaming
- Beautiful embedded UI with emojis
- Interactive control buttons
- Queue management
- Volume controls
- Easy-to-use slash commands

## Deploy to Render (Free 24/7 Hosting)

### Step 1: Prepare Your Repository
1. Download all files from this Replit project
2. Create a new GitHub repository
3. Upload all files to your GitHub repository

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up for a free account
3. Connect your GitHub account

### Step 3: Deploy on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: discord-music-bot
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free

### Step 4: Add Environment Variables
In Render dashboard, add these environment variables:
- `DISCORD_TOKEN`: Your bot token
- `CLIENT_ID`: Your bot's application ID

### Step 5: Deploy Commands
After deployment, run this command once in Render's shell:
```bash
node deploy-commands.js
```

## Files Overview
- `index.js` - Main bot file
- `config.js` - Configuration
- `deploy-commands.js` - Slash command deployment
- `commands/music.js` - Music commands
- `utils/` - Helper utilities
- `render.yaml` - Render configuration

## Bot Commands
- `/music play <url>` - Play YouTube music
- `/music pause` - Pause current song
- `/music resume` - Resume playback
- `/music skip` - Skip current song
- `/music stop` - Stop and clear queue
- `/music queue` - Show current queue
- `/music nowplaying` - Show current song
- `/music volume <level>` - Set volume (0-100)

## Support
The bot includes interactive buttons for easy control and beautiful embeds for better user experience.