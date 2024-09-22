import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';

const BackInput = ({ name, label, height, value, onChange }) => {
    const classes = "input-field " + height;

    return (
        <FormControl className={classes} variant="standard" color="warning">
            <InputLabel htmlFor="component-simple">Текст</InputLabel>
            <Input id="component-simple" />
        </FormControl>
    )

}

export default BackInput