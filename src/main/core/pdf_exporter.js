const fs = require("fs");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");
const path = require("path");
const os = require("os");
const docxToPdf = require("docx-pdf");

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

  // Сериализация обновленного XML
  const updatedXML = dom.serialize();

  // Создаем директорию в APPDATA и записываем новый docx файл
  const outputDocxPath = path.join(
    process.env.APPDATA,
    "docx-template-filler",
    "output.docx"
  );
  fs.mkdirSync(path.dirname(outputDocxPath), { recursive: true });
  zip.file("word/document.xml", updatedXML);
  const newDocxData = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(outputDocxPath, newDocxData);

  console.log("Новый .docx файл успешно создан с изменениями!");

  // Создаем путь для сохранения pdf в папке "Загрузки"
  const downloadsPath = path.join(os.homedir(), "Downloads");
  const outputPdfPath = path.join(downloadsPath, "output.pdf");

  // Конвертируем .docx в .pdf и сохраняем в папке "Загрузки"
  docxToPdf(
    outputDocxPath,
    path.join(process.env.APPDATA, "docx-template-filler", "output.pdf"),
    (err) => {
      if (err) {
        console.error("Ошибка конвертации в PDF:", err);
      } else {
        console.log('PDF файл успешно создан в папке "Загрузки"!');
      }
    }
  );
}
