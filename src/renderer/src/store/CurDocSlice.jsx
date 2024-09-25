import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: "",
  path: ""
};

const CurDocSlice = createSlice({
  name: 'CurDoc',
  initialState,
  reducers: {
    setCurDocName(state, action) {
      state.name = action.payload;
    },
    setCurDocPath(state, action) {
      state.path = action.payload;
    }
  },
});

export const { setCurDocName, setCurDocPath} = CurDocSlice.actions;
export default CurDocSlice.reducer;