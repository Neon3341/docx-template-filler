import PopupContent from "./popupContent";
import Button from "./button"
import Title from "./title";


const Popup = ({ data, onChange, series, onClick }) => {


    return (
        <div className="popup">
            <Title fontSize="24px" fontWeight="600" text="Поля для заполнения" />
            <PopupContent data={data} onChange={onChange} />
            {
                series === "false" ? <Button className="medium-gradient-btn" text="Экспортировать PDF" onClick={onClick} data={series}/> : <Button className="medium-gradient-btn" text="Следующий документ" onClick={onClick} data={series}/>
            }

        </div>
    )

}

export default Popup