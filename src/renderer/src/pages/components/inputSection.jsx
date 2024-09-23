import InputGroup from "./inputGroup"
import Title from "./title"

const inputSection = ({ data }) => {

    return (
        <div className="inputs-section">
            {
                Object.entries(data).map(
                    ([key, value], index, array) => {

                        return (
                            <div className="inputs-group">
                                <Title fontSize="18px" fontWeight="500" text={key} />
                                <InputGroup data={value} />
                            </div>
                        )
                    }
                )}
        </div>
    )

}

export default inputSection