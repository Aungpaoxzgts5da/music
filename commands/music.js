const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const MusicPlayer = require('../utils/musicPlayer');
const Queue = require('../utils/queue');
const { createMusicEmbed, createQueueEmbed } = require('../utils/embedBuilder');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('🎵 Music bot controls')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('🎶 Play a song from YouTube')
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('YouTube URL or search query')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('⏸️ Pause the current song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('▶️ Resume the paused song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('⏭️ Skip the current song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('⏹️ Stop playing and clear the queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('📋 Show the current queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('🎵 Show currently playing song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('🔊 Set the volume (0-100)')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Volume level (0-100)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const member = interaction.member;
        const guild = interaction.guild;

        // Check if user is in a voice channel
        if (!member.voice.channel) {
            return await interaction.reply({
                content: '❌ You need to be in a voice channel to use music commands!',
                ephemeral: true
            });
        }

        let queue = interaction.client.queues.get(guild.id);

        switch (subcommand) {
            case 'play':
                await this.handlePlay(interaction, queue);
                break;
            case 'pause':
                await this.handlePause(interaction, queue);
                break;
            case 'resume':
                await this.handleResume(interaction, queue);
                break;
            case 'skip':
                await this.handleSkip(interaction, queue);
                break;
            case 'stop':
                await this.handleStop(interaction, queue);
                break;
            case 'queue':
                await this.handleQueue(interaction, queue);
                break;
            case 'nowplaying':
                await this.handleNowPlaying(interaction, queue);
                break;
            case 'volume':
                await this.handleVolume(interaction, queue);
                break;
        }
    },

    async handlePlay(interaction, queue) {
        const url = interaction.options.getString('url');
        const member = interaction.member;
        const guild = interaction.guild;
        const voiceChannel = member.voice.channel;

        await interaction.deferReply();

        try {
            // Validate YouTube URL
            if (!ytdl.validateURL(url)) {
                return await interaction.editReply({
                    content: '❌ Please provide a valid YouTube URL!'
                });
            }

            // Get video info
            const info = await ytdl.getInfo(url);
            const song = {
                title: info.videoDetails.title,
                url: url,
                duration: this.formatDuration(info.videoDetails.lengthSeconds),
                thumbnail: info.videoDetails.thumbnails[0]?.url,
                requestedBy: interaction.user
            };

            // Create or get existing queue
            if (!queue) {
                queue = new Queue(guild, voiceChannel);
                interaction.client.queues.set(guild.id, queue);
                
                // Connect to voice channel
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                });
                
                queue.setConnection(connection);
                queue.addSong(song);
                
                // Start playing
                await queue.play();
                
                const embed = createMusicEmbed(song, 'Now Playing');
                const row = this.createControlButtons();
                
                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
            } else {
                queue.addSong(song);
                const embed = createMusicEmbed(song, 'Added to Queue', `Position: ${queue.songs.length}`);
                
                await interaction.editReply({
                    embeds: [embed]
                });
            }
        } catch (error) {
            console.error('Play command error:', error);
            await interaction.editReply({
                content: '❌ There was an error trying to play that song!'
            });
        }
    },

    async handlePause(interaction, queue) {
        if (!queue || !queue.isPlaying()) {
            return await interaction.reply({
                content: '❌ Nothing is currently playing!',
                ephemeral: true
            });
        }

        queue.pause();
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏸️ Music Paused')
            .setDescription('The music has been paused.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleResume(interaction, queue) {
        if (!queue || queue.isPlaying()) {
            return await interaction.reply({
                content: '❌ Nothing is paused!',
                ephemeral: true
            });
        }

        queue.resume();
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('▶️ Music Resumed')
            .setDescription('The music has been resumed.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleSkip(interaction, queue) {
        if (!queue || !queue.getCurrentSong()) {
            return await interaction.reply({
                content: '❌ Nothing is currently playing!',
                ephemeral: true
            });
        }

        const skipped = queue.getCurrentSong();
        queue.skip();

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('⏭️ Song Skipped')
            .setDescription(`Skipped: **${skipped.title}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleStop(interaction, queue) {
        if (!queue) {
            return await interaction.reply({
                content: '❌ Nothing is currently playing!',
                ephemeral: true
            });
        }

        queue.destroy();
        interaction.client.queues.delete(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⏹️ Music Stopped')
            .setDescription('The music has been stopped and the queue has been cleared.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleQueue(interaction, queue) {
        if (!queue || queue.songs.length === 0) {
            return await interaction.reply({
                content: '❌ The queue is empty!',
                ephemeral: true
            });
        }

        const embed = createQueueEmbed(queue.songs, queue.getCurrentSong());
        await interaction.reply({ embeds: [embed] });
    },

    async handleNowPlaying(interaction, queue) {
        if (!queue || !queue.getCurrentSong()) {
            return await interaction.reply({
                content: '❌ Nothing is currently playing!',
                ephemeral: true
            });
        }

        const song = queue.getCurrentSong();
        const embed = createMusicEmbed(song, 'Now Playing');
        const row = this.createControlButtons();

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },

    async handleVolume(interaction, queue) {
        const volume = interaction.options.getInteger('level');
        
        if (!queue) {
            return await interaction.reply({
                content: '❌ Nothing is currently playing!',
                ephemeral: true
            });
        }

        queue.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to **${volume}%**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleButton(interaction) {
        const queue = interaction.client.queues.get(interaction.guild.id);
        
        if (!queue) {
            return await interaction.reply({
                content: '❌ No music is currently playing!',
                ephemeral: true
            });
        }

        switch (interaction.customId) {
            case 'play_pause':
                if (queue.isPlaying()) {
                    queue.pause();
                    await interaction.reply({ content: '⏸️ Music paused!', ephemeral: true });
                } else {
                    queue.resume();
                    await interaction.reply({ content: '▶️ Music resumed!', ephemeral: true });
                }
                break;
            case 'skip':
                queue.skip();
                await interaction.reply({ content: '⏭️ Song skipped!', ephemeral: true });
                break;
            case 'stop':
                queue.destroy();
                interaction.client.queues.delete(interaction.guild.id);
                await interaction.reply({ content: '⏹️ Music stopped!', ephemeral: true });
                break;
            case 'queue':
                if (queue.songs.length === 0) {
                    await interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
                } else {
                    const embed = createQueueEmbed(queue.songs, queue.getCurrentSong());
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                break;
        }
    },

    createControlButtons() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('play_pause')
                    .setLabel('Play/Pause')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⏯️'),
                new ButtonBuilder()
                    .setCustomId('skip')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭️'),
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️'),
                new ButtonBuilder()
                    .setCustomId('queue')
                    .setLabel('Queue')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📋')
            );
    },

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};
