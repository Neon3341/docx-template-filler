import React, { useState, useEffect } from "react"
import Button from './components/button';
import Select from './components/select';

import { useSelector, useDispatch } from 'react-redux';
import { setCurDocName,  setCurDocPath} from '../store/CurDocSlice'; 
import { setDocSerName} from '../store/DocSerSlice'; 


const Home = () => {
    const dispatch = useDispatch();

    const [templates, setTemplates] = useState({});
    const [template, setTemplate] = useState('');
    const [stage, setStage] = useState("chooseStage");

    const chooseTemplate = () => {
        window.electron.ipcRenderer
            .invoke("getTemplates")
            .then((data) => {
                if (!Object.keys(data).length) {
                    alert("Не обнаружено шаблонов :(")
                } else {
                    setTemplates(data);
                    setStage("templateStage");
                }
            })
            .catch((error) => {
                console.error("Failed to getTemplates:", error);
            });
    }
    const handleChange = (event) => {
        setTemplate(event.target.value);
        var parts = template.split(":");

        dispatch(setCurDocName(parts[0]));
        dispatch(setCurDocPath(parts[1]));
        dispatch(setDocSerName(false));

        console.log(useSelector((state) => state.CurDoc.name));
        console.log(useSelector((state) => state.CurDoc.path));
        console.log(useSelector((state) => state.DocSer.name));

        /**
         * TODO DISPATCH!!!
         */
    };

    const goBack = () => {
        setStage("chooseStage");
    }

    const startEditTemplate = () => {
        alert("В разработке!")
    }

    const chooseSeries = () => {
        alert("Серии документов станут доступны в ближайшем будущем!")
    }


    const stageContent = {
        chooseStage:
            <div className="buttons_section">
                <Button className="medium-border-btn" text="Создать серию документов" onClick={chooseSeries} />
                <Button className="medium-gradient-btn" text="Создать документ" onClick={chooseTemplate} />
            </div>,
        templateStage:
            <div className="buttons_section_triple">
                <Button className="medium-border-btn" text="Назад" onClick={goBack} />
                <Select slabel="Выберите шаблон" items={templates} sonChange={handleChange} currentValue={template} />
                <Button className="medium-gradient-btn" text="редактировать!" onClick={startEditTemplate} />
            </div>,
        seriesStage:
            <div className="buttons_section_triple">
                <Button className="medium-border-btn" text="Создать серию документов" onClick={chooseSeries} />
                <Button className="medium-gradient-btn" text="Создать документ" onClick={chooseTemplate} />
            </div>,
    }

    return (
        <div id='home' >
            <img src="src/resources/logo.png" />
            <div className="title-section">
                <h1>DTF</h1>
                <h3>Docx Template Filler</h3>
            </div>
            {stageContent[stage]}
        </div>
    )

}

export default Home