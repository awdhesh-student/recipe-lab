// MiniPlayer.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { pauseSession, resumeSession, endCurrentStep } from '../slices/sessionSlice';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CircularProgress from '@mui/material/CircularProgress';
import { formatMMSS } from '../utils/time';

export default function MiniPlayer() {
   const activeId = useSelector((s) => s.session.activeRecipeId);
   const session = useSelector((s) => (activeId ? s.session.byRecipeId[activeId] : null));
   const recipe = useSelector((s) => s.recipes.list.find((r) => r.id === activeId));
   const dispatch = useDispatch();
   const nav = useNavigate();

   if (!activeId || !session || !recipe) return null;

   const curIdx = session.currentStepIndex;
   const curRem = session.stepRemainingSec;

   const stepTotal = (recipe.steps?.[curIdx]?.durationMinutes || 0) * 60;
   const stepProgress = stepTotal > 0 ? Math.round(((stepTotal - curRem) / stepTotal) * 100) : 0;

   function handleToggle(e) {
      e.stopPropagation();
      session.isRunning ? dispatch(pauseSession()) : dispatch(resumeSession());
   }

   function handleStop(e) {
      e.stopPropagation();
      // STOP semantics: if last step -> end session; else advance to next
      const steps = recipe.steps || [];
      const cur = session.currentStepIndex;
      if (cur >= steps.length - 1) {
         dispatch(endCurrentStep({ nextStepRemainingSec: 0, isFinal: true }));
      } else {
         const nextSec = (steps[cur + 1].durationMinutes || 0) * 60;
         dispatch(endCurrentStep({ nextStepRemainingSec: nextSec, isFinal: false }));
      }
   }

   return (
      <div
         className="mini-player"
         role="button"
         tabIndex={0}
         onClick={() => nav(`/cook/${activeId}`)}
         onKeyDown={(e) => { if (e.key === 'Enter') nav(`/cook/${activeId}`); }}
         aria-label="Open active cooking session"
      >
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Box sx={{ position: 'relative', width: 44, height: 44 }}>
               <CircularProgress variant="determinate" value={stepProgress} size={44} />
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {formatMMSS(curRem)}
               </div>
            </Box>

            <Box sx={{ minWidth: 180 }}>
               <div style={{ fontWeight: 700, fontSize: 14 }}>{recipe.title}</div>
               <div style={{ fontSize: 12, color: '#6b7280' }}>Step {curIdx + 1} · {session.isRunning ? 'Running' : 'Paused'}</div>
            </Box>
         </Box>

         <Box className="mini-controls" sx={{ display: 'flex', gap: 8 }}>
            <Tooltip title={session.isRunning ? 'Pause' : 'Resume'}>
               <IconButton
                  onClick={handleToggle}
                  aria-label={session.isRunning ? 'Pause session' : 'Resume session'}
                  size="small"
                  sx={{ background: 'transparent' }}
               >
                  {session.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
               </IconButton>
            </Tooltip>

            <Tooltip title="STOP current step">
               <IconButton onClick={handleStop} aria-label="Stop current step" size="small" sx={{ color: 'var(--danger-color)' }}>
                  <StopIcon />
               </IconButton>
            </Tooltip>
         </Box>
      </div>
   );
}
