import React from "react"

import InputSection from "./inputSection";

const PopupContent = ({data, onChange}) => {
    console.log(data, "DATA")

    return (
        <div className="title-inputs-block">
            <InputSection data={data} onChange={onChange} />
        </div>
    )

}

export default PopupContent