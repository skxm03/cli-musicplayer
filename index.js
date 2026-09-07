const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const songsDir = path.join(__dirname, 'songs');

const songs = fs.readdirSync(songsDir).filter((file) => file.endsWith('.mp3'));

songs.forEach((song, index) => {
	console.log(`${index + 1}. ${song}`);
});

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
		// Enter
		console.clear();

		const selectedSong = songs[selectedIndex];
		const songPath = path.join(songsDir, selectedSong);

		console.log(`Playing: ${selectedSong}`);

		const player = spawn('afplay', [songPath]);

		player.on('close', () => {
			console.log('Finished playing.');
		});

		process.stdin.setRawMode(false);
		process.stdin.pause();
	} else if (key === '\u0003') {
		// Ctrl + C
		process.stdin.setRawMode(false);
		process.stdin.pause();
		process.exit();
	}
});
