const { app, BrowserWindow } = require('electron');

const SPLASH_MIN_MS = 3000; // how long the splash animation stays

function createWindows() {
  const splash = new BrowserWindow({
    width: 480, height: 340, frame: false, transparent: true,
    resizable: false, alwaysOnTop: true, center: true, skipTaskbar: true
  });
  splash.loadFile('splash.html');

  const win = new BrowserWindow({
    width: 1200, height: 780, minWidth: 900, minHeight: 600,
    title: 'DevNotes', autoHideMenuBar: true, show: false
  });
  win.loadFile('index.html');

  const started = Date.now();
  win.once('ready-to-show', () => {
    const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - started));
    setTimeout(() => {
      if (!splash.isDestroyed()) splash.close();
      win.show();
    }, wait);
  });
}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
