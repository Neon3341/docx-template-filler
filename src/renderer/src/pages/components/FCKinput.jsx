import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: '#fff',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#B2BAC2',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#E0E3E7',
        },
        '&:hover fieldset': {
            borderColor: '#B2BAC2',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#fff',
        },
    },
});
const BackInput = ({name, label, value, onChange }) => {

    return (
        <CssTextField
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