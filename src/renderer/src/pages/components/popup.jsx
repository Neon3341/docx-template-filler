import React from "react"
import BackInput from "./FCKinput"
import Title from "./title"
import Button from "./button"


const Popup = () => {

    return (
        <div className="popup">
            <Title fontSize="20px" fontWeight="600" text="Поля для заполнения" />
            <br />
            <Title fontSize="20px" fontWeight="400" text="Название группы" />
            <BackInput name="ggggg" label="asdasdasdasd" height="large" onChange="" />
            <Button className="medium-gradient-btn" text="Следующий документ" />
            <Button className="medium-blue-btn" text="Редактировать серию" />
        </div>
    )

}

export default Popup