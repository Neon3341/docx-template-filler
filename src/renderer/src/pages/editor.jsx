import React, { useEffect, useState } from "react";
import * as docx from "docx-preview";

import { useSelector, useDispatch } from "react-redux";
import { setDocSerFields } from "../store/DocSerSlice";

import debounce from 'lodash.debounce'

import { useNavigate } from "react-router-dom";

import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import Popup from "./components/popup";
import PopupD from "./components/documentsPopup";

import $ from "jquery";
//dayjs - to manipulate date render
import dayjs from "dayjs";
import "dayjs/locale/ru";
import updateLocale from "dayjs/plugin/updateLocale";

const Editor = () => {
  //dayjs - config
  dayjs.locale("ru");
  dayjs.extend(updateLocale);
  dayjs.updateLocale("ru", {
    months: [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ],
  });
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
  const [pendingUpdateLogicFields, setpendingUpdateLogicFields] = useState(false)


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
                alert(
                  "FATAL ERROR: read-file-sync. Press CTRL + R",
                  "Error message: ",
                  data.message
                );
                console.error(data.message);
              }
            });
        }
      } else {
        alert("FATAL ERROR: electronAPI is undefined");
        console.error("electronAPI is undefined");
      }
    }, []);
  };

  loadDocs();
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
      } else if (fieldType.split("/")[0] == "logic") {
        finalFieldType = "logic";
        options.push(fieldType.split("/")[1]);
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
        if (fieldType === "date") {
          $(element).text(dayjs(newValue).format("«DD» MMMM YYYY"));
        } else {
          $(element).text(newValue);
        }
      }
    });
  };

  const DebounceUpdateLogicFields = debounce((updatedFields) => {
    updateLogicFields(updatedFields);
    update_document();
  }, 0)

  const handleChange = (event) => {
    
    const { name, value } = event.target;

    var parts = name.split(":");
    const groupName = parts[0];
    const fieldName = parts[1];
    
    const fileds = setFields((prevFields) => {
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
      DebounceUpdateLogicFields(updatedFields)
      return updatedFields;
      update_document();
    });

  };

  useEffect(() => {
    update_document();
  }, [fields])

  // useEffect(() => {
  //   if (pendingUpdateLogicFields) {
  //     console.log("true");
  //     updateLogicFields(pendingUpdateLogicFields);

  //   } else {
  //     console.log("false");
  //   }
  // }, [pendingUpdateLogicFields]);

  useEffect(() => {
    return () => {
      DebounceUpdateLogicFields.cancel();
    }
  }, [])

  const updateLogicFields = (newFields) => {
    setpendingUpdateLogicFields(false)
    console.log(
      "updateLogicFields updateLogicFields updateLogicFields updateLogicFields"
    );
    console.log(newFields);
    Object.entries(newFields).map(([group, fields], index) => {
      Object.entries(fields).map(([name, field], index) => {
        if (field.type == "logic") {
          const regEx = /\[([^\[\]]+?\$\$\$\$[^\[\]]+?)\]/g;
          let items = [];
          let item;
          while ((item = regEx.exec(field.options[0])) != null) {
            items.push(item[1]);
          }
          let updatedString = field.options[0];
          items.forEach((item) => {
            const itemData = item.split("$$$$");
            const group = itemData[0];
            const field = itemData[1];
            const itemValue = newFields[group][field].value;
            console.log(itemValue.length);
            updatedString = updatedString.replace(
              new RegExp(`\\[(${group}\\$\\$\\$\\$${field})\\]`, "g"),
              `"${itemValue}"`
            );
          });
          console.log(updatedString);
          updatedString = `const func = () => {${updatedString}}; func()`;
          let result = eval(updatedString);
          try {
            result = eval(updatedString);
          } catch (error) {
            console.error(error);
          }
          setFields((prevFields) => {
            const updatedFields = {
              ...prevFields,
              [group]: {
                ...prevFields[group],
                [name]: {
                  ...prevFields[group][name],
                  value: result,
                },
              },
            };

            dispatch(setDocSerFields(updatedFields));
            update_document();
            return updatedFields;
          });
        }
      });
    });
  };

  const handleClick = (event) => {
    var data = $(event.target).attr("data");
    handleGenerateDocx();
  };

  // const updater = () => {
  //   setTimeout(function () {
  //     update_document();
  //     updater();
  //   }, 500);
  // };

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
        .invoke("generate-docx", {
          templatePath,
          data,
          rawData,
        })
        .then((result) => {
          if (result.success) {
            console.log("DOCX successfully generated at:", result.outputDir);
          } else {
            alert("Error generating DOCX:", result.error);
            console.error("Error generating DOCX:", result.error);
          }
        })
        .catch((error) => {
          console.error("Failed to invoke generate-docx:", error);
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
