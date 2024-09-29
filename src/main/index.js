import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

const path = require("path");
const fs = require("fs");

import Options from "./core/options";
const options = new Options();

import FileManager from "./core/filemanager";
import replaceHyperlinksInDocxAndConvertToPdf from "./core/pdf_exporter";
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

ipcMain.on("read-file", (event, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      event.reply("file-data", { success: false, message: err.message });
    } else {
      event.reply("file-data", { success: true, content: data });
    }
  });
});

ipcMain.handle("getTemplates", (event, name, value) => {
  return fileManager.getTemplates();
});
ipcMain.handle("getSeries", (event, name, value) => {
  return fileManager.getSeries();
});

const fillTemplate = (templatePath, data, outputPath) => {
  console.log(data);
  const content = fs.readFileSync(templatePath, "binary");

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  doc.setData({
    "Название котла": "Новое значение",
  });

  try {
    doc.render();

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    fs.writeFileSync(outputPath, buf);
    console.log("File has been generated successfully!");
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

const convertToPdf = (docxPath, pdfPath) => {
  docxToPdf(docxPath, pdfPath, (err, result) => {
    if (err) {
      console.error("Error converting to PDF:", err);
    } else {
      console.log("PDF successfully generated:", result);
    }
  });
};

async function processDocx(docxFilePath, data) {
  try {
    const zip = new JSZip();
    const buffer = fs.readFileSync(docxFilePath);
    const zipContent = await zip.loadAsync(buffer);
    const xml = await zipContent.file('word/document.xml').async('string');

    xml2js.parseString(xml, (err, result) => {
      if (err) {
        console.error('������ �������� XML:', err);
        return;
      }

      const hyperlinks = findTags(result, 'w:hyperlink');
      
      hyperlinks.forEach(link => {
        const anchor = link[0]["$"]["w:anchor"]
       
      });
    });

    for (const [templateField, newValue] of Object.entries(data)) {
      console.log(templateField, newValue)
      const xmlField = templateField.replace(/\./g, ':');
      const regex = new RegExp(`<w:hyperlink[^>]*w:anchor="${xmlField}"[^>]*>`, 'g');
      xml = xml.replace(regex, newValue);
    }


    zipContent.file('word/document.xml', xml);


    const outputBuffer = await zipContent.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync('C:/Users/vanya/Desktop/updated_document.docx', outputBuffer);

    console.log('����������� ���� �������� ��� updated_document.docx');
  } catch (error) {
    console.error('������ ��������� ����� .docx:', error);
  }
}

function findTags(obj, tagName) {
  let results = [];
  if (typeof obj === "object") {
    for (let key in obj) {
      if (key === tagName) {
        results.push(obj[key]);
      } else if (typeof obj[key] === "object") {
        results = results.concat(findTags(obj[key], tagName));
      }
    }
  }
  return results;
}
ipcMain.handle(
  "generate-pdf",
  async (event, { templatePath, data, outputDocxPath }) => {
    try {
      replaceHyperlinksInDocxAndConvertToPdf(templatePath, data)
      return { success: true, outputPath: outputDocxPath };
    } catch (error) {
      console.error("Error generating PDF:", error);
      return { success: false, error };
    }
  }
);
