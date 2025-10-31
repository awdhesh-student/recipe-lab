import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, deleteRecipe } from '../slices/recipesSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
   Box,
   IconButton,
   Chip,
   Button,
   TextField,
   Select,
   MenuItem,
   InputLabel,
   FormControl,
   Menu,
   Tooltip,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function RecipesList() {
   const recipes = useSelector((s) => s.recipes.list);
   const dispatch = useDispatch();
   const nav = useNavigate();

   const [filterDiff, setFilterDiff] = useState([]);
   const [sortDir, setSortDir] = useState('asc');
   const [q, setQ] = useState('');

   // Menu state for edit/delete
   const [anchorEl, setAnchorEl] = useState(null);
   const [selected, setSelected] = useState(null);

   const openMenu = (e, recipe) => {
      e.preventDefault();
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
      setSelected(recipe);
   };
   const closeMenu = () => {
      setAnchorEl(null);
      setSelected(null);
   };

   const handleEdit = () => {
      nav(`/create/${selected.id}`);
      closeMenu();
   };

   const handleDelete = () => {
      const confirmed = window.confirm(`Delete recipe "${selected.title}"?`);
      if (confirmed) dispatch(deleteRecipe(selected.id));
      closeMenu();
   };

   const filtered = useMemo(() => {
      const term = q.trim().toLowerCase();
      let out = (recipes || []).slice();
      if (filterDiff.length) out = out.filter((r) => filterDiff.includes(r.difficulty));
      if (term) out = out.filter((r) => r.title.toLowerCase().includes(term));
      out.sort((a, b) => {
         const ta = (a.steps || []).reduce((s, x) => s + Number(x.durationMinutes || 0), 0);
         const tb = (b.steps || []).reduce((s, x) => s + Number(x.durationMinutes || 0), 0);
         return sortDir === 'asc' ? ta - tb : tb - ta;
      });
      return out;
   }, [recipes, filterDiff, sortDir, q]);

   return (
      <Box className="page recipes-page">
         <Box className="recipes-toolbar">
            <div className="left">
               <h2 className="section-title">Your Recipes</h2>
               <div className="toolbar-controls">
                  <TextField
                     placeholder="Search recipes..."
                     value={q}
                     onChange={(e) => setQ(e.target.value)}
                     size="small"
                     sx={{ minWidth: 220 }}
                  />
                  <div className="filter-chips" style={{ display: 'contents' }}>
                     {DIFFICULTIES.map((d) => (
                        <Chip
                           key={d}
                           label={d}
                           clickable
                           className={`filter-chip ${filterDiff.includes(d) ? 'active' : ''}`}
                           onClick={() =>
                              setFilterDiff((prev) =>
                                 prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                              )
                           }
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div className="right" style={{ display: 'flex', gap: '20px' }}>
               <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Sort Time</InputLabel>
                  <Select value={sortDir} label="Sort Time" onChange={(e) => setSortDir(e.target.value)}>
                     <MenuItem value="asc">Time ↑</MenuItem>
                     <MenuItem value="desc">Time ↓</MenuItem>
                  </Select>
               </FormControl>

               <Button variant="contained" className="create-btn" onClick={() => nav('/create')}>
                  + Create Recipe
               </Button>
            </div>
         </Box>

         <Box className="recipes-grid">
            {filtered.length === 0 && (
               <Box className="empty-state">
                  <h3>No recipes yet</h3>
                  <p>Create your first delicious recipe. Just click Create Recipe.</p>
                  <Button variant="outlined" onClick={() => nav('/create')}>
                     Create one
                  </Button>
               </Box>
            )}

            {filtered.map((r) => {
               const total = (r.steps || []).reduce((s, x) => s + Number(x.durationMinutes || 0), 0);
               return (
                  <Box key={r.id} className="recipe-card" component={Link} to={`/cook/${r.id}`}>
                     <div className="card-header">
                        <IconButton
                           className={`favorite-btn ${r.isFavorite ? 'active' : ''}`}
                           onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              dispatch(toggleFavorite(r.id));
                           }}
                           aria-label="favorite"
                        >
                           {r.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>

                        <Tooltip title="More options">
                           <IconButton
                              className="menu-btn"
                              onClick={(e) => openMenu(e, r)}
                              aria-label="options"
                           >
                              <MoreVertIcon />
                           </IconButton>
                        </Tooltip>
                     </div>

                     <div className="title">{r.title}</div>
                     <div className="meta">
                        <div className="left-meta">
                           <Chip label={r.difficulty} size="small" />
                           <Chip label={`${total} min`} size="small" />
                           <Chip label={`${r.ingredients?.length || 0} ing`} size="small" />
                        </div>
                        <div className="right-meta">
                           <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                        </div>
                     </div>
                  </Box>
               );
            })}

            <Menu
               anchorEl={anchorEl}
               open={Boolean(anchorEl)}
               onClose={closeMenu}
               PaperProps={{
                  elevation: 3,
                  sx: { minWidth: 160, borderRadius: 2, padding: '4px' },
               }}
            >
               <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
               </MenuItem>
               <MenuItem onClick={handleDelete} sx={{ color: '#d32f2f' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
               </MenuItem>
            </Menu>
         </Box>
      </Box>
   );
}
