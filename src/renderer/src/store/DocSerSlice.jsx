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
    },
    addNewTemplateToSeries(state, action) {
      state.paths.push(action.payload.path);
      state.fields[action.payload.name] = action.payload.fields || {};
    }
  },
});

export const { setDocSerName, setDocSerFields, setDocSerPath, addNewTemplateToSeries } = DocSerSlice.actions;
export default DocSerSlice.reducer;
