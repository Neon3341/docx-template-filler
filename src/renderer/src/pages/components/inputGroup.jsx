import InputС from './input';


const InputGroup = ({ data }) => {

    return (
        <div className='inputs-block'>
            {data.map((input, index, array) => {
                return (<InputС name={input.name} label={input.label} height={input.height} type={input.type} value={input.value} onChange={input.onChange} />)
            })}
        </div>

    )

}

export default InputGroup