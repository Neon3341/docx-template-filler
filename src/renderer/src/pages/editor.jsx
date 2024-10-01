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
  const [documentsContent, setDocumentsContent] = useState({});

  let DataProcessState = 0;
  let taskManagerState = 0;

  const loadDocs = () => {
    useEffect(() => {
      if (window.electron.ipcRenderer) {
        for (let i = 0; i < docSerPaths.length; i++) {
          const docSerPath = docSerPaths[i];
          // window.electronAPI.readFile(docSerPath);
          window.electron.ipcRenderer
            .invoke("read-file-sync", docSerPath)
            .then((data) => {
              if (data.success) {
                let dataName = docSerPath
                  .split("\\")
                  .pop()
                  .split("/")
                  .pop()
                  .split(".docx")[0];
                if (!document.getElementById(dataName)) {
                  var previewSection = document.getElementById(
                    "docx_container_preview"
                  );
                  var child = document.createElement("div");
                  child.id = dataName;
                  previewSection.appendChild(child);
                  let updatedFields = {};
                  updatedFields[docSerPath] = data.content;
                  const options = {
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: true,
                    experimental: true,
                    renderChanges: false,
                    breakPages: true,
                    renderChanges: true,
                  };
                  docx
                    .renderAsync(
                      data.content,
                      document.getElementById(dataName),
                      null,
                      options
                    )
                    .then(() => {
                      update_document();
                      setLoadingBGColor("#FFFFFF");
                      setLoading(false);
                      setLoadingColor("#FFFF00");
                      load_placeholder();

                      update_document();
                      setLoadingBGColor("#FFFFFF");
                      setLoading(false);
                    });
                }
              } else {
                setLoadingColor("#FF0000");
                console.error(data.message);
              }
            });
          // window.electronAPI.onFileData((data) => {});
        }
      } else {
        console.error("electronAPI is undefined");
      }
    }, []);
  };

  loadDocs();
  useEffect(() => {
    if (docSerPaths.length === DataProcessState) {
      renderPreview();
    }
  }, [documentsContent]);

  const renderPreview = async () => {
    for (let i = 0; i < docSerPaths.length; i++) {
      const docSerPath = docSerPaths[i];
      const documentContent = documentsContent[docSerPath];
      let dataName = docSerPath
        .split("\\")
        .pop()
        .split("/")
        .pop()
        .split(".docx")[0];

      const options = {
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: true,
        experimental: true,
        renderChanges: false,
        breakPages: true,
        renderChanges: true,
      };
      await docx
        .renderAsync(
          documentContent,
          document.getElementById(dataName),
          null,
          options
        )
        .then(() => {
          taskManagerState++;
        });

      if (docSerPaths.length === taskManagerState) {
        setLoadingColor("#FFFF00");
        load_placeholder();

        update_document();
        setLoadingBGColor("#FFFFFF");
        setLoading(false);
      }
    }
  };

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
      let finalFieldType = fieldType;
      let options = [];
      if (fieldType.split("/")[0] == "select") {
        finalFieldType = "select";
        fieldType
          .split("/")[1]
          .split("|")
          .map((option) => {
            options.push(option);
          });

      }

      if (header === "#DTF") {
        if (!updatedFields[groupName]) {
          updatedFields[groupName] = {};
        }
        updatedFields[groupName][fieldName] = {
          name: groupName + ":" + fieldName,
          label: fieldName,
          height: "large",
          type: finalFieldType,
          value: "",
          options: options,
        };
      }
    });
    setFields((prev) => ({
      ...prev,
      ...updatedFields,
    }));

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

  useEffect(() => {
    update_document();
  }, [fields]);

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
  };

  const handleClick = (event) => {
    var data = $(event.target).attr("data");
    handleGenerateDocx();
  };

  // useEffect(() => {
  //     console.log("redux docSerFields:");
  //     console.log(docSerFields);
  // }, [docSerFields]);

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

  const handleGenerateDocx = async () => {
    const data = prepareData(docSerFields);

    const rawData = docSerFields;

    docSerPaths.map((value, index) => {
      const templatePath = docSerPaths[index];
      window.electron.ipcRenderer
        .invoke("generate-pdf", {
          templatePath,
          data,
          rawData,
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
    });
  };

  return (
    <div id="editor">
      <div id="docx_container_editor">
        <Popup
          data={fields}
          onChange={handleChange}
          series={docSerName}
          onClick={handleClick}
        />
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
        {docSerName === "false" ? "" : <PopupD data={docSerPaths} />}
      </div>
    </div>
  );
};

export default Editor;
