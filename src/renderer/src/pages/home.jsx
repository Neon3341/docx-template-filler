import React, { useState, useEffect } from "react";
import Button from './components/button';
import Select from './components/select';

import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { setCurDocName, setCurDocPath } from '../store/CurDocSlice';
import { setDocSerName, setDocSerPath } from '../store/DocSerSlice';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Получаем значения из состояния
    const curDocName = useSelector((state) => state.CurDoc.name);
    const curDocPath = useSelector((state) => state.CurDoc.path);
    const docSerName = useSelector((state) => state.DocSer.name);

    const [templates, setTemplates] = useState({});
    const [template, setTemplate] = useState('');
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
                console.error("Failed to getTemplates:", error);
            });
    };

    const handleChange = (event) => {
        setTemplate(event.target.value);
        const parts = event.target.value.split("$$$");

        if (parts.length >= 2) {
            dispatch(setCurDocName(parts[0]));
            dispatch(setCurDocPath(parts[1]));
            dispatch(setDocSerPath(parts[1]));
            dispatch(setDocSerPath("C:\\Users\\et010\\AppData\\Roaming\\docx-template-filler\\templates\\шаблон_проверки.docx"));
        }
        dispatch(setDocSerName("тестовая серия"));
    };

    useEffect(() => {
        if (curDocName.length > 2 && curDocName != false) {
            setTemplateButtonState(false)
        } else {
            setTemplateButtonState(true)
        }
    }, [curDocName]);

    useEffect(() => {
        if (docSerName.length > 2 && docSerName != false) {
            setSerButtonState(false)
        } else {
            setSerButtonState(true)
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
            navigate('/editor');
        }
    };

    const chooseSeries = () => {
        alert("Серии документов станут доступны в ближайшем будущем!");
    };

    const stageContent = {
        chooseStage: (
            <div className="buttons_section">
                <Button className="medium-border-btn" text="Создать серию документов" onClick={chooseSeries} />
                <Button className="medium-gradient-btn" text="Создать документ" onClick={chooseTemplate} />
            </div>
        ),
        templateStage: (
            <div className="buttons_section_triple">
                <Button className="medium-border-btn" text="Назад" onClick={goBack} />
                <Select slabel="Выберите шаблон" items={templates} sonChange={handleChange} currentValue={template} />
                <Button className="medium-gradient-btn" text="редактировать!" onClick={startEditTemplate} disabled={templateButtonState} />
            </div>
        ),
        seriesStage: (
            <div className="buttons_section_triple">
                <Button className="medium-border-btn" text="Создать серию документов" onClick={chooseSeries} />
                <Button className="medium-gradient-btn" text="Создать документ" onClick={chooseTemplate} disabled={serButtonState} />
            </div>
        ),
    };

    return (
        <div id='home'>
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
