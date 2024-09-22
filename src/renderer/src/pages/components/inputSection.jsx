import InputGroup from "./inputGroup"
import Title from "./title"

const inputSection = ({ data }) => {

    return (
        <div>
            {
                Object.keys(data).forEach(function (key, index) {
                    console.log(data.key)
                    return (
                        <div>
                            <Title fontSize="20px" fontWeight="400" text={key} />
                            <InputGroup data={data[key]} />
                        </div>
                    )
                })
            }
        </div>
    )

}

export default inputSection