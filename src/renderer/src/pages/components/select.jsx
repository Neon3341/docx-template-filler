import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectLabels({ slabel, items, sonChange, currentValue }) {


    return (
        <div className='select'>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label">{slabel}</InputLabel>
                <Select
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={currentValue}
                    label={slabel}
                    onChange={sonChange}
                    
                >
                    <MenuItem value={''}>
                        <em>None</em>
                    </MenuItem>
                    {Object.entries(items).map(([key, value], id, arr) => (
                        <MenuItem value={key + "$$$" + value}>{key}</MenuItem>
                    ))}
                </Select>

            </FormControl>
        </div>
    );
}
