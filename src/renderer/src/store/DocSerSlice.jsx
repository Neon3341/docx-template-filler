import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  DocSerName: 'Серия не выбрана!',
  fields: {}
};

const DocSerSlice = createSlice({
  name: 'DocSer',
  initialState,
  reducers: {
    setDocSerName(state, action) {
      state.DocSerName = action.payload;
    },
    setDocSerFields(state, action) {
      state.fields = action.payload;
    }
  },
});

export const { setDocSerName, setDocSerFields} = DocSerSlice.actions;
export default DocSerSlice.reducer;