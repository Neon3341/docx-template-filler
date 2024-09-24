import React from "react"
import Button from './components/button';


const Home = () => {


    return (
        <div id='home' >
            <img src="src/resources/logo.png"/>
            <div className="title-section">
                <h1>DTF</h1>
                <h3>Docx Template Filler</h3>
            </div>
            <div className="buttons_section">
                <Button className="medium-border-btn" text="Создать серию документов" />
                <Button className="medium-gradient-btn" text="Создать документ" />
            </div>
        </div>
    )

}

export default Home