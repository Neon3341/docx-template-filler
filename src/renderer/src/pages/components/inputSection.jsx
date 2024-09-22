import InputGroup from "./inputGroup"
import Title from "./title"

const inputSection = ({ data }) => {

    return (
        <div>
            {
                Object.entries(data).map(
                    ([key, value], index, array) => {

                        return (
                            <div>
                                <Title fontSize="20px" fontWeight="400" text={key} />
                                <InputGroup data={value} />
                            </div>
                        )
                    }
                )}
        </div>
    )

}

export default inputSection