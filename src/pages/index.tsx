import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  TextField,
  List,
  ListItem,
  SelectChangeEvent,
} from "@mui/material";
import { AddCircle } from "@mui/icons-material";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRecipes, toggleFavorite } from "@/store/recipesSlice";
import { Recipe } from "@/types/recipe";
import CustomCard from "@/components/Card";

const RecipeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { recipes } = useAppSelector((state) => state.recipes);

  const [sortBy, setSortBy] = useState<"title" | "date" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [favoriteFilter, setFavoriteFilter] = useState<"yes" | "no" | "">("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as "asc" | "desc");
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as "title" | "date");
  };

  const handleFavoriteFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFavoriteFilter(event.target.value as "yes" | "no" | "");
  };

  const filteredRecipes = useMemo<Recipe[]>(() => {
    let result = [...recipes];

    if (searchTerm) {
      result = result.filter((r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (favoriteFilter === "yes") {
      result = result.filter((r) => r.isFavorite);
    } else if (favoriteFilter === "no") {
      result = result.filter((r) => !r.isFavorite);
    }

    if (sortOrder) {
      result.sort((a, b) => {
        const field = sortBy || "title";
        const aValue = a[field as keyof Recipe];
        const bValue = b[field as keyof Recipe];

        const aVal = typeof aValue === "string" ? aValue.toLowerCase() : aValue;
        const bVal = typeof bValue === "string" ? bValue.toLowerCase() : bValue;

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [recipes, searchTerm, favoriteFilter, sortOrder, sortBy]);

  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      <Grid container flexGrow={1}>
        <Grid size={{ xs: 12, md: 12, lg: 4 }} p={3} bgcolor="#f5f5f5">
          <Typography variant="h6" gutterBottom>
            Search
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Sort
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={handleSortOrderChange}
              label="Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Field</InputLabel>
            <Select value={sortBy} onChange={handleSortByChange} label="Field">
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="dateAdded">Date</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom>
            Filter by Favorites
          </Typography>
          <RadioGroup
            value={favoriteFilter}
            onChange={handleFavoriteFilterChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="" control={<Radio />} label="All" />
          </RadioGroup>
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 8 }} p={4}>
          <Paper
            sx={{
              position: "relative",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            <Box
              display="flex"
              justifyContent="flex-end"
              position="absolute"
              right={10}
              top={10}
              zIndex={2}
            >
              <Tooltip title="Add New Recipe">
                <IconButton
                  color="primary"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <AddCircle fontSize="large" />
                </IconButton>
              </Tooltip>
            </Box>
            <List disablePadding>
              {filteredRecipes.map((recipe) => (
                <ListItem key={recipe.id} disableGutters>
                  <CustomCard
                    title={recipe.title}
                    description={recipe.description}
                    author={recipe.name}
                    date={recipe.dateAdded}
                    image={recipe.image}
                    isFavorite={recipe.isFavorite}
                    onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecipeList;
