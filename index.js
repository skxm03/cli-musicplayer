const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const songsDir = path.join(__dirname, 'songs');

const songs = fs.readdirSync(songsDir).filter((file) => file.endsWith('.mp3'));

let selectedIndex = 0;
let currentIndex = -1;

let player = null;
let isPaused = false;

let shuffle = false;
let queue = [];
let queueIndex = -1;

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

		nextSong();
	});
}

function playSelected() {
	if (songs.length === 0) return;

	if (shuffle) {
		createShuffleQueue();
	}

	play(selectedIndex);
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

	if (shuffle) {
		queueIndex++;

		if (queueIndex >= queue.length) {
			createShuffleQueue();
			queueIndex = 0;
		}

		play(queue[queueIndex]);
		return;
	}

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

function createShuffleQueue() {
	queue = songs
		.map((_, index) => index)
		.filter((index) => index !== currentIndex);

	for (let i = queue.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));

		[queue[i], queue[j]] = [queue[j], queue[i]];
	}

	queueIndex = -1;
}

function showNextSong() {
	if (songs.length === 0) return;

	if (shuffle) {
		console.log(`Next: ${songs[queue[queueIndex + 1]]}`);
		return;
	}

	let nextIndex = currentIndex + 1;

	if (nextIndex >= songs.length) {
		nextIndex = 0;
	}

	console.log(`Next: ${songs[nextIndex]}`);
}

function interfaceRender() {
	console.clear();

	console.log('Select a song:\n');

	songs.forEach((song, index) => {
		const prefix = index === selectedIndex ? '> ' : '  ';
		console.log(`${prefix}${song}`);
	});

	console.log('\nUse ↑ ↓ to select, Enter to play.');
	console.log(
		'p: pause/resume | n: next | b: previous | s: shuffle | Ctrl+C: exit',
	);
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
		playSelected();
	} else if (key === 'p') {
		togglePause();
	} else if (key === 'n') {
		nextSong();
	} else if (key === 'b') {
		previousSong();
	} else if (key === 's') {
		shuffle = !shuffle;

		if (shuffle) {
			createShuffleQueue();
			console.log('Shuffle: ON');
		} else {
			console.log('Shuffle: OFF');
		}

		showNextSong();
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
