const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const config = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

// Collections to store commands and music queues
client.commands = new Collection();
client.queues = new Collection();

// Load commands
const musicCommand = require('./commands/music');
client.commands.set(musicCommand.data.name, musicCommand);

client.once('ready', () => {
    console.log(`🎵 ${client.user.tag} is ready to play music!`);
    client.user.setActivity('🎶 Beautiful Music', { type: 'LISTENING' });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Command execution error:', error);
            const errorMessage = '❌ There was an error executing this command!';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }

    if (interaction.isButton()) {
        const musicCommand = client.commands.get('music');
        if (musicCommand && musicCommand.handleButton) {
            try {
                await musicCommand.handleButton(interaction);
            } catch (error) {
                console.error('Button interaction error:', error);
                await interaction.reply({ content: '❌ There was an error processing this action!', ephemeral: true });
            }
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // Handle bot being disconnected from voice channel
    if (oldState.member.id === client.user.id && oldState.channel && !newState.channel) {
        const queue = client.queues.get(oldState.guild.id);
        if (queue) {
            queue.destroy();
            client.queues.delete(oldState.guild.id);
        }
    }
});

client.login(config.token);
