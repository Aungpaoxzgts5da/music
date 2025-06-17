const MusicPlayer = require('./musicPlayer');

class Queue {
    constructor(guild, textChannel, voiceChannel) {
        this.guild = guild;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.songs = [];
        this.currentSongIndex = -1;
        this.player = new MusicPlayer();
        this.connection = null;
        this.isLooping = false;
        
        // Set up event listeners
        this.player.on('finished', () => {
            this.handleSongFinished();
        });
        
        this.player.on('error', (error) => {
            console.error('Player error in queue:', error);
            this.skip();
        });
    }

    setConnection(connection) {
        this.connection = connection;
        connection.subscribe(this.player.player);
    }

    addSong(song) {
        this.songs.push(song);
    }

    removeSong(index) {
        if (index >= 0 && index < this.songs.length) {
            return this.songs.splice(index, 1)[0];
        }
        return null;
    }

    getCurrentSong() {
        if (this.currentSongIndex >= 0 && this.currentSongIndex < this.songs.length) {
            return this.songs[this.currentSongIndex];
        }
        return null;
    }

    async play() {
        if (this.songs.length === 0) {
            return false;
        }

        // If no current song, start with the first one
        if (this.currentSongIndex === -1) {
            this.currentSongIndex = 0;
        }

        const song = this.getCurrentSong();
        if (!song) {
            return false;
        }

        try {
            const success = await this.player.play(song);
            return success;
        } catch (error) {
            console.error('Error playing song:', error);
            return false;
        }
    }

    pause() {
        return this.player.pause();
    }

    resume() {
        return this.player.unpause();
    }

    skip() {
        this.player.stop();
        this.handleSongFinished();
    }

    stop() {
        this.player.stop();
        this.currentSongIndex = -1;
    }

    async handleSongFinished() {
        if (this.isLooping && this.getCurrentSong()) {
            // Replay current song
            await this.play();
            return;
        }

        // Move to next song
        this.currentSongIndex++;
        
        if (this.currentSongIndex < this.songs.length) {
            await this.play();
        } else {
            // Queue finished
            this.currentSongIndex = -1;
        }
    }

    setVolume(volume) {
        this.player.setVolume(volume);
    }

    isPlaying() {
        return this.player.isPlaying();
    }

    isPaused() {
        return this.player.isPaused();
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        return this.isLooping;
    }

    shuffle() {
        // Shuffle songs except the currently playing one
        if (this.songs.length <= 1) return;
        
        const currentSong = this.getCurrentSong();
        const otherSongs = this.songs.filter((_, index) => index !== this.currentSongIndex);
        
        // Fisher-Yates shuffle
        for (let i = otherSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
        }
        
        // Reconstruct array with current song at the beginning
        if (currentSong) {
            this.songs = [currentSong, ...otherSongs];
            this.currentSongIndex = 0;
        } else {
            this.songs = otherSongs;
        }
    }

    clear() {
        this.songs = [];
        this.currentSongIndex = -1;
        this.player.stop();
    }

    destroy() {
        this.player.destroy();
        if (this.connection) {
            this.connection.destroy();
        }
        this.songs = [];
        this.currentSongIndex = -1;
    }

    getUpcomingSongs(limit = 10) {
        if (this.currentSongIndex === -1) {
            return this.songs.slice(0, limit);
        }
        return this.songs.slice(this.currentSongIndex + 1, this.currentSongIndex + 1 + limit);
    }

    getQueueLength() {
        return this.songs.length;
    }

    getTotalDuration() {
        // This would require parsing duration from all songs
        // For now, return a placeholder
        return "Unknown";
    }
}

module.exports = Queue;
