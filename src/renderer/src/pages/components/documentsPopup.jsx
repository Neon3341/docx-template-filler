import ButtonsGroup from "./buttonsGroup";
import Button from "./button"
import Title from "./title";


const PopupD = ({ data, onClick }) => {


    return (
        <div className="popupD">
            <Title fontSize="24px" fontWeight="600" text="Документы в серии" />
            <ButtonsGroup data={data} onClick={onClick} />
            <Button className="medium-blue-btn" text="Редактировать серию" disabled={true} />
        </div>
    )

}

export default PopupD