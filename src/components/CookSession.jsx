import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { startSession, tickSecond, pauseSession, resumeSession, endCurrentStep, endSession } from '../slices/sessionSlice';
import { totalSecondsFromSteps, formatMMSS } from '../utils/time';
import { Box, Button, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

export default function CookSession() {
   const { id } = useParams();
   const nav = useNavigate();
   const location = useLocation();
   const dispatch = useDispatch();

   // If route is /cook without :id, show a friendly message
   const recipes = useSelector((s) => s.recipes.list);
   const recipe = id ? recipes.find((r) => r.id === id) : null;

   // session info for this recipe
   const session = useSelector((s) => (id ? s.session.byRecipeId[id] : null));
   const activeId = useSelector((s) => s.session.activeRecipeId);

   // total seconds for recipe
   const totalSec = useMemo(() => (recipe ? totalSecondsFromSteps(recipe.steps || []) : 0), [recipe]);

   // tick-loop: dispatch tickSecond only while running
   useEffect(() => {
      let timer = null;
      if (session && session.isRunning) {
         timer = setInterval(() => {
            dispatch(tickSecond({ now: Date.now() }));
         }, 1000);
      }
      return () => {
         if (timer) clearInterval(timer);
      };
   }, [session?.isRunning, dispatch, id]);

   // auto-advance when stepRemainingSec hits zero
   useEffect(() => {
      if (!session || !recipe) return;
      const curIdx = session.currentStepIndex;
      if (session.stepRemainingSec === 0) {
         const steps = recipe.steps || [];
         if (curIdx >= steps.length - 1) {
            // final ended naturally
            dispatch(endSession(id));
            // small toast substitute
            setTimeout(() => alert('Recipe complete 🎉'), 100);
         } else {
            const nextIdx = curIdx + 1;
            const nextSec = (steps[nextIdx].durationMinutes || 0) * 60;
            dispatch(endCurrentStep({ nextStepRemainingSec: nextSec, isFinal: false }));
         }
      }
   }, [session?.stepRemainingSec, session?.currentStepIndex, recipe, dispatch, id]);

   const handleStart = useCallback(() => {
      if (!recipe) return;
      // guard: only one active session allowed
      if (activeId && activeId !== id) {
         alert('Another session is already active. Stop it before starting a new one.');
         return;
      }
      const steps = recipe.steps || [];
      if (!steps.length) {
         alert('No steps in recipe');
         return;
      }
      const firstSec = (steps[0].durationMinutes || 0) * 60;
      dispatch(startSession({ recipeId: id, totalSec, firstStepSec: firstSec }));
   }, [dispatch, id, recipe, totalSec, activeId]);

   const handlePauseResume = () => {
      if (!session) return;
      if (session.isRunning) dispatch(pauseSession());
      else dispatch(resumeSession());
   };

   const handleStop = () => {
      if (!session || !recipe) return;
      const steps = recipe.steps || [];
      const cur = session.currentStepIndex;
      if (cur >= steps.length - 1) {
         // final: end session
         dispatch(endCurrentStep({ nextStepRemainingSec: 0, isFinal: true }));
         setTimeout(() => alert('Step ended'), 50);
      } else {
         const nextIdx = cur + 1;
         const nextSec = (steps[nextIdx].durationMinutes || 0) * 60;
         dispatch(endCurrentStep({ nextStepRemainingSec: nextSec, isFinal: false }));
         setTimeout(() => alert('Step ended'), 50);
      }
   };

   if (!id) {
      // /cook route (no id)
      return (
         <Box className="page cooking-page">
            <div className="empty-state">
               <h3>No active recipe selected</h3>
               <p>Open a recipe on the Recipes page and press Start to begin a cooking session.</p>
            </div>
         </Box>
      );
   }

   if (!recipe) {
      return (
         <Box className="page cooking-page">
            <h3>Recipe not found</h3>
         </Box>
      );
   }

   const steps = recipe.steps || [];
   const curIdx = session ? session.currentStepIndex : null;
   const curRem = session ? session.stepRemainingSec : null;
   const overallRem = session ? session.overallRemainingSec : totalSec;
   const overallElapsed = totalSec - overallRem;
   const overallPct = totalSec ? Math.round((overallElapsed / totalSec) * 100) : 0;

   return (
      <Box className="page cooking-page">
         <div className="header">
            <div>
               <h2 className="section-title">{recipe.title}</h2>
               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Chip label={recipe.difficulty} />
                  <Chip label={`${totalSec / 60} min`} />
               </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               {!session && <Button className="add-btn" startIcon={<PlayArrowIcon />} variant="contained" onClick={handleStart}>Start Session</Button>}
               {session && (
                  <>
                     <Button className="add-btn" variant="outlined" startIcon={session.isRunning ? <PauseIcon /> : <PlayArrowIcon />} onClick={handlePauseResume}>
                        {session.isRunning ? 'Pause' : 'Resume'}
                     </Button>
                     <Button className="add-btn" variant="contained" startIcon={<StopIcon />} onClick={handleStop}>STOP</Button>
                  </>
               )}
            </div>
         </div>

         <div className="active-step">
            {session ? (
               <>
                  <div className="step-title">Step {curIdx + 1} of {steps.length}</div>
                  <div className="step-desc">{steps[curIdx].description}</div>

                  <div className="step-timer">
                     <div style={{ fontSize: 28, fontWeight: 700 }}>{formatMMSS(curRem)}</div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                     {steps[curIdx].type === 'cooking' ? (
                        <>
                           <Chip label={`Temp: ${steps[curIdx].cookingSettings?.temperature || '—'}°C`} />
                           <Chip label={`Speed: ${steps[curIdx].cookingSettings?.speed || '—'}`} />
                        </>
                     ) : (
                        (steps[curIdx].ingredientIds || []).map((iid) => {
                           const ing = (recipe.ingredients || []).find((x) => x.id === iid);
                           return <Chip key={iid} label={ing ? ing.name : '—'} />;
                        })
                     )}
                  </div>
               </>
            ) : (
               <div>
                  <h3>Ready to Cook</h3>
                  <p>Press Start Session to begin a linear, guided cook-through.</p>
               </div>
            )}
         </div>

         <div className="timeline">
            <h4>Timeline</h4>
            <div>
               {steps.map((s, idx) => {
                  const cls = session ? (idx < session.currentStepIndex ? 'timeline-item completed' : idx === session.currentStepIndex ? 'timeline-item current' : 'timeline-item upcoming') : 'timeline-item upcoming';
                  return (
                     <div key={s.id} className={cls}>
                        <div>{idx + 1}. {s.description}</div>
                        <div>{s.durationMinutes}m</div>
                     </div>
                  );
               })}
            </div>
         </div>

         <div className="overall-progress">
            <div className="progress-bar" style={{ width: `${overallPct}%` }} />
            <div className="progress-info">Overall remaining: {formatMMSS(overallRem)} • {overallPct}%</div>
         </div>
      </Box>
   );
}
