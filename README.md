
# Capstone Launcher (AI-IDS + Chiron)

This repository provides a **desktop-style launcher** for two separate web applications:

* **AI-IDS** – Intrusion Detection System
* **Chiron** – Compliance Application

The launcher is a small Python/Tkinter app that:

* Starts both dev servers (AI-IDS + Chiron) when it opens
* Shows a simple window with two buttons:

  * **Open AI-IDS**
  * **Open Chiron**
* Opens each app in your default browser when you click the button
* Stops both dev servers cleanly when you close the launcher

---

## Repository Layout

Recommended structure for the combined repo:

```text
capstone-suite/
  launcher.py
  test_launcher_unittest.py   # unit tests for the launcher (optional)
  ai-ids/                     # AI-IDS project (Makefile with `make dev`)
  chiron/                     # Chiron project (contains web/ with package.json)
```

By default, the launcher expects:

* AI-IDS dev environment in: `./ai-ids`
* Chiron web app in: `./chiron/web`

You can change these paths in `launcher.py` if your layout is different.

---

## Requirements

### System

* Linux (developed & tested on Pop!_OS / Ubuntu)
* Python 3.10+ (with Tkinter)
* Node.js + npm
* `make` (for AI-IDS)

### Python dependencies

The launcher only uses the Python standard library, but you **must** have Tkinter installed:

```bash
sudo apt update
sudo apt install python3-tk
```

### AI-IDS dependencies

From `ai-ids/`:

```bash
# Create / activate virtualenv as your project expects, then:
pip install -r requirements.txt
```

Check that this works:

```bash
make dev
# should start Flask API on 127.0.0.1:5000 and Vite UI on http://localhost:5173
```

### Chiron dependencies

From `chiron/web/`:

```bash
npm install
```

Check that this works:

```bash
npm run preview
# should start Vite preview on http://localhost:4173
```

Once both apps work **independently**, you’re ready to use the launcher.

---

## Configuration

At the top of `launcher.py` you’ll see:

```python
from pathlib import Path
ROOT = Path(__file__).parent

# Project directories
AI_IDS_DIR = ROOT / "ai-ids"
CHIRON_DIR = ROOT / "chiron" / "web"

# Commands to start each app
AI_IDS_CMD = ["make", "dev"]
CHIRON_CMD = ["npm", "run", "preview"]

# URLs of each UI
AI_IDS_URL = "http://localhost:5173"
CHIRON_URL = "http://localhost:4173"
```

If your folder names or ports are different, update:

* `AI_IDS_DIR` / `CHIRON_DIR` to point to the correct directories
* `AI_IDS_URL` / `CHIRON_URL` to match the actual dev URLs

---

## Running the Launcher

From the repo root:

```bash
python3 launcher.py
```

What happens:

1. The launcher starts AI-IDS (`make dev`) in `AI_IDS_DIR`.
2. The launcher starts Chiron (`npm run preview`) in `CHIRON_DIR`.
3. A window titled **“Capstone Launcher”** appears with two buttons:

   * **Open AI-IDS**
   * **Open Chiron**

Clicking a button:

* Opens the corresponding URL in your default browser:

  * AI-IDS → `AI_IDS_URL` (default `http://localhost:5173`)
  * Chiron → `CHIRON_URL` (default `http://localhost:4173`)

Closing the launcher window:

* Prompts: *“Close launcher and stop dev servers?”*
* If you click **OK**, the launcher sends `SIGTERM` to the process groups for both dev servers (Flask + Vite / Node), freeing ports **5000**, **5173**, and **4173**.

---

## Optional: Desktop Launcher (.desktop file)

If you want a clickable icon instead of running from terminal:

1. Create `CapstoneLauncher.desktop` (e.g. in `~/.local/share/applications/`):

   ```ini
   [Desktop Entry]
   Type=Application
   Name=Capstone Launcher
   Comment=Launch AI-IDS and Chiron dev servers
   Exec=python3 /full/path/to/capstone-suite/launcher.py
   Icon=utilities-terminal
   Terminal=true
   Categories=Development;
   ```

2. Make it executable:

   ```bash
   chmod +x ~/.local/share/applications/CapstoneLauncher.desktop
   ```

3. It should now appear in your application menu as **Capstone Launcher**.

*(You can later set `Terminal=false` if you don’t need to see the logs.)*

---

## Running the Unit Tests

We provide unit tests for the launcher logic in `test_launcher_unittest.py`.
They verify:

* Both dev servers are started with the correct commands
* Buttons open the correct URLs
* Closing the launcher kills the associated process groups

To run the tests:

```bash
python3 -m unittest -v test_launcher_unittest.py
```

You should see each test case reported as `ok` if everything passes.

---

## Troubleshooting

### “No module named 'tkinter'”

Install Tkinter:

```bash
sudo apt install python3-tk
```

Then try:

```bash
python3 launcher.py
```

again.

---

### Port already in use (5000, 5173, 4173)

If something crashed and left dev servers running, you can check:

```bash
sudo lsof -i :5000
sudo lsof -i :5173
sudo lsof -i :4173
```

To kill a stuck process:

```bash
sudo kill <PID>
# or:
sudo fuser -k 5000/tcp
sudo fuser -k 5173/tcp
sudo fuser -k 4173/tcp
```

Restart the launcher afterwards.

---

### “Failed to start AI-IDS/Chiron” message box

The launcher shows an error popup if:

* The project directory does not exist (check `AI_IDS_DIR` / `CHIRON_DIR`).
* The command (`make dev` or `npm run preview`) is not available.
* `Makefile` or `package.json` is missing.

Fix the underlying issue (correct paths, install dependencies), then re-run `python3 launcher.py`.

---

## License / Credits

* AI-IDS authored by Group 4.
* Chiron authored by Group 5.
* Capstone Launcher glue code authored collaboratively in Sprint 4.
