import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const LS_KEY = "recipes:v1";

const safeParse = (v) => {
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const initial = safeParse(localStorage.getItem(LS_KEY));

const slice = createSlice({
  name: "recipes",
  initialState: { list: initial },
  reducers: {
    addRecipe(state, action) {
      const r = action.payload;
      r.id = r.id ?? uuidv4();
      r.createdAt = new Date().toISOString();
      r.updatedAt = new Date().toISOString();
      state.list.push(r);
      localStorage.setItem(LS_KEY, JSON.stringify(state.list));
    },
    updateRecipe(state, action) {
      const r = action.payload;
      const idx = state.list.findIndex((x) => x.id === r.id);
      if (idx !== -1) {
        r.updatedAt = new Date().toISOString();
        state.list[idx] = r;
        localStorage.setItem(LS_KEY, JSON.stringify(state.list));
      }
    },
    deleteRecipe(state, action) {
      state.list = state.list.filter((r) => r.id !== action.payload);
      localStorage.setItem(LS_KEY, JSON.stringify(state.list));
    },
    toggleFavorite(state, action) {
      const id = action.payload;
      const r = state.list.find((x) => x.id === id);
      if (r) {
        r.isFavorite = !r.isFavorite;
        r.updatedAt = new Date().toISOString();
        localStorage.setItem(LS_KEY, JSON.stringify(state.list));
      }
    },
  },
});

export const { addRecipe, updateRecipe, deleteRecipe, toggleFavorite } =
  slice.actions;
export default slice.reducer;
