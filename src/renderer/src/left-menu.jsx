import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
const LeftMenu = () => {

  const curDocName = useSelector((state) => state.CurDoc.name);
  const curDocPath = useSelector((state) => state.CurDoc.path);
  const docSerName = useSelector((state) => state.DocSer.name);
  const docSerFields = useSelector((state) => state.DocSer.fields);

  const prepareData = (fields) => {
    let preparedData = {};
    Object.keys(fields).forEach((group) => {
      Object.keys(fields[group]).forEach((field) => {
        const fieldValue = fields[group][field].value;
        preparedData[`${group}.${field}`] = fieldValue;
      });
    });
    return preparedData;
  };

  const handleGeneratePdf = async () => {
    const templatePath = curDocPath;
    const outputDocxPath = "C:/Users/vanya/Desktop/Downloads/outputtt.docx"; 
    const outputPdfPath = "C:/Users/vanya/Desktop/Downloads/output.pdf"; 

    const data = prepareData(docSerFields);

    window.electron.ipcRenderer
      .invoke("generate-pdf", {
        templatePath,
        data,
        outputDocxPath,
        outputPdfPath,
      })
      .then((result) => {
        if (result.success) {
          console.log("PDF successfully generated at:", result.pdfPath);
        } else {
          console.error("Error generating PDF:", result.error);
        }
      })
      .catch((error) => {
        console.error("Failed to generate PDF:", error);
      });
  };

  return (
    <div id="left-menu">
      <ul>
        <li>
          <NavLink to="/">Главная</NavLink>
        </li>
        <li>
          <NavLink to="/editor">Редактор</NavLink>
        </li>
        <li>
          <NavLink to="/options">Настройки</NavLink>
        </li>
        <li>
          <button onClick={handleGeneratePdf}>Generate PDF</button>
        </li>
      </ul>
    </div>
  );
};

export default LeftMenu;
