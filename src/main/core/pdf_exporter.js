const fs = require("fs");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");
const path = require("path");

export default async function replaceHyperlinksInDocxAndConvertToPdf(
  inputDocxPath,
  replacements
) {
  // Загрузка XML файла
  const docxData = fs.readFileSync(inputDocxPath);
  const zip = await JSZip.loadAsync(docxData);
  const documentXmlData = await zip.file("word/document.xml").async("string");
  const dom = new JSDOM(documentXmlData, { contentType: "text/xml" });
  const document = dom.window.document;

  // Поиск всех тегов w:hyperlink
  const hyperlinks = document.getElementsByTagName("w:hyperlink");

  for (let hyperlink of hyperlinks) {
    const anchor = hyperlink.getAttribute("w:anchor");

    if (anchor) {
      const cleanedAnchor = anchor
        .replace(/^DTF:/, "")
        .replace(/:(text|date|number)$/, "")
        .replace(":", ".");
      if (replacements.hasOwnProperty(cleanedAnchor)) {
        console.log("Find:", cleanedAnchor);
        const textNodes = hyperlink.getElementsByTagName("w:t");

        for (let textNode of textNodes) {
          textNode.textContent = replacements[cleanedAnchor];
        }
      }
    }
  }
  console.log("Serialize XML");
  // Сериализация обновленного XML
  const updatedXML = dom.serialize();

  console.log("Create dir in APPDATA and write new docx");
  // Создаем директорию в APPDATA и записываем новый docx файл

  /**
   * TODO @ivanchick file name "const outputDocxPath" should be compiled dynamically -> 
   * 
   * document_number ? 
   * template_name + document_number 
   * : 
   * template_name + timestamp
   */

  const outputDocxPath = path.join(
    process.env.APPDATA,
    "docx-template-filler",
    "output.docx"
  );
  fs.mkdirSync(path.dirname(outputDocxPath), { recursive: true });
  zip.file("word/document.xml", updatedXML);
  const newDocxData = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(outputDocxPath, newDocxData);

  console.log("DOCX saved at:", outputDocxPath);

  /**
   * PDF is not needed anymore
   */
}
