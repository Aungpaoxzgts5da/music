const { EmbedBuilder } = require('discord.js');

function createMusicEmbed(song, title = 'Now Playing', description = '') {
    const embed = new EmbedBuilder()
        .setColor('#FF6B9D')
        .setTitle(`🎵 ${title}`)
        .setDescription(`**${song.title}**`)
        .setThumbnail(song.thumbnail || 'https://via.placeholder.com/120x90/FF6B9D/FFFFFF?text=🎵')
        .addFields(
            { name: '⏱️ Duration', value: song.duration || 'Unknown', inline: true },
            { name: '👤 Requested by', value: song.requestedBy.toString(), inline: true },
            { name: '🔗 URL', value: `[Click here](${song.url})`, inline: true }
        )
        .setFooter({ 
            text: '🎶 Enjoy the music!', 
            iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png' 
        })
        .setTimestamp();

    if (description) {
        embed.addFields({ name: '📋 Info', value: description, inline: false });
    }

    return embed;
}

function createQueueEmbed(songs, currentSong) {
    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('📋 Music Queue')
        .setTimestamp();

    if (currentSong) {
        embed.addFields({
            name: '🎵 Currently Playing',
            value: `**${currentSong.title}**\nRequested by: ${currentSong.requestedBy}`,
            inline: false
        });
    }

    if (songs.length > 1) {
        const upcomingSongs = songs.slice(1, 11); // Show next 10 songs
        const queueList = upcomingSongs.map((song, index) => 
            `**${index + 1}.** ${song.title}\n👤 ${song.requestedBy} • ⏱️ ${song.duration}`
        ).join('\n\n');

        embed.addFields({
            name: `🔜 Up Next (${songs.length - 1} songs)`,
            value: queueList || 'No upcoming songs',
            inline: false
        });

        if (songs.length > 11) {
            embed.addFields({
                name: '➕ More',
                value: `... and ${songs.length - 11} more songs`,
                inline: false
            });
        }
    } else {
        embed.addFields({
            name: '🔜 Up Next',
            value: 'No upcoming songs in queue',
            inline: false
        });
    }

    embed.setFooter({
        text: `Total songs: ${songs.length} • Use buttons to control playback`,
        iconURL: 'https://cdn.discordapp.com/emojis/742043325513900062.png'
    });

    return embed;
}

function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: 'Please try again or contact support if the issue persists.' });
}

function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#51CF66')
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

function createInfoEmbed(title, description, color = '#4ECDC4') {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

module.exports = {
    createMusicEmbed,
    createQueueEmbed,
    createErrorEmbed,
    createSuccessEmbed,
    createInfoEmbed
};
