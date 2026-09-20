const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const songsDir = path.join(__dirname, 'songs');

const songs = fs.readdirSync(songsDir).filter((file) => file.endsWith('.mp3'));

let selectedIndex = 0;
let currentIndex = -1;

let player = null;
let isPaused = false;

function play(index) {
	if (player) {
		player.kill('SIGCONT');
		player.kill('SIGTERM');
	}

	const song = songs[index];
	const songPath = path.join(songsDir, song);

	currentIndex = index;
	selectedIndex = index;
	isPaused = false;

	console.clear();
	console.log(`Playing: ${song}`);

	const newPlayer = spawn('afplay', [songPath]);

	player = newPlayer;

	newPlayer.on('close', () => {
		if (player !== newPlayer) {
			return;
		}

		player = null;
		isPaused = false;
	});
}

function togglePause() {
	if (!player) return;

	if (isPaused) {
		player.kill('SIGCONT');
		isPaused = false;
		console.log('Resumed');
	} else {
		player.kill('SIGSTOP');
		isPaused = true;
		console.log('Paused');
	}
}

function nextSong() {
	if (songs.length === 0) return;

	let nextIndex = currentIndex + 1;

	if (nextIndex >= songs.length) {
		nextIndex = 0;
	}

	play(nextIndex);
}

function previousSong() {
	if (songs.length === 0) return;

	let previousIndex = currentIndex - 1;

	if (previousIndex < 0) {
		previousIndex = songs.length - 1;
	}

	play(previousIndex);
}

function interfaceRender() {
	console.clear();

	console.log('Select a song:\n');

	songs.forEach((song, index) => {
		const prefix = index === selectedIndex ? '> ' : '  ';
		console.log(`${prefix}${song}`);
	});

	console.log('\nUse ↑ ↓ to select, Enter to play.');
}

interfaceRender();

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (key) => {
	if (key === '\u001b[A') {
		selectedIndex--;

		if (selectedIndex < 0) {
			selectedIndex = songs.length - 1;
		}

		interfaceRender();
	} else if (key === '\u001b[B') {
		selectedIndex++;

		if (selectedIndex >= songs.length) {
			selectedIndex = 0;
		}

		interfaceRender();
	} else if (key === '\r') {
		play(selectedIndex);
	} else if (key === 'p') {
		togglePause();
	} else if (key === 'n') {
		nextSong();
	} else if (key === 'b') {
		previousSong();
	} else if (key === '\u0003') {
		if (player) {
			player.kill('SIGCONT');
			player.kill('SIGTERM');
		}

		process.stdin.setRawMode(false);
		process.stdin.pause();
		process.exit();
	}
});
