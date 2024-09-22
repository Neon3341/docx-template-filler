import React, { useState } from "react"
import InputGroup from "./inputGroup"
import Title from "./title"
import Button from "./button"



const Popup = () => {

    const [formData, setFormData] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
        console.log(formData[name])
    };

    const InputArrayOne = {
        "Документ": [
            {
                name: "input1",
                label: "Поле 1",
                height: "large",
                type: "text",
                value: formData.input1,
                onChange: handleChange,
            },
            {
                name: "input2",
                label: "Поле 2",
                height: "large",
                type: "text",
                value: formData.input2,
                onChange: handleChange,
            }
        ],
        "Оборудование": [
            {
                name: "input1",
                label: "Поле 1",
                height: "large",
                type: "text",
                value: formData.input1,
                onChange: handleChange,
            },
            {
                name: "input2",
                label: "Поле 2",
                height: "large",
                type: "text",
                value: formData.input2,
                onChange: handleChange,
            }
        ]
    }



    return (
        <div className="popup">
            <Title fontSize="20px" fontWeight="600" text="Поля для заполнения" />
            <br />
            <Title fontSize="20px" fontWeight="400" text="Название группы" />
            <InputGroup data={InputArrayOne} />
            <Button className="medium-gradient-btn" text="Следующий документ" />
            <Button className="medium-blue-btn" text="Редактировать серию" />
        </div>
    )

}

export default Popup