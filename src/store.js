import { configureStore } from "@reduxjs/toolkit";
import recipesReducer from "./slices/recipesSlice";
import sessionReducer from "./slices/sessionSlice";

const store = configureStore({
  reducer: {
    recipes: recipesReducer,
    session: sessionReducer,
  },
});

export default store;
