import React, { useEffect, useState } from "react";
import * as docx from "docx-preview";

import { useSelector, useDispatch } from "react-redux";
import { setDocSerFields } from "../store/DocSerSlice";

import { useNavigate } from "react-router-dom";

import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import Popup from "./components/popup";
import PopupD from "./components/documentsPopup";

import $ from "jquery";

const Editor = () => {
  const curDocName = useSelector((state) => state.CurDoc.name);
  const curDocPath = useSelector((state) => state.CurDoc.path);
  const docSerName = useSelector((state) => state.DocSer.name);
  const docSerPaths = useSelector((state) => state.DocSer.paths);
  const docSerFields = useSelector((state) => state.DocSer.fields);

  const navigate = useNavigate();
  if (!curDocPath) {
    navigate("/");
  }

  const dispatch = useDispatch();

  const [fields, setFields] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingColor, setLoadingColor] = useState("#FF6600");
  const [loadingBGColor, setLoadingBGColor] = useState("#222222");

  const handleChange = (event) => {
    update_document();
    const { name, value } = event.target;

    var parts = name.split(":");
    const groupName = parts[0];
    const fieldName = parts[1];

    setFields((prevFields) => {
      const updatedFields = {
        ...prevFields,
        [groupName]: {
          ...prevFields[groupName],
          [fieldName]: {
            ...prevFields[groupName][fieldName],
            value: value,
          },
        },
      };

      dispatch(setDocSerFields(updatedFields));

      return updatedFields;
    });

    update_document();
    console.log(docSerFields);
  };

  const handleClick = (event) => {
    var data = $(event.target).attr("data");

    /**
     * TODO write switch to next Doc
     */
    if (data !== "false") {
      console.log("switch to next Doc!");
    } else {
      console.log("Export Doc to PDF!");
      handleGeneratePdf();
    }

  };

  useEffect(() => {
    update_document();
  }, [fields]);

  // useEffect(() => {
  //     console.log("redux docSerFields:");
  //     console.log(docSerFields);
  // }, [docSerFields]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.readFile(curDocPath); //каждый путь освоит свой

      window.electronAPI.onFileData((data) => {
        if (data.success) {
          const options = {
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: true,
            experimental: true,
            renderChanges: false,
            breakPages: true,
          };
          setLoadingColor("#FFFF00");

          docx
            .renderAsync(
              data.content,
              document.getElementById("docx_container_preview"),
              null,
              options
            )
            .then(() => {
              load_placeholder();
            });
        } else {
          setLoadingColor("#FF0000");
          console.error(data.message);
        }
      });
    } else {
      console.error("electronAPI is undefined");
    }
  }, []);

  const load_placeholder = () => {
    const $preview_container = $("#docx_container_preview");
    const $links_array = $preview_container.find("a");
    let updatedFields = {};

    $links_array.each(function (index, element) {
      $(element).addClass("highlight");
      const href = $(element).attr("href");
      if (!href) return;

      const parts = href.split(":");
      if (parts.length !== 4) return;

      const header = parts[0]; // #DTF
      const groupName = parts[1]; // Группа
      const fieldName = parts[2]; // Название
      const fieldType = parts[3]; // Тип поля

      if (header === "#DTF") {
        if (!updatedFields[groupName]) {
          updatedFields[groupName] = {};
        }
        updatedFields[groupName][fieldName] = {
          name: groupName + ":" + fieldName,
          label: fieldName,
          height: "large",
          type: fieldType,
          value: "",
        };
      }
    });

    // Обновляем state с новыми значениями
    setFields((prev) => ({
      ...prev,
      ...updatedFields,
    }));

    // console.log("Updated fields:", updatedFields);
    update_document();
    setLoadingBGColor("#FFFFFF");
    setLoading(false);
  };

  const update_document = () => {
    let $preview_container = $("#docx_container_preview");
    let $links_array = $preview_container.find("a");

    $links_array.each(function (index, element) {
      const href = $(element).attr("href");
      if (!href) return;

      const parts = href.split(":");
      if (parts.length !== 4) return;

      const header = parts[0]; // #DTF
      const groupName = parts[1]; // Группа
      const fieldName = parts[2]; // Название
      const fieldType = parts[3]; // Тип поля

      // Находим подходящую группу и поле в объекте fields
      if (
        header === "#DTF" &&
        fields[groupName] &&
        fields[groupName][fieldName]
      ) {
        const newValue = fields[groupName][fieldName].value;
        $(element).text(newValue);
      }
    });
  };

  const updater = () => {
    setTimeout(function () {
      update_document();
      updater();
    }, 500);
  };

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

    const rawData = docSerFields;

    window.electron.ipcRenderer
      .invoke("generate-pdf", {
        templatePath,
        data,
        rawData,
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
    <div id="editor">
      <div id="docx_container_editor">
        <Popup data={fields} onChange={handleChange} series={docSerName} onClick={handleClick} />
      </div>
      <div
        id="docx_container_preview"
        style={{ backgroundColor: loadingBGColor }}
      ></div>
      {loading ? (
        <Box className={"loading_elem"} sx={{ display: "flex" }}>
          <CircularProgress
            sx={(theme) => ({
              color: loadingColor,
              animationDuration: "550ms",
              [`& .${circularProgressClasses.circle}`]: {
                strokeLinecap: "round",
              },
              ...theme.applyStyles("dark", {
                color: "#308fe8",
              }),
            })}
          />
        </Box>
      ) : (
        <></>
      )}
      <div id="docx_container_docs">
        {
          docSerName === "false" ? "" : <PopupD data={docSerPaths} />
        }

      </div>
    </div>
  );
};

export default Editor;
