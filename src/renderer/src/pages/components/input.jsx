import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

const InputC = ({ name, label, height, type, value, onChange }) => {
    const classes = "input-field " + height;


    return (
        <FormControl className={classes} variant="standard" color="warning" id={name}>
            <InputLabel htmlFor={name + "_input"}>{label}</InputLabel>
            <Input id={name + "_input"} name={name} type={type} value={value} onChange={onChange} />
        </FormControl>
    )

}

export default InputC