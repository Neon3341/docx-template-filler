import React, { useEffect, useState } from 'react';
import * as docx from 'docx-preview';

const Editor = () => {
    const [fileContent, setFileContent] = useState('');

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.readFile('G:\\Проекты - Рабочие\\docx-template-filler - templates\\шаблон_акт_дымоходы.docx');

            window.electronAPI.onFileData((data) => {
                if (data.success) {
                    // setFileContent(data.content); 

                    var options = { inWrapper: true, ignoreWidth: false, ignoreHeight: true, experimental: true, renderChanges: true, breakPages: true,} // https://github.com/VolodymyrBaydalka/docxjs#api
                    docx.renderAsync(data.content, document.getElementById("docx_container_preview"), null, options)
                        .then(x => console.log("docx: finished"));
                } else {
                    console.error(data.message);
                }
            });
        } else {
            console.error('electronAPI is undefined');
        }
    }, []);

    return (
        <div id='editor' className="clearBG">

            <h1>Редактор</h1>
            <div id="docx_container_preview"></div>
            <div dangerouslySetInnerHTML={{ __html: fileContent }} />
        </div>
    );
};

export default Editor;
