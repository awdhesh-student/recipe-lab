import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "session",
  initialState: { activeRecipeId: null, byRecipeId: {} },
  reducers: {
    startSession(state, action) {
      const { recipeId, totalSec, firstStepSec } = action.payload;
      if (state.activeRecipeId && state.activeRecipeId !== recipeId) return; 

      state.activeRecipeId = recipeId;
      state.byRecipeId[recipeId] = {
        currentStepIndex: 0,
        isRunning: true,
        stepRemainingSec: firstStepSec,
        overallRemainingSec: totalSec,
        lastTickTs: Date.now(),
      };
    },
    tickSecond(state, action) {
      const now = action.payload.now;
      const id = state.activeRecipeId;
      if (!id) return;
      const s = state.byRecipeId[id];
      if (!s || !s.isRunning) return;
      const delta = Math.max(
        0,
        Math.floor((now - (s.lastTickTs || now)) / 1000)
      );
      if (delta <= 0) {
        s.lastTickTs = now;
        return;
      }
      s.stepRemainingSec = Math.max(0, s.stepRemainingSec - delta);
      s.overallRemainingSec = Math.max(0, s.overallRemainingSec - delta);
      s.lastTickTs = now;
    },
    pauseSession(state, action) {
      const id = state.activeRecipeId;
      if (!id) return;
      const s = state.byRecipeId[id];
      if (s) {
        s.isRunning = false;
        s.lastTickTs = Date.now();
      }
    },
    resumeSession(state, action) {
      const id = state.activeRecipeId;
      if (!id) return;
      const s = state.byRecipeId[id];
      if (s) {
        s.isRunning = true;
        s.lastTickTs = Date.now();
      }
    },
    endCurrentStep(state, action) {
      const id = state.activeRecipeId;
      const { nextStepRemainingSec, isFinal } = action.payload;
      if (!id) return;
      if (!state.byRecipeId[id]) return;


      if (isFinal) {
        delete state.byRecipeId[id];
        state.activeRecipeId = null;
      } else {
        state.byRecipeId[id].currentStepIndex += 1;
        state.byRecipeId[id].stepRemainingSec = nextStepRemainingSec;
        state.byRecipeId[id].lastTickTs = Date.now();
        state.byRecipeId[id].isRunning = true;
      }
    },
    endSession(state, action) {
      const id = action.payload;
      if (state.byRecipeId[id]) delete state.byRecipeId[id];
      if (state.activeRecipeId === id) state.activeRecipeId = null;
    },
  },
});

export const {
  startSession,
  tickSecond,
  pauseSession,
  resumeSession,
  endCurrentStep,
  endSession,
} = slice.actions;
export default slice.reducer;
