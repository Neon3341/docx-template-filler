import PopupContent from "./popupContent";
import Button from "./button"
import Title from "./title";


const Popup = ({data, onChange}) => {

    
    return (
        <div className="popup">
            <Title fontSize="24px" fontWeight="600" text="Поля для заполнения" />
            <PopupContent data={data} onChange={onChange}/>
            <Button className="medium-gradient-btn" text="Следующий документ" />
        </div>
    )

}

export default Popup