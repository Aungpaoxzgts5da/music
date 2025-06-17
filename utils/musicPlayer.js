const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

class MusicPlayer {
    constructor() {
        this.player = createAudioPlayer();
        this.currentResource = null;
        this.volume = 50;
        
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.emit('finished');
        });
        
        this.player.on('error', (error) => {
            console.error('Audio player error:', error);
            this.emit('error', error);
        });
    }

    async play(song) {
        try {
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            this.currentResource = createAudioResource(stream, {
                metadata: {
                    title: song.title
                }
            });

            this.player.play(this.currentResource);
            return true;
        } catch (error) {
            console.error('Error playing song:', error);
            return false;
        }
    }

    pause() {
        return this.player.pause();
    }

    unpause() {
        return this.player.unpause();
    }

    stop() {
        return this.player.stop();
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.currentResource && this.currentResource.volume) {
            this.currentResource.volume.setVolume(this.volume / 100);
        }
    }

    getStatus() {
        return this.player.state.status;
    }

    isPlaying() {
        return this.player.state.status === AudioPlayerStatus.Playing;
    }

    isPaused() {
        return this.player.state.status === AudioPlayerStatus.Paused;
    }

    destroy() {
        this.player.stop(true);
        if (this.currentResource) {
            this.currentResource = null;
        }
    }

    // Event emitter functionality
    emit(event, ...args) {
        if (this.listeners && this.listeners[event]) {
            this.listeners[event].forEach(listener => listener(...args));
        }
    }

    on(event, listener) {
        if (!this.listeners) {
            this.listeners = {};
        }
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }
}

module.exports = MusicPlayer;
