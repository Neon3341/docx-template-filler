import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  paths: [],
  fields: {}
};

const DocSerSlice = createSlice({
  name: 'DocSer',
  initialState,
  reducers: {
    setDocSerName(state, action) {
      state.name = action.payload;
    }, 
    setDocSerPath(state, action) {
      state.paths.push(action.payload);
    },
    setDocSerFields(state, action) {
      // Обновляем только переданные поля, сохраняя остальные
      state.fields = {
        ...state.fields,
        ...action.payload
      };
    }
  },
});

export const { setDocSerName, setDocSerFields, setDocSerPath } = DocSerSlice.actions;
export default DocSerSlice.reducer;
