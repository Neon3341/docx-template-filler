import React, { useState } from "react"
import Title from "./title";
import InputSection from "./inputSection";

const PopupContent = () => {


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
                name: "input3",
                label: "Поле 3",
                height: "large",
                type: "text",
                value: formData.input3,
                onChange: handleChange,
            },
            {
                name: "input4",
                label: "Поле 4",
                height: "large",
                type: "text",
                value: formData.input4,
                onChange: handleChange,
            }
        ]
    }

    return (
        <div className="title-inputs-block">
            <Title fontSize="24px" fontWeight="600" text="Поля для заполнения" />
            {/* <InputGroup data={InputArrayOne} /> */}
            <InputSection data={InputArrayOne} />
        </div>
    )

}

export default PopupContent