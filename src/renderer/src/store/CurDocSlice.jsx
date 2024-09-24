import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: 'Документ не выбран!',
  path: ""
};

const CurDocSlice = createSlice({
  name: 'CurDoc',
  initialState,
  reducers: {
    setCurDocName(state, action) {
      state.CurDocName = action.payload;
    },
    setCurDocPath(state, action) {
      state.path = action.payload;
    }
  },
});

export const { setCurDocName, setCurDocPath} = CurDocSlice.actions;
export default CurDocSlice.reducer;