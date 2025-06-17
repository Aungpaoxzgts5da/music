const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Enhanced embed utilities for Discord music bot
 * Provides additional embed templates and formatting helpers
 */

// Color scheme for different embed types
const COLORS = {
    PRIMARY: '#FF6B9D',
    SUCCESS: '#51CF66',
    WARNING: '#FFA500',
    ERROR: '#FF6B6B',
    INFO: '#4ECDC4',
    MUSIC: '#9C88FF',
    QUEUE: '#4ECDC4'
};

// Emoji constants for consistent styling
const EMOJIS = {
    MUSIC: '🎵',
    PLAY: '▶️',
    PAUSE: '⏸️',
    STOP: '⏹️',
    SKIP: '⏭️',
    PREVIOUS: '⏮️',
    SHUFFLE: '🔀',
    REPEAT: '🔁',
    VOLUME: '🔊',
    QUEUE: '📋',
    HEART: '💖',
    FIRE: '🔥',
    STAR: '⭐',
    WAVE: '🌊',
    HEADPHONES: '🎧',
    MICROPHONE: '🎤',
    MUSICAL_NOTE: '🎶',
    RADIO: '📻',
    CD: '💿',
    VINYL: '🎵',
    GUITAR: '🎸',
    PIANO: '🎹',
    TRUMPET: '🎺',
    DRUM: '🥁',
    VIOLIN: '🎻'
};

/**
 * Creates a welcome embed for when the bot joins a server
 */
function createWelcomeEmbed() {
    return new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle(`${EMOJIS.MUSIC} Welcome to Music Bot!`)
        .setDescription('🎉 Thanks for adding me to your server! I\'m here to bring amazing music to your voice channels.')
        .addFields(
            { 
                name: `${EMOJIS.MUSICAL_NOTE} Getting Started`, 
                value: 'Use `/music play <YouTube URL>` to start playing music!', 
                inline: false 
            },
            { 
                name: `${EMOJIS.HEADPHONES} Features`, 
                value: '• High-quality audio streaming\n• Interactive button controls\n• Queue management\n• Volume control\n• Beautiful embeds', 
                inline: true 
            },
            { 
                name: `${EMOJIS.FIRE} Commands`, 
                value: '• `/music play` - Play a song\n• `/music queue` - View queue\n• `/music skip` - Skip current song\n• `/music stop` - Stop playback', 
                inline: true 
            }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/742043325513900062.png')
        .setFooter({ 
            text: 'Enjoy your musical journey! 🎶', 
            iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png' 
        })
        .setTimestamp();
}

/**
 * Creates a loading embed for when processing requests
 */
function createLoadingEmbed(action = 'Processing') {
    return new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`${EMOJIS.WAVE} ${action}...`)
        .setDescription('Please wait while I work on your request.')
        .addFields({
            name: `${EMOJIS.RADIO} Status`,
            value: '🔄 Loading...',
            inline: true
        })
        .setTimestamp();
}

/**
 * Creates a connection status embed
 */
function createConnectionEmbed(voiceChannel, status = 'connected') {
    const isConnected = status === 'connected';
    const color = isConnected ? COLORS.SUCCESS : COLORS.WARNING;
    const emoji = isConnected ? '🔗' : '⚠️';
    const title = isConnected ? 'Connected to Voice Channel' : 'Disconnected from Voice Channel';
    
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(`${emoji} ${title}`)
        .setDescription(`${isConnected ? 'Successfully connected to' : 'Disconnected from'} **${voiceChannel.name}**`)
        .addFields({
            name: `${EMOJIS.HEADPHONES} Channel Info`,
            value: `👥 ${voiceChannel.members.size} members\n🔊 Bitrate: ${voiceChannel.bitrate / 1000}kbps`,
            inline: true
        })
        .setTimestamp();
}

/**
 * Creates an enhanced now playing embed with progress bar
 */
function createNowPlayingEmbed(song, progress = null) {
    const embed = new EmbedBuilder()
        .setColor(COLORS.MUSIC)
        .setTitle(`${EMOJIS.MUSICAL_NOTE} Now Playing`)
        .setDescription(`**${song.title}**`)
        .setThumbnail(song.thumbnail || 'https://via.placeholder.com/120x90/9C88FF/FFFFFF?text=🎵')
        .addFields(
            { name: `${EMOJIS.VOLUME} Duration`, value: song.duration || 'Unknown', inline: true },
            { name: `${EMOJIS.MICROPHONE} Requested by`, value: song.requestedBy.toString(), inline: true },
            { name: `${EMOJIS.FIRE} Views`, value: song.views || 'Unknown', inline: true }
        )
        .setFooter({ 
            text: `${EMOJIS.HEART} Enjoy the music! Use the buttons below to control playback.`, 
            iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png' 
        })
        .setTimestamp();

    if (progress) {
        embed.addFields({
            name: `${EMOJIS.WAVE} Progress`,
            value: createProgressBar(progress.current, progress.total),
            inline: false
        });
    }

    return embed;
}

/**
 * Creates a progress bar string
 */
function createProgressBar(current, total, length = 20) {
    const percentage = Math.min(current / total, 1);
    const filled = Math.round(length * percentage);
    const empty = length - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const currentTime = formatTime(current);
    const totalTime = formatTime(total);
    
    return `\`${currentTime} ${bar} ${totalTime}\``;
}

/**
 * Formats time in seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Creates an advanced queue embed with pagination
 */
function createAdvancedQueueEmbed(songs, currentSong, page = 1, songsPerPage = 10) {
    const totalPages = Math.ceil(songs.length / songsPerPage);
    const startIndex = (page - 1) * songsPerPage;
    const endIndex = Math.min(startIndex + songsPerPage, songs.length);
    const pageSeongs = songs.slice(startIndex, endIndex);
    
    const embed = new EmbedBuilder()
        .setColor(COLORS.QUEUE)
        .setTitle(`${EMOJIS.QUEUE} Music Queue - Page ${page}/${totalPages}`)
        .setTimestamp();

    if (currentSong) {
        embed.addFields({
            name: `${EMOJIS.MUSICAL_NOTE} Currently Playing`,
            value: `**${currentSong.title}**\n${EMOJIS.MICROPHONE} ${currentSong.requestedBy} • ${EMOJIS.VOLUME} ${currentSong.duration}`,
            inline: false
        });
    }

    if (pageSeongs.length > 0) {
        const queueList = pageSeongs.map((song, index) => {
            const position = startIndex + index + 1;
            return `**${position}.** ${song.title}\n${EMOJIS.MICROPHONE} ${song.requestedBy} • ${EMOJIS.VOLUME} ${song.duration}`;
        }).join('\n\n');

        embed.addFields({
            name: `${EMOJIS.FIRE} Queue (${songs.length} songs)`,
            value: queueList,
            inline: false
        });
    } else {
        embed.addFields({
            name: `${EMOJIS.STAR} Queue Status`,
            value: 'No songs in queue',
            inline: false
        });
    }

    embed.setFooter({
        text: `${EMOJIS.HEART} Total: ${songs.length} songs • Page ${page}/${totalPages}`,
        iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png'
    });

    return embed;
}

/**
 * Creates an error embed with detailed information
 */
function createDetailedErrorEmbed(error, context = '') {
    const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle(`❌ Oops! Something went wrong`)
        .setDescription('We encountered an issue while processing your request.')
        .addFields({
            name: `${EMOJIS.FIRE} Error Details`,
            value: error.message || 'Unknown error occurred',
            inline: false
        })
        .setTimestamp()
        .setFooter({ 
            text: 'If this issue persists, please contact support.',
            iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png'
        });

    if (context) {
        embed.addFields({
            name: `${EMOJIS.INFO} Context`,
            value: context,
            inline: false
        });
    }

    return embed;
}

/**
 * Creates a success embed with celebration
 */
function createCelebrationEmbed(title, description, details = null) {
    const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`${EMOJIS.STAR} ${title}`)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ 
            text: `${EMOJIS.HEART} Success! Keep enjoying the music!`,
            iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png'
        });

    if (details) {
        embed.addFields({
            name: `${EMOJIS.FIRE} Details`,
            value: details,
            inline: false
        });
    }

    return embed;
}

/**
 * Creates enhanced control buttons with tooltips
 */
function createEnhancedControlButtons(isPlaying = true, hasQueue = false) {
    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('play_pause')
                .setLabel(isPlaying ? 'Pause' : 'Play')
                .setStyle(ButtonStyle.Primary)
                .setEmoji(isPlaying ? EMOJIS.PAUSE : EMOJIS.PLAY),
            new ButtonBuilder()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(EMOJIS.SKIP)
                .setDisabled(!hasQueue),
            new ButtonBuilder()
                .setCustomId('stop')
                .setLabel('Stop')
                .setStyle(ButtonStyle.Danger)
                .setEmoji(EMOJIS.STOP),
            new ButtonBuilder()
                .setCustomId('shuffle')
                .setLabel('Shuffle')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(EMOJIS.SHUFFLE)
                .setDisabled(!hasQueue),
            new ButtonBuilder()
                .setCustomId('queue')
                .setLabel('Queue')
                .setStyle(ButtonStyle.Success)
                .setEmoji(EMOJIS.QUEUE)
        );

    return [row1];
}

/**
 * Creates volume control buttons
 */
function createVolumeButtons(currentVolume = 50) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('volume_down')
                .setLabel('Vol -')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔉')
                .setDisabled(currentVolume <= 0),
            new ButtonBuilder()
                .setCustomId('volume_up')
                .setLabel('Vol +')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔊')
                .setDisabled(currentVolume >= 100),
            new ButtonBuilder()
                .setCustomId('mute')
                .setLabel('Mute')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔇')
        );
}

/**
 * Creates help embed with all available commands
 */
function createHelpEmbed() {
    return new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`${EMOJIS.MUSICAL_NOTE} Music Bot Commands`)
        .setDescription('Here are all the available commands to control your music experience!')
        .addFields(
            {
                name: `${EMOJIS.PLAY} Playback Commands`,
                value: '`/music play <url>` - Play a song from YouTube\n`/music pause` - Pause current song\n`/music resume` - Resume paused song\n`/music skip` - Skip to next song\n`/music stop` - Stop playback and clear queue',
                inline: false
            },
            {
                name: `${EMOJIS.QUEUE} Queue Commands`,
                value: '`/music queue` - Show current queue\n`/music nowplaying` - Show current song info\n`/music shuffle` - Shuffle the queue\n`/music clear` - Clear the entire queue',
                inline: false
            },
            {
                name: `${EMOJIS.VOLUME} Audio Commands`,
                value: '`/music volume <0-100>` - Set volume level\n`/music bass <boost>` - Adjust bass levels\n`/music equalizer` - Open audio equalizer',
                inline: false
            },
            {
                name: `${EMOJIS.FIRE} Pro Tips`,
                value: '• Use the interactive buttons for quick control\n• You can queue up to 100 songs\n• Support for playlists coming soon!\n• Use reactions to vote skip songs',
                inline: false
            }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/742043325513900062.png')
        .setFooter({ 
            text: `${EMOJIS.HEART} Need more help? Contact support!`,
            iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png'
        })
        .setTimestamp();
}

module.exports = {
    // Embed creators
    createWelcomeEmbed,
    createLoadingEmbed,
    createConnectionEmbed,
    createNowPlayingEmbed,
    createAdvancedQueueEmbed,
    createDetailedErrorEmbed,
    createCelebrationEmbed,
    createHelpEmbed,
    
    // Button creators
    createEnhancedControlButtons,
    createVolumeButtons,
    
    // Utility functions
    createProgressBar,
    formatTime,
    
    // Constants
    COLORS,
    EMOJIS
};
