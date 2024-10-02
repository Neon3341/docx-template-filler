const fs = require("fs");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");
const path = require("path");
const os = require("os")

const { shell } = require('electron');
const { Notification } = require("electron");

/**
 * 
 * generateOutputDOCX - to large function to analyze data and fills document with placeholders
 * 
 * In the next updates, needs to rewrite func to class
 * 
 * @param {*} inputDocxPath - template DOCX path
 * @param {*} replacements - cleared RawData
 * @param {*} rawData - raw fields from front end
 */

export default async function generateOutputDOCX(
  inputDocxPath,
  replacements,
  rawData
) {
  console.log(replacements)
  /**
   *  Loading DOCX => XML file
   */
  const docxData = fs.readFileSync(inputDocxPath);
  const zip = await JSZip.loadAsync(docxData);
  const documentXmlData = await zip.file("word/document.xml").async("string");
  const dom = new JSDOM(documentXmlData, { contentType: "text/xml" });
  const document = dom.window.document;

  const hyperlinks = document.getElementsByTagName("w:hyperlink"); // Found w:hyperlink
  const hyperlinksArray = Array.from(hyperlinks); // Creating array to more safe

  for (let hyperlink of hyperlinksArray) {
    const anchor = hyperlink.getAttribute("w:anchor");
    if (anchor) {
      try {
        /**
         * Gets cleanedAnchor 
         */

        /**
         * TODO if date 
         * 
         * dayjs.locale('ru');
         * dayjs.extend(updateLocale)
         * dayjs.updateLocale('ru', {
         *  months: [
         *    "января", "февраля", "марта", "апреля", "мая", "июня", "июля",
         *    "августа", "сентября", "октября", "ноября", "декабря"
         *  ]
         * })
         * dayjs(newValue).format("«DD» MMMM YYYY")
         */
        const cleanedAnchor = anchor
          .replace(/^DTF:/, "")
          .replace(/:(text|date|number|select).*$/, "")
          .replace(":", ".");
        /**
        * Try to find cleanedAnchor in DOCX
        */
        if (replacements.hasOwnProperty(cleanedAnchor)) {
          console.log("Find:", cleanedAnchor);
          // Replacing text in nodes w:t
          const textNodes = hyperlink.getElementsByTagName("w:t");
          for (let textNode of textNodes) {
            textNode.textContent = replacements[cleanedAnchor];
          }
          /**
           * Deleting the w:rStyle node, if it exists (to remove link decoration in DOCX file)
           */
          try {
            const rElements = hyperlink.getElementsByTagName("w:r");
            for (let i = 0; i < rElements.length; i++) {
              const rElement = rElements[i];
              const rPrElements = rElement.getElementsByTagName("w:rPr");
              for (let i = 0; i < rPrElements.length; i++) {
                const rPrElement = rPrElements[i];
                const rStyle = rPrElement.getElementsByTagName("w:rStyle");
                while (rStyle.length > 0) {
                  rPrElement.removeChild(rStyle[0]); // Deleting all w:rStyle nodes
                }
              }
            }
          } catch (err) {
            console.log("Delete w:rStyle ERROR")
            console.error(err)
          }

          /**
           * Deleting the w:hyperlink node (to remove link logic in DOCX file)
           */
          try {
            const childNodes = Array.from(hyperlink.childNodes); // Saving child nodes in an array
            /**
             * Moving child nodes from w:hyperlink to the parent element
             */
            const parent = hyperlink.parentNode;
            for (let child of childNodes) {
              parent.insertBefore(child, hyperlink);
            }
            parent.removeChild(hyperlink); // Deleting the w:hyperlink tag itself
          } catch (err) {
            console.log("Delete w:hyperlink ERROR")
            console.error(err)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
  console.log("Serializing XML");
  const updatedXML = dom.serialize(); // Serialization of updated XML

  /**
   * Updates data in buffer (replaces XML with placeholders to XML with final values)
   */
  console.log("Write newDocxData XML");
  zip.file("word/document.xml", updatedXML);
  const newDocxData = await zip.generateAsync({ type: "nodebuffer" });

  /**
   * @HARDCODE
   * 
   * If you need to make your own `documentName` logic rewrite section below.
   * MB in next updates we'll make it in options tab, using vars and regular expressions, and there won't be hard code
   */
  let documentName = "";

  if (rawData["Документ"]["Номер документа"].value > 1) {
    console.log(inputDocxPath.split('\\').pop().split('/').pop());
    documentName = inputDocxPath.split('\\').pop().split('/').pop().split('.docx')[0] + "_" + rawData["Документ"]["Номер документа"].value + ".docx"
  } else {
    documentName = inputDocxPath.split('\\').pop().split('/').pop() + "_" + Date() + ".docx"
  }

  /**
   * @HARDCODE
   * 
   * Configure export path to base OS Document Dir
   * If you need to make your dist to export rewrite section below.   
   */
  // const outputDocxPath = path.join(
  //   os.homedir(),
  //   "Documents",
  //   "DTF export",
  //   documentName
  // );

  /**
   * @HARDCODE
   * 
   * Configure export path to base OneDrive Document Dir (RU OneDrive version)   
   * If you need to make your dist to export rewrite section below.   
   */
  const outputDocxPathOneDrive = path.join(
    os.homedir(),
    "OneDrive",
    "Документы",
    "DTF export",
    documentName
  );

  /**
   * Creates DIR where to export, then write files
   */
  console.log("Create dir in user documents and write new docx");
  // fs.mkdirSync(path.dirname(outputDocxPath), { recursive: true });
  // fs.writeFileSync(outputDocxPath, newDocxData);

  fs.mkdirSync(path.dirname(outputDocxPathOneDrive), { recursive: true });
  fs.writeFileSync(outputDocxPathOneDrive, newDocxData);

  //console.log("DOCX saved at:", outputDocxPath);
  console.log("DOCX saved at:", outputDocxPathOneDrive);

  const NOT_TITLE = `Документ ${documentName} создан!`
  const NOT_MESSAGE = "Нажмите на уведомление, что бы открыть."

  const notification = new Notification({ title: NOT_TITLE, body: NOT_MESSAGE })
  notification.show()
  notification.on('click', (event, arg) => {
    shell.showItemInFolder(outputDocxPathOneDrive);
  })


  const outputOneDriveDir = path.join(
    os.homedir(),
    "OneDrive",
    "Документы",
    "DTF export"
  );
  return outputOneDriveDir

}
