import PopupContent from "./popupContent";
import Button from "./button"



const Popup = () => {

    return (
        <div className="popup">
            <PopupContent />
            <Button className="medium-gradient-btn" text="Следующий документ" />
        </div>
    )

}

export default Popup