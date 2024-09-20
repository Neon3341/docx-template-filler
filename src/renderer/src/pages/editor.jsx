import React, { useEffect, useState, useRef } from 'react';
import * as docx from 'docx-preview';
import * as mammoth from 'mammoth';
import { TextField } from '@mui/material';

const Editor = () => {
    const [fileContent, setFileContent] = useState('');
    const [placeholders, setPlaceholders] = useState([]);
    const [formData, setFormData] = useState({});
    const previewRef = useRef(null);  // Создаем ref для контейнера с документом

    useEffect(() => {
        if (window.electronAPI) {
            // Чтение файла через Electron API
            window.electronAPI.readFile('G:\\Проекты - Рабочие\\docx-template-filler - templates\\шаблон_акт_дымоходы.docx');

            window.electronAPI.onFileData(async (data) => {
                if (data.success) {
                    const options = {
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: true,
                        experimental: true,
                        renderChanges: true,
                        breakPages: true
                    };

                    docx.renderAsync(data.content, previewRef.current, null, options)
                        .then(() => {
                            console.log("docx: finished");

                            // Использование mammoth для извлечения текста из DOCX
                            mammoth.extractRawText({ arrayBuffer: data.content })
                                .then((result) => {
                                    const text = result.value; // Текст документа
                                    const updatedContent = replacePlaceholders(text);
                                    setFileContent(updatedContent);
                                })
                                .catch((error) => {
                                    console.error("Ошибка при извлечении текста из DOCX:", error);
                                });
                        });
                } else {
                    console.error(data.message);
                }
            });
        } else {
            console.error('electronAPI is undefined');
        }
    }, []);

    // Функция для поиска и замены шаблонов вида [#DTF:doc/group:docdate/date]
    const replacePlaceholders = (content) => {
        const placeholderPattern = /\[#DTF:([a-z]+)\/([a-z]+):([a-z]+)\/([a-z]+)\]/gi; // Регулярное выражение для поиска
        const foundPlaceholders = [];
        let updatedContent = content;

        updatedContent = content.replace(placeholderPattern, (match, id, group, field, type) => {
            const newPlaceholder = { group, id, field, type };

            // Проверяем, есть ли уже такой placeholder
            const exists = foundPlaceholders.some(placeholder =>
                placeholder.group === group &&
                placeholder.id === id &&
                placeholder.field === field &&
                placeholder.type === type
            );

            // Добавляем, только если такого placeholder'а ещё нет
            if (!exists) {
                foundPlaceholders.push(newPlaceholder);
            }

            return `{{${id}_${field}}}`;  // Временно заменим ключевики на более удобную метку для дальнейшей замены
        });

        setPlaceholders(foundPlaceholders);
        return updatedContent;
    };


    // Обработка изменения инпута
    const handleInputChange = (id, value) => {
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    // Функция для генерации инпутов на основе placeholders
    const renderInputs = () => {
        return placeholders.map((placeholder, index) => {
            const { id, field, type } = placeholder;
            const inputId = `${id}_${field}`;

            return (
                <TextField
                    key={index}
                    label={inputId}
                    value={formData[inputId] || ''}
                    onChange={(e) => handleInputChange(inputId, e.target.value)}
                    type={type === 'date' ? 'date' : 'text'}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                />
            );
        });
    };

    // Функция для замены меток в контенте на данные из инпутов
    const updateContentWithInputs = () => {
        // Получаем текущий HTML контент из previewRef
        let updatedContent = previewRef.current.innerHTML;
    
        Object.keys(formData).forEach(key => {
            const regex = new RegExp(`\\[\\s*#DTF:([a-z]+)/group:${key}/([a-z]+)\\s*\\]`, 'g');
            updatedContent = updatedContent.replace(regex, formData[key]);
        });
    
        // Обновляем содержимое контейнера документа
        if (previewRef.current) {
            previewRef.current.innerHTML = updatedContent;  // Вставляем обновленный HTML
            console.log("previewRef.current.innerHTML success");
        } else {
            console.error("previewRef.current not found");
        }
    };
    


    return (
        <div id='editor' className="clearBG">
            <h1>Редактор</h1>
            <button onClick={() => updateContentWithInputs()}>Обновить документ</button>
            <div id="docx_container_editor">
                {renderInputs()}
            </div>
            <div id="docx_container_preview" ref={previewRef}></div>  {/* Добавляем ref */}
            
        </div>
    );
};

export default Editor;
