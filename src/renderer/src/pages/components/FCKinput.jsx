import TextField from '@mui/material/TextField';


const BackInput = ({name, label, height, value, onChange }) => {

    return (
        <TextField
                label={label}
                type="text"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className={height}
            />
    )
}

export default BackInput