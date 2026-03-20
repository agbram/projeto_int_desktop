import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  win.maximize();

  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadURL('http://localhost:3333');
}

app.whenReady().then(createWindow);

ipcMain.on('consoleLog', (_event, message) => {
  console.log('Mensagem recebida do render:', message);
});
