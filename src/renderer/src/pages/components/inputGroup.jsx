import InputС from './input';
import Select from './select'

const InputGroup = ({ data, onChange }) => {


    return (
        <div className='inputs-block'>
            { 
            Object.entries(data).map(([key, value], index, array) => {
                console.log(value)
                if (value.type == 'select') {
                   return( <Select name={value.name} slabel={value.label} items={value.options} sonChange={onChange} currentValue={value.value} stage={'editorStage'}> </Select> )     
                }
                else {
                   return (<InputС name={value.name} label={value.label} height={value.height} type={value.type} value={value.value} onChange={onChange} />)
                }
                
            })}
        </div>

    )

}

export default InputGroup