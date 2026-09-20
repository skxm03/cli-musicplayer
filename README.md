# CLI Music Player

A lightweight command-line music player built with **Node.js** for macOS.

The project uses Node.js for file handling, terminal input, state management, and process control, with macOS `afplay` handling audio playback.

## Features

- Browse `.mp3` files from the `songs/` directory
- Navigate songs using arrow keys
- Play selected songs
- Pause / resume playback
- Next / previous song
- Automatic playback of the next song
- Shuffle mode with a playback queue
- Preview the next song
- Graceful exit and player cleanup

## Requirements

- macOS
- Node.js
- MP3 files

No external npm packages are required.

## Project Structure

```text
music-player/
├── index.js
├── songs/
│   ├── song1.mp3
│   ├── song2.mp3
│   └── song3.mp3
└── README.md
```

## Setup

Place your MP3 files inside the `songs/` directory.

Then run:

```bash
node index.js
```

## Controls

| Key        | Action             |
| ---------- | ------------------ |
| `↑` `↓`    | Navigate songs     |
| `Enter`    | Play selected song |
| `p`        | Pause / Resume     |
| `n`        | Next song          |
| `b`        | Previous song      |
| `s`        | Toggle Shuffle     |
| `Ctrl + C` | Exit               |

## Shuffle

Shuffle mode maintains a randomized playback queue so songs are played in a shuffled order without immediately repeating the current song.

Press `s` to toggle shuffle mode.

The player also displays the next song that will be played when shuffle is toggled.

## Tech Stack

- **Node.js**
- **JavaScript**
- `fs` — reading songs from the filesystem
- `path` — handling file paths
- `child_process` — controlling the audio player
- **macOS `afplay`** — audio playback

## Architecture

The player maintains separate state for:

```text
songs
  → Available songs

selectedIndex
  → Currently selected song

currentIndex
  → Currently playing song

player
  → Active afplay process

queue
  → Shuffle playback order
```

Playback is handled as a separate system from the terminal interface, allowing the player to respond to keyboard input while audio is running.

## Limitations

- Currently supports macOS only because it uses `afplay`
- No live volume control
- No seeking
- No playlists or persistent library
- Only `.mp3` files are currently supported

## Future Improvements

- Live volume control
- Progress bar
- Seek forward / backward
- Repeat mode
- Playlists
- Search
- Song metadata
- Cross-platform audio playback
- Improved terminal UI

## Learning Objectives

This project was built to practice:

- Node.js filesystem APIs
- Child processes
- Process signals
- Event-driven programming
- Raw terminal input
- State management
- Queues
- Randomization
- Asynchronous programming
- Handling process lifecycle and race conditions
