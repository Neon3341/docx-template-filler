import ButtonsGroup from "./buttonsGroup";
import Button from "./button"
import Title from "./title";


const PopupD = ({ data, onClick }) => {

    const scrollToDocument = (event) => {
        const blockID = event.target.getAttribute('data').split('\\').pop().split('/').pop().split('.docx')[0];
        document.getElementById(blockID).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    return (
        <div className="popupD">
            <Title fontSize="24px" fontWeight="600" text="Документы в серии" />
            <ButtonsGroup data={data} onClick={scrollToDocument} />
            <Button className="medium-blue-btn" text="Редактировать серию" disabled={true} />
        </div>
    )

}

export default PopupD