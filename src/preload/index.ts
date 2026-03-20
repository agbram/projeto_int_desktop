import { contextBridge, ipcRenderer } from 'electron'; 
contextBridge.exposeInMainWorld('api', { 
  consoleLog: function(message: string) { 
    ipcRenderer.send('consoleLog', message) 
  }
});