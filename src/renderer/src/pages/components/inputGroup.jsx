import InputС from './input';


const InputGroup = ({ data, onChange }) => {


    return (
        <div className='inputs-block'>
            
            { 
            Object.entries(data).map(([key, value], index, array) => {
                return (<InputС name={value.name} label={value.label} height={value.height} type={value.type} value={value.value} onChange={onChange} />)
                
            })}
        </div>

    )

}

export default InputGroup