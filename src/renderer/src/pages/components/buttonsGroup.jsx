import Button from "./button"



const ButtonsGroup = ({ data, onClick }) => {


    return (
        <div className="buttons-group">
            {
                data.map(
                    (value, index, array) => {
                        const fileName = value.split('\\').pop();
                        return (
                            <Button className="medium-border-btn-simple" data={value} onClick={onClick} text={fileName}/>
                        )
                    }
                )}
        </div>
    )

}

export default ButtonsGroup