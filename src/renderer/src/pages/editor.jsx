import React, { useEffect, useState } from 'react';
import * as docx from 'docx-preview';
import $ from "jquery";

const Editor = () => {
    const [fileContent, setFileContent] = useState('');
    const [fields, setFields] = useState('');

    useEffect(() => {
        if (window.electronAPI) {
            // Чтение файла через Electron API
            window.electronAPI.readFile('G:\\Проекты - Рабочие\\docx-template-filler - templates\\шаблон_протокол.docx');

            window.electronAPI.onFileData((data) => {
                if (data.success) {
                    // Рендер DOCX файла в docx_container_preview
                    const options = {
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: true,
                        experimental: true,
                        renderChanges: false,
                        breakPages: true
                    };

                    docx.renderAsync(data.content, document.getElementById("docx_container_preview"), null, options)
                        .then(() => {
                            setFileContent(document.getElementById("docx_container_preview"));
                            load_placeholder();
                        });
                } else {
                    console.error(data.message);
                }
            });
        } else {
            console.error('electronAPI is undefined');
        }
    }, []);

    const load_placeholder = () => {
        const $preview_container = $('#docx_container_preview');
        const $links_array = $preview_container.find('a');
        let updatedFields = {}; // Объект для хранения данных в нужной структуре

        $links_array.each(function (index, element) {
            $(element).addClass('highlight')
            const href = $(element).attr('href');
            if (!href) return;

            const parts = href.split(':');
            if (parts.length !== 4) return;

            const header = parts[0];        // #DTF
            const groupName = parts[1];     // Группа
            const fieldName = parts[2];     // Название
            const fieldType = parts[3];     // Тип поля

            if (header === "#DTF") {
                if (!updatedFields[groupName]) {
                    updatedFields[groupName] = {};
                }
                if (!updatedFields[groupName][fieldType]) {
                    updatedFields[groupName][fieldType] = {};
                }
                updatedFields[groupName][fieldType][fieldName] = fieldName;
            }
        });

        // Обновляем state с новыми значениями
        setFields((prev) => ({
            ...prev,
            ...updatedFields
        }));

        console.log("Updated fields:", updatedFields);
        update_document();
    }

    const update_document = () => {
        const $preview_container = $('#docx_container_preview');
        const $links_array = $preview_container.find('a');

        $links_array.each(function (index, element) {
            const href = $(element).attr('href');
            if (!href) return;

            const parts = href.split(':');
            if (parts.length !== 4) return;

            const header = parts[0];        // #DTF
            const groupName = parts[1];     // Группа
            const fieldName = parts[2];     // Название
            const fieldType = parts[3];     // Тип поля

            // Находим подходящую группу и поле в объекте fields
            if (header === "#DTF" && fields[groupName] && fields[groupName][fieldType][fieldName]) {
                const newValue = fields[groupName][fieldType][fieldName];
                $(element).text(newValue);
            }
        });
    }

    const updater = () => {
        setTimeout(function () {
            update_document();
            updater()
        }, 500)
    }
    updater();

    return (
        <div id='editor' className="clearBG">
            <h1>Редактор</h1>
            <div id="docx_container_editor"></div>
            <div id="docx_container_preview"></div>
        </div>
    );
};

export default Editor;
