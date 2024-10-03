import InputGroup from "./inputGroup"
import Title from "./title"

const inputSection = ({ data, onChange }) => {

    return (
        <div className="inputs-section">
            {
                Object.entries(data).map(
                    ([key, value], index, array) => {

                        return (
                            <div className="inputs-group">
                                <Title fontSize="18px" text={key} />
                                <InputGroup data={value} onChange={onChange} />
                            </div>
                        )
                    }
                )}
        </div>
    )

}

export default inputSection