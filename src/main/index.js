import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

const path = require('path');
const fs = require('fs');

import Options from "./core/options";
const options = new Options();

import FileManager from "./core/filemanager";
const fileManager = new FileManager(options);


/**
 * Создание главного экрана приложения
 */
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 850,
    minWidth: 1440,
    minHeight: 850,
    show: false,
    autoHideMenuBar: false, // when build - TRUE
    icon: "../../resources/icon.ico",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      devTools: true, // when build - FALSE
      nodeIntegration: false, // Должно быть false для безопасности
      contextIsolation: true, // Оставляем true, чтобы использовать contextBridge
      enableRemoteModule: false // Для большей безопасности
    },
  });


  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });


  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    if (DevWindow) {
      DevWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/dev.html`);
    }
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdates();
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  ipcMain.on("ping", () => console.log("pong"));

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
ipcMain.handle("ping", () => console.log("pong"));

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("getOption", (event, name) => {
  if (options.issetOption(name) !== false) {
    return options.getOption(name);
  } else {
    return false;
  }
});
ipcMain.handle("setOption", (event, name, value) => {
  return options.setOption(name, value);
});


ipcMain.on('read-file', (event, filePath) => {
  fs.readFile(filePath, (err, data) => {
      if (err) {
          event.reply('file-data', { success: false, message: err.message });
      } else {
        event.reply('file-data', { success: true, content: data });
          // mammoth.convertToHtml({ buffer: data })
          //     .then(result => {
          //         event.reply('file-data', { success: true, content: result.value });
          //     })
          //     .catch(error => {
          //         event.reply('file-data', { success: false, message: error.message });
          //     });
      }
  });
});

ipcMain.handle("getTemplates", (event, name, value) => {
  return fileManager.getTemplates();
});
ipcMain.handle("getSeries", (event, name, value) => {
  return fileManager.getSeries();
});