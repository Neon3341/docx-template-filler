import { configureStore } from "@reduxjs/toolkit";
import CurDocReducer from './CurDocSlice';
import DocSerReducer from './DocSerSlice';

const store = configureStore({
  reducer: {
    CurDoc: CurDocReducer,
    DocSer: DocSerReducer
  }
});

export default store;
