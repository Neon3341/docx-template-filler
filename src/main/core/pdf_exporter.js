const fs = require("fs");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");
const path = require("path");
const os = require("os")

export default async function replaceHyperlinksInDocxAndConvertToPdf(
  inputDocxPath,
  replacements,
  rawData
) {
  // Загрузка XML файла
  const docxData = fs.readFileSync(inputDocxPath);
  const zip = await JSZip.loadAsync(docxData);
  const documentXmlData = await zip.file("word/document.xml").async("string");
  const dom = new JSDOM(documentXmlData, { contentType: "text/xml" });
  const document = dom.window.document;

  // Поиск всех тегов w:hyperlink
  const hyperlinks = document.getElementsByTagName("w:hyperlink");

  const hyperlinksArray = Array.from(hyperlinks); // Создаем массив для безопасной итерации

  for (let hyperlink of hyperlinksArray) {
    const anchor = hyperlink.getAttribute("w:anchor");

    if (anchor) {
      try {
        const cleanedAnchor = anchor
          .replace(/^DTF:/, "")
          .replace(/:(text|date|number)$/, "")
          .replace(":", ".");

        if (replacements.hasOwnProperty(cleanedAnchor)) {
          console.log("Find:", cleanedAnchor);
          const textNodes = hyperlink.getElementsByTagName("w:t");

          // Замена текста в узлах w:t
          for (let textNode of textNodes) {
            textNode.textContent = replacements[cleanedAnchor];
          }

          try {
            // Удаляем узел w:rStyle, если он существует
            const rElements = hyperlink.getElementsByTagName("w:r");
            for (let i = 0; i < rElements.length; i++) {
              const rElement = rElements[i];
              const rPrElements = rElement.getElementsByTagName("w:rPr");
              for (let i = 0; i < rPrElements.length; i++) {
                const rPrElement = rPrElements[i];
                const rStyle = rPrElement.getElementsByTagName("w:rStyle");
                while (rStyle.length > 0) {
                  rPrElement.removeChild(rStyle[0]); // Удаляем все узлы w:rStyle
                }
              }
            }

          } catch (err) {
            console.log("Delete w:rStyle ERROR")
            console.error(err)
          }

          try {
            // Сохраняем дочерние узлы в массив
            const childNodes = Array.from(hyperlink.childNodes);

            // Перемещаем дочерние узлы из w:hyperlink в родительский элемент
            const parent = hyperlink.parentNode;
            for (let child of childNodes) {
              parent.insertBefore(child, hyperlink);
            }

            // Удаляем сам тег w:hyperlink
            parent.removeChild(hyperlink);
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
  console.log("Serialize XML");
  // Сериализация обновленного XML
  const updatedXML = dom.serialize();


  console.log("Compile newDocxData");
  zip.file("word/document.xml", updatedXML);
  const newDocxData = await zip.generateAsync({ type: "nodebuffer" });

  console.log("Create dir in user documents and write new docx");

  let documentName = "";

  if (rawData["Документ"]["Номер документа"].value.length > 0) {
    console.log(inputDocxPath.split('\\').pop().split('/').pop());
    documentName = inputDocxPath.split('\\').pop().split('/').pop().split('.docx')[0] + "_" + rawData["Документ"]["Номер документа"].value + ".docx"
  } else {
    documentName = inputDocxPath.split('\\').pop().split('/').pop() + "_" + Date() + ".docx"
  }


  const outputDocxPath = path.join(
    os.homedir(),
    "Documents",
    "DTF export",
    documentName
  );
  const outputDocxPathOneDrive = path.join(
    os.homedir(),
    "OneDrive",
    "Документы",
    "DTF export",
    documentName
  );

  fs.mkdirSync(path.dirname(outputDocxPath), { recursive: true });
  fs.writeFileSync(outputDocxPath, newDocxData);

  fs.mkdirSync(path.dirname(outputDocxPathOneDrive), { recursive: true });
  fs.writeFileSync(outputDocxPathOneDrive, newDocxData);

  console.log("DOCX saved at:", outputDocxPath);
  console.log("DOCX saved at:", outputDocxPathOneDrive);
}
