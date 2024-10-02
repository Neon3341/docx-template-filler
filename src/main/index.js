import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
const fs = require("fs");

const { Notification } = require("electron");

import Options from "./core/options";
const options = new Options();

import FileManager from "./core/filemanager";
import generateOutputDOCX from "./core/docx_exporter";
const fileManager = new FileManager(options);

/**
 * Main win init
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
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
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
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
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
/**
 * Handler to ping request from front
 */
ipcMain.handle("ping", () => console.log("pong"));

/**
 * Quit app, when all windows closed
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Options api handler - gets any option from Options class 
 */
ipcMain.handle("getOption", (event, name) => {
  if (options.issetOption(name) !== false) {
    return options.getOption(name);
  } else {
    return false;
  }
});
/**
 * Options api handler - sets any option to Options class 
 */
ipcMain.handle("setOption", (event, name, value) => {
  return options.setOption(name, value);
});

/**
 * @deprecated on, now use handle("read-file-sync"...)
 */
ipcMain.on("read-file", (event, filePath) => {
  const id = filePath.split("\\").pop().split("/").pop().split(".docx")[0];
  fs.readFile(filePath, (err, data) => {
    if (err) {
      event.reply("file-data", { success: false, message: err.message });
    } else {
      event.reply("file-data", { success: true, content: data });
    }
  });
});

/**
 * Read any file on PC => :Buffer
 */
ipcMain.handle("read-file-sync", (event, filePath) => {
  const data = fs.readFileSync(filePath);
  return { success: true, content: data };
});

/**
 * Retrieve all templates founded in configured dir => :Object
 */
ipcMain.handle("getTemplates", (event, name, value) => {
  return fileManager.getTemplates();
});
/**
 * Retrieve all templates series founded in configured dir => :Object
 */
ipcMain.handle("getSeries", (event, name, value) => {
  return fileManager.getSeries();
});

/**
 * Retrieve all templates series founded in configured dir => :Object
 */
ipcMain.handle("showNotification", (event, title, message, onClickEval) => {
  const notification = new Notification({ title: title, body: message })
  notification.show()
  notification.on('click', (event, arg) => {
    eval(onClickEval)
  })
});

/**
 * Starts generate export docx file with new data
 */
ipcMain.handle(
  "generate-docx",
  async (event, { templatePath, data, rawData}) => {
    try {
      const outputDocxDir = generateOutputDOCX(templatePath, data, rawData);
      return { success: true, outputDir: outputDocxDir};
    } catch (error) {
      console.error("Error generating DOCX:", error);
      return { success: false, error };
    }
  }
);
