import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
      },
    });
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, listener)
      }
    })

  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

/**
 * @deprecated on, now use handle("read-file-sync"...)
 */
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => ipcRenderer.send('read-file', filePath),
  onFileData: (callback) => ipcRenderer.on('file-data', (event, data) => callback(data))
});