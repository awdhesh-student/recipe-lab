import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { addRecipe, updateRecipe } from '../slices/recipesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import {
   TextField,
   MenuItem,
   IconButton,
   Button,
   Typography,
   Paper,
   Divider,
   Tooltip,
   Box
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Delete } from '@mui/icons-material';

export default function CreateRecipe() {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const { id } = useParams();
   const existing = useSelector((s) => s.recipes.list.find((r) => r.id === id));

   const [title, setTitle] = useState(existing?.title || '');
   const [difficulty, setDifficulty] = useState(existing?.difficulty || 'Easy');
   const [ingredients, setIngredients] = useState(existing?.ingredients || []);
   const [steps, setSteps] = useState(existing?.steps || []);

   const difficulties = ['Easy', 'Medium', 'Hard'];

   const handleAddIngredient = () => {
      setIngredients([...ingredients, { id: uuid(), name: '', quantity: 1, unit: 'pcs' }]);
   };
   const handleRemoveIngredient = (id) => {
      setIngredients(ingredients.filter((i) => i.id !== id));
   };
   const handleAddStep = () => {
      setSteps([
         ...steps,
         {
            id: uuid(),
            description: '',
            type: 'instruction',
            durationMinutes: 1,
            ingredientIds: [],
         },
      ]);
   };
   const handleRemoveStep = (id) => setSteps(steps.filter((s) => s.id !== id));

   const handleMoveStep = (idx, dir) => {
      const newSteps = [...steps];
      const target = idx + dir;
      if (target < 0 || target >= newSteps.length) return;
      [newSteps[idx], newSteps[target]] = [newSteps[target], newSteps[idx]];
      setSteps(newSteps);
   };

   const handleSave = () => {
      if (!title.trim() || ingredients.length < 1 || steps.length < 1) {
         alert('Please fill all required fields and add at least one ingredient & step.');
         return;
      }

      const recipe = {
         id: existing?.id || uuid(),
         title,
         difficulty,
         ingredients,
         steps,
         createdAt: existing?.createdAt || new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      };
      if (existing) dispatch(updateRecipe(recipe));
      else dispatch(addRecipe(recipe));
      navigate('/recipes');
   };

   return (
      <div className="create-page">
         <div className="page-header">
            <Typography variant="h5" className="page-title">
               {existing ? 'Edit Recipe' : 'Create Recipe'}
            </Typography>
            <Button
               onClick={handleSave}
               className="save-btn"
               variant="contained"
               size="large"
            >
               SAVE RECIPE
            </Button>
         </div>

         <div className="builder-grid">
            {/* LEFT: Recipe Info + Ingredients */}
            <Paper className="builder-card" elevation={3}>
               <Typography variant="h6" className="section-title">
                  Recipe Info
               </Typography>
               <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  margin="normal"
               />
               <TextField
                  select
                  fullWidth
                  label="Difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  margin="normal"
               >
                  {difficulties.map((d) => (
                     <MenuItem key={d} value={d}>
                        {d}
                     </MenuItem>
                  ))}
               </TextField>

               <Divider sx={{ my: 2 }} />
               <Typography variant="h6" className="section-title">
                  Ingredients
               </Typography>

               {ingredients.map((ing) => (
                  <div className="ingredient-row" key={ing.id}>
                     <TextField
                        label="Name"
                        value={ing.name}
                        onChange={(e) =>
                           setIngredients(
                              ingredients.map((i) =>
                                 i.id === ing.id ? { ...i, name: e.target.value } : i
                              )
                           )
                        }
                     />
                     <TextField
                        type="number"
                        label="Qty"
                        value={ing.quantity}
                        onChange={(e) =>
                           setIngredients(
                              ingredients.map((i) =>
                                 i.id === ing.id
                                    ? { ...i, quantity: Number(e.target.value) }
                                    : i
                              )
                           )
                        }
                     />
                     <TextField
                        label="Unit"
                        value={ing.unit}
                        onChange={(e) =>
                           setIngredients(
                              ingredients.map((i) =>
                                 i.id === ing.id ? { ...i, unit: e.target.value } : i
                              )
                           )
                        }
                     />
                     <Tooltip title="Delete Ingredient">
                        <IconButton onClick={() => handleRemoveIngredient(ing.id)}>
                           <Delete />
                        </IconButton>
                     </Tooltip>
                  </div>
               ))}

               <Button onClick={handleAddIngredient} className="add-btn">
                  ADD INGREDIENT
               </Button>
            </Paper>

            {/* RIGHT: Steps */}
            <Paper className="builder-card" elevation={3}>
               <Typography variant="h6" className="section-title">
                  Steps ({steps.length}) • Total:{' '}
                  {steps.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)} min
               </Typography>

               {steps.map((step, idx) => (
                  <div key={step.id} className="step-block">
                     <div className="step-header">#{idx + 1}</div>
                     <div className="step-fields">
                        <TextField
                           fullWidth
                           label="Description"
                           value={step.description}
                           onChange={(e) =>
                              setSteps(
                                 steps.map((s) =>
                                    s.id === step.id
                                       ? { ...s, description: e.target.value }
                                       : s
                                 )
                              )
                           }
                        />
                        <TextField
                           select
                           label="Type"
                           value={step.type}
                           onChange={(e) =>
                              setSteps(
                                 steps.map((s) =>
                                    s.id === step.id
                                       ? { ...s, type: e.target.value }
                                       : s
                                 )
                              )
                           }
                        >
                           <MenuItem value="instruction">Instruction</MenuItem>
                           <MenuItem value="cooking">Cooking</MenuItem>
                        </TextField>
                        <TextField
                           type="number"
                           label="Duration (min)"
                           value={step.durationMinutes}
                           onChange={(e) =>
                              setSteps(
                                 steps.map((s) =>
                                    s.id === step.id
                                       ? { ...s, durationMinutes: Number(e.target.value) }
                                       : s
                                 )
                              )
                           }
                        />
                        <div>

                           <Tooltip title="Move Up">
                              <IconButton onClick={() => handleMoveStep(idx, -1)}>
                                 <ArrowUpward />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title="Move Down">
                              <IconButton onClick={() => handleMoveStep(idx, 1)}>
                                 <ArrowDownward />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title="Delete Step">
                              <IconButton onClick={() => handleRemoveStep(step.id)}>
                                 <Delete />
                              </IconButton>
                           </Tooltip>
                        </div>
                     </div>
                  </div>
               ))}

               <Button onClick={handleAddStep} className="add-btn">
                  ADD STEP
               </Button>
            </Paper>
         </div>
      </div>
   );
}
