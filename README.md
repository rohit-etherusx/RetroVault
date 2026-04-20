# 🎮 RetroVault

*A Dockerized GBA Emulator That Lives in Your Browser*

---

> *"Why buy a $300 handheld when you can run a Game Boy Advance emulator in a Docker container hosted on a Raspberry Pi in your closet?"*  
> — Every retro gaming enthusiast, probably.

---

## 📜 The Story Behind This Project

It started like most great (read: slightly ridiculous) engineering projects do — with nostalgia and too much free time on a Sunday afternoon.

I was sitting there, reminiscing about the good old days when Pokémon Emerald kept me up until 3 AM, when I thought: *"Wouldn't it be cool if I could play GBA games from any computer, without installing anything?"*

And thus, **RetroVault** was born.

The goal was simple:
1. Run a GBA emulator in the browser (no downloads, no installations)
2. Make it work inside Docker (because everything is better in Docker)
3. Persist game saves (because nothing hurts more than losing 50 hours of progress)

What I didn't anticipate was that building a full ARM7TDMI CPU emulator in JavaScript would be both terrifying and exhilarating. But here we are.

---

## 🧠 What Does This Actually Do?

RetroVault is a **web-based Game Boy Advance emulator** that runs entirely in your browser. Here's the magic:

1. **You open the app** → Your browser fetches the ROM from the backend
2. **The GBA.js2 emulator** (a beautiful piece of JavaScript engineering) emulates the ARM7TDMI processor, graphics, audio, and input
3. **You play** → Using your keyboard as a GBA controller
4. **You save** → Game progress gets uploaded to the backend and stored locally
5. **You come back later** → Your save file is downloaded and you pick up right where you left off

No emulators to download. No BIOS files to hunt down (we've got that covered). No configuration headaches.

Just open a browser and play.

---

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend** | Vanilla JavaScript + HTML5 Canvas | Lightweight, no build step needed |
| **Emulator Core** | GBA.js2 | Full ARM7TDMI emulation in pure JavaScript |
| **Backend** | FastAPI (Python) | Fast, modern, async-native |
| **Server** | Uvicorn | Lightning-fast ASGI server |
| **Containerization** | Docker | "It works on my machine" — now it works everywhere |
| **Storage** | Local filesystem | Simple, reliable, no database needed |

### The GBA.js2 Magic

The real star of the show is [GBA.js2](https://github.com/AntonioND/gbajs2) — a JavaScript implementation of:
- **ARM7TDMI CPU** (both ARM and Thumb instruction sets)
- **Memory Management Unit (MMU)**
- **Graphics rendering** (240×160 native resolution)
- **Audio processing** (Web Audio API)
- **Input handling** (keyboard + gamepad support)
- **Save data** (SRAM/Flash)

This thing emulates a entire handheld console in the browser. How cool is that?

---

## 🚀 Quick Start

### Prerequisites

- Docker (obviously)
- A web browser (Chrome, Firefox, Safari — we're not picky)
- A GBA ROM file (`.gba` format)

### Step 1: Get the Code

```bash
git clone https://github.com/yourusername/RetroVault.git
cd RetroVault
```

### Step 2: Add Your ROM

Drop your favorite GBA ROM into the `app/roms/` directory:

```bash
# Example: Copy your ROM
cp "Pokemon Emerald.gba" app/roms/
```

> ⚠️ **Note**: Please only use ROMs you legally own. We're not responsible for your digital shopping habits.

### Step 3: Build and Run

```bash
# Build the Docker image
docker build -t retrovault .

# Run the container
docker run -d -p 8000:8000 -v $(pwd)/app/saves:/app/saves retrovault
```

### Step 4: Play!

Open your browser and navigate to:

```
http://localhost:8000
```

That's it. You're playing GBA games in a browser running inside a container. Welcome to the future (or 2001, depending on how you look at it).

---

## 🎮 Controls

| GBA Button | Keyboard Key |
|------------|---------------|
| **D-Pad** | Arrow Keys or WASD |
| **A** | Z |
| **B** | X |
| **Start** | Enter |
| **Select** | \ (Backslash) |
| **L** | A |
| **R** | S |

### In-Game Controls

- **Pause**: Click the PAUSE button or press Space
- **Save Game**: Click SAVE GAME (uploads save to server)
- **Reset**: Click RESET (restarts the game)

---

## 📂 Project Structure

```
RetroVault/
├── Dockerfile              # Docker configuration
├── requirements.txt        # Python dependencies
├── app/
│   ├── main.py             # FastAPI backend
│   ├── roms/               # Put your .gba files here
│   ├── saves/              # Game saves live here
│   └── static/
│       ├── index.html     # Main game page
│       ├── custom.js      # Frontend logic
│       ├── js/            # GBA.js2 emulator core
│       └── resources/     # CSS, BIOS, utilities
└── gbajs2/                # Original GBA.js2 source (reference)
```

---

## 🔧 API Endpoints

If you're curious (or want to build something custom):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves the game interface |
| `GET` | `/rom` | Returns the GBA ROM file |
| `POST` | `/upload-save` | Uploads a save file |
| `GET` | `/download-save` | Downloads a save file |
| `POST` | `/client-log` | Client-side error logging |

---

## 🧩 How It Works (Under the Hood)

### The Backend (FastAPI)

The Python backend is refreshingly simple:

1. **Serves static files** — HTML, JS, CSS, the works
2. **Serves ROMs** — Finds `.gba` files in `app/roms/` and sends them to the browser
3. **Manages saves** — Handles upload/download of game save files to `app/saves/`
4. **Logs errors** — Catches client-side errors for debugging (because JavaScript errors are like ghosts — invisible until you look for them)

### The Frontend (GBA.js2)

Here's where the real magic happens:

1. **ROM Loading**: The browser fetches the ROM as an ArrayBuffer
2. **CPU Emulation**: The ARM7TDMI processor is emulated instruction-by-instruction in JavaScript
3. **Graphics**: Each frame is rendered to an HTML5 Canvas (240×160 pixels, just like the real thing)
4. **Audio**: Sound is processed through the Web Audio API
5. **Input**: Keyboard events are mapped to GBA button presses
6. **Saving**: The emulator's save state is serialized and sent to the backend

### The Docker Layer

The Dockerfile wraps everything in a neat little package:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y curl
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
RUN mkdir -p /app/roms /app/saves
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

One command to build, one command to run. No dependency hell. No "it works on my machine" problems.

---

## 🐛 Troubleshooting

### "ROM not found"
Make sure you've placed a `.gba` file in `app/roms/` before running the container.

### "Save file not found"
Save files are created when you click "SAVE GAME". They won't exist until you've saved at least once.

### "The game runs but there's no sound"
Check your browser's volume and make sure it's not muted. (We've all been there.)

### "It's running slow"
GBA emulation is CPU-intensive. Close some tabs, or run on a faster machine. Or just accept that 2026 hardware should be able to handle 2001 games without breaking a sweat.

---

## 🚧 What's Next?

This is just V1. The roadmap includes:

- [ ] **Cloud save sync** — Play on your laptop, continue on your phone
- [ ] **Multiple ROM support** — Choose from a library of games
- [ ] **Better UI** — Because let's be honest, the current UI is... functional
- [ ] **Mobile support** — Touch controls for phones and tablets
- [ ] **Save state support** — Not just battery saves, but full snapshots

---

## 🤝 Contributing

Found a bug? Want to add a feature? Have a funny joke about emulators?

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

We're not strict about contributions — this is a passion project, and we're happy to have help.

---

## 📝 License

This project is for educational and personal use. The GBA.js2 emulator code is based on the original gbajs project, which was released under the MIT license.

**Please only use ROMs you legally own.** We're not responsible for how you use this software. Game preservation is a beautiful thing — support the developers by buying games when you can.

---

## 🙌 Acknowledgments

- **Antonio ND** — For creating GBA.js2, the incredible emulator this project is built on
- **The original gbajs team** — For proving that you can emulate a GBA in JavaScript
- **FastAPI** — For making Python APIs actually enjoyable to write
- **You** — For reading this far. Seriously, thanks.

---

## 💬 A Final Word

RetroVault isn't about replacing real hardware. It's about accessibility — the ability to play classic games on any device, anywhere, without jumping through hoops.

Sometimes, you just want to catch a Pokémon or defeat a Gym Leader on your lunch break. RetroVault lets you do that.

Now go forth and play.

> *"I gonna be the very best, like no one ever was."*  
> — Probably you, after loading up Pokémon Emerald

---

<div align="center">

**Made with ☕, nostalgia, and way too much time on a Sunday afternoon**

*Built with love by [Your Name]*

</div>