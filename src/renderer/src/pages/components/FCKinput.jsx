import TextField from '@mui/material/TextField';


const BackInput = ({name, label, value, onChange }) => {

    return (
        <TextField
                label={label}
                type="text"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
            />
    )
}

export default BackInput