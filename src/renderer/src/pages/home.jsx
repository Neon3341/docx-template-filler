import React, { useState, useEffect } from "react";
import Button from "./components/button";
import Select from "./components/select";

import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { setCurDocName, setCurDocPath } from "../store/CurDocSlice";
import { setDocSerName, setDocSerPath, clearDocSer } from "../store/DocSerSlice";


const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Получаем значения из состояния
    const curDocName = useSelector((state) => state.CurDoc.name);
    const curDocPath = useSelector((state) => state.CurDoc.path);
    const docSerName = useSelector((state) => state.DocSer.name);

    const [templates, setTemplates] = useState({});
    const [template, setTemplate] = useState("");
    const [stage, setStage] = useState("chooseStage");
    const [templateButtonState, setTemplateButtonState] = useState(true);
    const [serButtonState, setSerButtonState] = useState(true);

    const chooseTemplate = () => {
        window.electron.ipcRenderer
            .invoke("getTemplates")
            .then((data) => {
                if (!Object.keys(data).length) {
                    alert("Не обнаружено шаблонов :(");
                } else {
                    setTemplates(data);
                    setStage("templateStage");
                }
            })
            .catch((error) => {
                alert("Ошибка вызова: getTemplates", error);
                console.error("Failed to getTemplates:", error);
            });
    };

    const handleChange = (event) => {
        if (stage == "templateStage") {
            dispatch(clearDocSer());
            setTemplate(event.target.value);
            const parts = event.target.value.split("$$$");

            if (parts.length >= 2) {
                dispatch(setCurDocName(parts[0]));
                dispatch(setCurDocPath(parts[1]));
                dispatch(setDocSerPath(parts[1]));
            }
            dispatch(setDocSerName("false"));
        }
        else if (stage == "seriesStage") {
            dispatch(clearDocSer());
            setTemplate(event.target.value);
            const parts = event.target.value.split("$$$");
            const templatesPaths = JSON.parse(parts[1])['templatesPaths']
            dispatch(setCurDocName(templatesPaths[0]))
            dispatch(setCurDocPath(parts[1]));
            console.log(templatesPaths)
            templatesPaths.forEach(templatePath => {
                dispatch(setDocSerPath(templatePath));
            });
            dispatch(setDocSerName(parts[0]));
        }
    };

    useEffect(() => {
        if (curDocName.length > 2 && curDocName != false) {
            setTemplateButtonState(false);
        } else {
            setTemplateButtonState(true);
        }
    }, [curDocName]);

    useEffect(() => {
        if (docSerName.length > 2 && docSerName != false) {
            setSerButtonState(false);
        } else {
            setSerButtonState(true);
        }
    }, [docSerName]);

    // useEffect(() => {
    //     console.log("Updated curDocPath:", curDocPath);
    // }, [curDocPath]);

    const goBack = () => {
        setStage("chooseStage");
    };

    const startEditTemplate = () => {
        if (curDocName.length > 2 && curDocName != false) {
            navigate("/editor");
        } else {
            alert("Документ подготавливается, нажмите еще раз :)")
        }
    };

    const chooseSeries = () => {
        window.electron.ipcRenderer
            .invoke("getSeries")
            .then((data) => {
                if (!Object.keys(data).length) {
                    alert("Не обнаружено серий :(");
                } else {
                    setTemplates(data);
                    setStage("seriesStage");
                }
            })
            .catch((error) => {
                alert("Ошибка вызова: getSeries", error);
                console.error("Failed to getSeries:", error);
            });
    };

    const stageContent = {
        chooseStage: (
            <div className="buttons_section">
                <Button
                    className="medium-border-btn"
                    text="Создать серию документов"
                    onClick={chooseSeries}
                />
                <Button
                    className="medium-gradient-btn"
                    text="Создать документ"
                    onClick={chooseTemplate}
                />
            </div>
        ),
        templateStage: (
            <div className="buttons_section_triple">
                <Button className="medium-border-btn" text="Назад" onClick={goBack} />
                <Select
                    slabel="Выберите шаблон"
                    items={templates}
                    sonChange={handleChange}
                    currentValue={template}
                    stage={stage}
                />
                <Button
                    className="medium-gradient-btn"
                    text="редактировать!"
                    onClick={startEditTemplate}
                    disabled={templateButtonState}
                />
            </div>
        ),
        seriesStage: (
            <div className="buttons_section_triple">
                <Button className="medium-border-btn" text="Назад" onClick={goBack} />
                <Select
                    slabel="Выберите серию шаблонов"
                    items={templates}
                    sonChange={handleChange}
                    currentValue={template}
                    stage={stage}
                />
                <Button
                    className="medium-gradient-btn"
                    text="редактировать!"
                    onClick={startEditTemplate}
                    disabled={serButtonState}
                />
            </div>
        ),
    };

    return (
        <div id="home">
            <img src="src/resources/logo.png" />
            <div className="title-section">
                <h1>DTF</h1>
                <h3>Docx Template Filler</h3>
            </div>
            {stageContent[stage]}
        </div>
    );
};

export default Home;
