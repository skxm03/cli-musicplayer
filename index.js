const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const songsDir = path.join(__dirname, 'songs');

const songs = fs.readdirSync(songsDir).filter((file) => file.endsWith('.mp3'));

let selectedIndex = 0;

function interfaceRender() {
	console.clear();

	console.log('Select a song:\n');

	songs.forEach((song, index) => {
		const prefix = index === selectedIndex ? '> ' : '  ';
		console.log(`${prefix}${song}`);
	});

	console.log('Use arrow keys to select, Enter to play.');
}

interfaceRender();

let player = null;
let isPaused = false;

function play(songPath) {
	if (player) {
		player.kill('SIGTERM');
	}

	player = spawn('afplay', [songPath]);
	isPaused = false;

	player.on('close', () => {
		console.log('Finished playing.');

		player = null;
		isPaused = false;
	});
}

function togglePause() {
	if (!player) return;

	if (isPaused) {
		player.kill('SIGCONT');
		isPaused = false;
	} else {
		player.kill('SIGSTOP');
		isPaused = true;
	}
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (key) => {
	if (key === '\u001b[A') {
		// Arrow Up
		selectedIndex--;

		if (selectedIndex < 0) {
			selectedIndex = songs.length - 1;
		}

		interfaceRender();
	} else if (key === '\u001b[B') {
		// Arrow Down
		selectedIndex++;

		if (selectedIndex >= songs.length) {
			selectedIndex = 0;
		}

		interfaceRender();
	} else if (key === '\r') {
		console.clear();

		const selectedSong = songs[selectedIndex];
		const songPath = path.join(songsDir, selectedSong);

		console.log(`Playing: ${selectedSong}`);

		play(songPath);
	} else if (key === 'p') {
		// Pause / Resume

		if (!player) {
			return;
		}

		if (isPaused) {
			player.kill('SIGCONT');
			isPaused = false;
			console.log('Resumed');
		} else {
			player.kill('SIGSTOP');
			isPaused = true;
			console.log('Paused');
		}
	} else if (key === '\u0003') {
		// Ctrl + C

		if (player) {
			player.kill('SIGCONT');
			player.kill('SIGTERM');
		}

		process.stdin.setRawMode(false);
		process.stdin.pause();
		process.exit();
	}
});
