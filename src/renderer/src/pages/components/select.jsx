import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectLabels({
  name,
  slabel,
  items,
  sonChange,
  currentValue,
  stage,
}) {
  return (
    <div className="select">
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-helper-label">{slabel}</InputLabel>
        <Select
          name={name}
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={currentValue}
          label={slabel}
          onChange={sonChange}
        >
          <MenuItem value={""}>
            <em>None</em>
          </MenuItem>
          {stage === "templateStage" &&
            Object.entries(items).map(([key, value]) => (
              <MenuItem key={key} value={key + "$$$" + value}>
                {key}
              </MenuItem>
            ))}
          {stage === "seriesStage" &&
            Object.entries(items).map(([key, value]) => (
              <MenuItem key={key} value={key + "$$$" + JSON.stringify(value)}>
                {key}
              </MenuItem>
            ))}
          {stage === "editorStage" &&
            Object.entries(items).map(([key, value]) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
}
