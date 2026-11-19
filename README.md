# 📝 DevNotes

**DevNotes** is a lightweight, fully offline desktop app for saving code snippets and quick notes.
Organize everything by category, search instantly, and copy any snippet with one click.

Built with **Electron.js**, **HTML**, **CSS** and **Vanilla JavaScript**.

> Screenshot: add an image to a `screenshots/` folder and show it here with
> `![DevNotes](screenshots/dashboard.png)`

## ✨ Features

- 📁 **Categories** – group notes by topic (C++, Data Structure, Java OOP, Linux commands, ...)
- ➕ **Add / Edit / Delete** notes through a clean pop-up form
- 🔍 **Instant search** – results update as you type (shortcut: `Ctrl + K`)
- 📋 **One-click copy** – copy any snippet straight to the clipboard
- 🎨 **Syntax highlighting** – powered by [highlight.js](https://highlightjs.org/), works fully offline
- 🏷️ **Language labels** – choose a language (C++, Java, Python, ...) or let the app auto-detect it
- ✍️ **Auto-save draft** – half-written notes are never lost, even if the app is closed
- 🌙 **Dark mode** – remembers your choice
- 📊 **Dashboard** – total notes, categories and notes added today
- 🚀 **Animated splash screen** and smooth entrance animations
- 🔒 **100% offline** – no internet or database needed, data stays on your computer

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Electron.js | Desktop application shell |
| HTML + CSS | Layout, design, dark mode, animations |
| Vanilla JavaScript | Save, edit, delete, search and copy logic |
| highlight.js | Syntax highlighting |
| localStorage | Offline data storage |

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/devnotes.git

# 2. Go into the project folder
cd devnotes

# 3. Install dependencies
npm install

# 4. Run the app
npm start
```

> On Windows PowerShell, if you see a "running scripts is disabled" error, use `npm.cmd start`
> or run the commands in Command Prompt.

## 📂 Project Structure

```
devnotes/
├── main.js          # Electron main process (windows + splash screen)
├── index.html       # App layout
├── style.css        # Styling, dark mode and animations
├── renderer.js      # App logic (notes, search, copy, drafts, highlighting)
├── splash.html      # Animated startup screen
├── vendor/          # highlight.js (bundled for offline use)
└── package.json
```

## 🗺️ Future Improvements

- Export / Import notes as a JSON file
- Favorite / pin notes
- Trash with restore
- Windows `.exe` installer

## 👤 Author

**Your Name** – Software Development Course Project

## 📄 License

This project is for educational purposes. highlight.js is licensed under BSD-3-Clause (see `vendor/highlightjs-LICENSE.txt`).
