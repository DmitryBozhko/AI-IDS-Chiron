# Capstone Suite Runbook (Sprint 4)  
**AI-IDS + Chiron + Launcher**

## 1. Purpose

This runbook describes how to **install, start, monitor, and stop** the combined Capstone Suite:

- **AI-IDS** (Intrusion Detection System)
- **Chiron** (Compliance app)
- **Capstone Launcher** (Python/Tkinter app that starts both and provides a simple UI)

It is written for operators (TAs, teammates, or future maintainers) who need to run the system, not develop new features.

---

## 2. System Overview

### Components

- **AI-IDS**
  - Tech: Python (Flask API), Vite/Node frontend
  - Ports:
    - API: `127.0.0.1:5000`
    - UI: `http://localhost:5173`

- **Chiron**
  - Tech: Node.js + Vite
  - Ports:
    - UI: `http://localhost:4173`

- **Capstone Launcher**
  - Tech: Python + Tkinter
  - Behavior:
    - Starts **both** dev servers on launch:
      - `make dev` in `ai-ids/`
      - `npm run preview` in `chiron/web/`
    - Shows a window with two buttons:
      - **Open AI-IDS**
      - **Open Chiron**
    - Stops both dev servers when the window is closed (with confirmation).

### Directory Layout (Combined Repo)

```text
capstone-suite/
  launcher.py
  README.md
  ai-ids/            # AI-IDS project (Makefile with "make dev")
  chiron/            # Chiron project
    web/             # Chiron web app (package.json, npm scripts)
  docs/
    operations/
      runbook.md     # (this file)
```

---

## 3. Environment Requirements

### OS

- Linux (developed and tested on Pop!_OS / Ubuntu)

### System Packages

Install these once per machine:

```bash
sudo apt update
sudo apt install python3 python3-tk python3-venv nodejs npm make
```

> `python3-tk` is required for the Tkinter GUI.

### AI-IDS Dependencies

From `ai-ids/`:

```bash
cd capstone-suite/ai-ids
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Verify AI-IDS runs independently:

```bash
make dev
# Expect: Flask on 127.0.0.1:5000 and Vite UI on http://localhost:5173
# Stop with Ctrl+C
```

### Chiron Dependencies

From `chiron/web/`:

```bash
cd capstone-suite/chiron/web
npm install
```

Verify Chiron runs independently:

```bash
npm run preview
# Expect: Vite preview on http://localhost:4173
# Stop with Ctrl+C
```

Once both apps work on their own, you’re ready to use the launcher.

---

## 4. Configuration

At the top of `launcher.py`, the launcher is configured to:

```python
from pathlib import Path
ROOT = Path(__file__).parent

AI_IDS_DIR = ROOT / "ai-ids"
CHIRON_DIR = ROOT / "chiron" / "web"

AI_IDS_CMD = ["make", "dev"]
CHIRON_CMD = ["npm", "run", "preview"]

AI_IDS_URL = "http://localhost:5173"
CHIRON_URL = "http://localhost:4173"
```

Only change these if:

- Your directories are named differently, or
- The apps serve on different ports/URLs.

---

## 5. Starting the System

### 5.1 Start from Terminal

From the repo root (`capstone-suite/`):

```bash
cd capstone-suite
python3 launcher.py
```

**Expected behavior:**

- A window titled **“Capstone Launcher”** appears.
- In the background, the launcher starts:
  - `make dev` in `ai-ids/`
  - `npm run preview` in `chiron/web/`
- You’ll see logs in the terminal where you ran `launcher.py`.

### 5.2 Using the Launcher Window

The window has two buttons:

- **Open AI-IDS**
  - Opens `AI_IDS_URL` (default `http://localhost:5173`) in the default browser.
- **Open Chiron**
  - Opens `CHIRON_URL` (default `http://localhost:4173`) in the default browser.

You can click each button multiple times to open new tabs; the servers are started once when the launcher opens.

---

## 6. Stopping the System

### Normal Shutdown

1. Close the launcher window (click the window close button).
2. A confirmation dialog appears:
   - **“Close launcher and stop dev servers?”**
3. Click **OK**.

**Expected behavior:**

- The launcher sends a `SIGTERM` to the process groups for both dev servers.
- Flask, Vite (AI-IDS), and Vite (Chiron) processes are terminated.
- Ports `5000`, `5173`, and `4173` are freed.

### Verifying Shutdown (Optional)

Run:

```bash
sudo lsof -i :5000
sudo lsof -i :5173
sudo lsof -i :4173
```

All commands should return **no output** if the system shut down correctly.

---

## 7. Health Checks

### 7.1 Quick Manual Health Check

After starting the launcher:

1. Click **Open AI-IDS**.
   - Browser should load: `http://localhost:5173`
   - AI-IDS UI should render without HTTP 4xx/5xx errors.
2. Click **Open Chiron**.
   - Browser should load: `http://localhost:4173`
   - Chiron UI should render without HTTP 4xx/5xx errors.

If either page fails to load:

- See **Troubleshooting** below.

### 7.2 Scripted Health Check (Optional)

If you add a `health_check.py`, you can run:

```bash
cd capstone-suite
python3 health_check.py
# or, if you add a make target:
make health
```

Expected output (example):

```text
[OK] AI-IDS UI at http://localhost:5173 (HTTP 200)
[OK] Chiron UI at http://localhost:4173 (HTTP 200)
```

---

## 8. Logs & Monitoring

### Launcher Logs

- The terminal where you run `python3 launcher.py` will show:
  - Any Python exceptions from the launcher itself.
  - stdout/stderr from `make dev` and `npm run preview`.

Recommend keeping that terminal visible while operating the system.

### Application Logs

- **AI-IDS**
  - Flask logs appear in the same terminal that runs `make dev`.
  - Additional logs may be written under `ai-ids/` depending on configuration.

- **Chiron**
  - Vite logs appear in the `npm run preview` output (also captured in the launcher terminal).

If an app fails to start, check this terminal first.

---

## 9. Routine Operator Tasks

### 9.1 Updating to a New Version

From `capstone-suite/`:

```bash
# Stop system (if running)
# Close launcher window → click OK

# Pull latest changes
git pull

# Update AI-IDS deps (if requirements changed)
cd ai-ids
source .venv/bin/activate
pip install -r requirements.txt

# Update Chiron deps (if package.json changed)
cd ../chiron/web
npm install
```

Then restart via `python3 launcher.py`.

### 9.2 Running Launcher Unit Tests

To verify the launcher logic:

```bash
cd capstone-suite
python3 -m unittest -v test_launcher_unittest.py
```

All tests should report `ok`.

---

## 10. Troubleshooting

### 10.1 Launcher window opens, but apps don’t load in browser

**Symptoms:**

- Launcher starts.
- Clicking **Open AI-IDS** or **Open Chiron** opens a tab, but the page fails to load.

**Checks:**

1. Confirm dev servers are listening:

   ```bash
   sudo lsof -i :5000
   sudo lsof -i :5173
   sudo lsof -i :4173
   ```

2. If ports are **not** listening:
   - Check the launcher terminal for errors about `make dev` or `npm run preview`.
   - Verify dependencies:
     - AI-IDS: `cd ai-ids && make dev` manually
     - Chiron: `cd chiron/web && npm run preview` manually

3. If ports **are** listening but pages still fail:
   - Check browser dev tools console and network tab for errors.

---

### 10.2 “No module named 'tkinter'”

Install Tkinter:

```bash
sudo apt install python3-tk
```

Then retry:

```bash
python3 launcher.py
```

---

### 10.3 Port already in use

If a previous run crashed and left processes behind:

```bash
sudo lsof -i :5000
sudo lsof -i :5173
sudo lsof -i :4173
```

To kill any stuck processes:

```bash
sudo fuser -k 5000/tcp
sudo fuser -k 5173/tcp
sudo fuser -k 4173/tcp
```

Then start the launcher again.

---

### 10.4 “Failed to start AI-IDS/Chiron” popup

Possible causes:

- Project directory moved or renamed.
- `make`/`npm` not installed.
- `Makefile` or `package.json` missing.

**Actions:**

1. Confirm paths in `launcher.py` (`AI_IDS_DIR`, `CHIRON_DIR`).
2. Confirm you can start each app manually:
   - `cd ai-ids && make dev`
   - `cd chiron/web && npm run preview`
3. Fix any dependency or path issues, then re-run the launcher.
