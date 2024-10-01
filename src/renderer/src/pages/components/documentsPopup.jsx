import React, { useEffect, useState } from "react";
import ButtonsGroup from "./buttonsGroup";
import Button from "./button";
import Title from "./title";
import Select from "./select";
import { useDispatch } from "react-redux";
import { addNewTemplateToSeries } from "../../store/DocSerSlice";

const PopupD = ({ data, onClick }) => {
  const [newTemplate, setNewTemplate] = useState("");
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const dispatch = useDispatch();
  const loadAvailableTemplates = () => {
    window.electron.ipcRenderer
      .invoke("getTemplates")
      .then((data) => {
        if (!Object.keys(data).length) {
          alert("Не обнаружено шаблонов :(");
        } else {
          setAvailableTemplates(data);
        }
      })
      .catch((error) => {
        console.error("Failed to getTemplates:", error);
      });
  };

  useEffect(() => {
    console.log(availableTemplates);
    console.log(Object.keys(availableTemplates).length);
  }, [availableTemplates]);

  const handleAddNewTemplate = () => {
    const parts = newTemplate.split("$$$");
    if (parts.length >= 2) {
      const newTemplateName = parts[0];
      const newTemplatePath = parts[1];
      dispatch(
        addNewTemplateToSeries({
          name: newTemplateName,
          path: newTemplatePath,
          fields: {},
        })
      );
    }
  };

  return (
    <div className="popupD">
      <Title fontSize="24px" fontWeight="600" text="Документы в серии" />
      <ButtonsGroup data={data} onClick={onClick} />
      <Button
        className="medium-blue-btn"
        text="Добавить новый шаблон"
        onClick={loadAvailableTemplates}
      />
      {Object.keys(availableTemplates).length > 0 && (
        <Select
          slabel="Выберите шаблон"
          items={availableTemplates}
          sonChange={(e) => setNewTemplate(e.target.value)}
          currentValue={newTemplate}
        />
      )}
      <Button
        className="medium-blue-btn"
        text="Добавить в серию"
        onClick={handleAddNewTemplate}
        disabled={!newTemplate}
      />
    </div>
  );
};

export default PopupD;
