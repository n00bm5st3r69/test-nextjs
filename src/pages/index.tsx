import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  Typography,
  Grid,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Tooltip,
  List,
  ListItem,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import { useRouter } from "next/router";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRecipes, onSearch, toggleFavorite } from "@/store/recipesSlice";
import { Recipe } from "@/types/recipe";
import CustomCard from "@/components/Card";

const RecipeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const route = useRouter();
  const { recipes, searchString } = useAppSelector((state) => state.recipes);

  const [sortBy, setSortBy] = useState<"title" | "date" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [favoriteFilter, setFavoriteFilter] = useState<string[]>(["yes", "no"]);

  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as "asc" | "desc");
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as "title" | "date");
  };

  const handleOnNavigate = () => {
    route.push("/manage-recipe/add");
  };

  const handleOnManageRecipe = (id: number) => {
    route.push(`/manage-recipe/${id}`);
  };

  const handleAddFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    dispatch(toggleFavorite(id));
  };

  const handleFavoriteCheckboxChange = (value: string) => {
    setFavoriteFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleClearFilters = () => {
    setSortBy("");
    setSortOrder("");
    setFavoriteFilter(["yes", "no"]);
    dispatch(onSearch(""));
  };

  const filteredRecipes = useMemo<Recipe[]>(() => {
    let result = [...recipes];

    if (searchString) {
      result = result.filter((r) =>
        r.title.toLowerCase().includes(searchString.toLowerCase())
      );
    }

    if (favoriteFilter.length < 2) {
      if (favoriteFilter.includes("yes")) {
        result = result.filter((r) => r.isFavorite);
      } else if (favoriteFilter.includes("no")) {
        result = result.filter((r) => !r.isFavorite);
      }
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
  }, [recipes, searchString, favoriteFilter, sortOrder, sortBy]);

  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      <Grid container flexGrow={1}>
        <Grid size={{ xs: 12, md: 12, lg: 4 }} p={3} bgcolor="#f5f5f5">
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
            Favorites
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={favoriteFilter.includes("yes")}
                onChange={() => handleFavoriteCheckboxChange("yes")}
              />
            }
            label="Yes"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={favoriteFilter.includes("no")}
                onChange={() => handleFavoriteCheckboxChange("no")}
              />
            }
            label="No"
          />
          <Box flex={1} pt={3}>
            <Button variant="contained" onClick={handleClearFilters}>
              {" "}
              Clear Filters
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 8 }} p={4}>
          <Paper
            sx={{
              position: "relative",
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              "::-webkit-scrollbar": { display: "none" },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
              p: 3,
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
                  onClick={handleOnNavigate}
                >
                  <AddCircle fontSize="large" />
                </IconButton>
              </Tooltip>
            </Box>
            {filteredRecipes.length ? (
              <List disablePadding>
                {filteredRecipes.map((recipe) => (
                  <ListItem
                    key={recipe.id}
                    disableGutters
                    onClick={() => handleOnManageRecipe(recipe.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <CustomCard
                      title={recipe.title}
                      description={recipe.description}
                      author={recipe.name}
                      date={recipe.dateAdded}
                      image={recipe.image}
                      isFavorite={recipe.isFavorite}
                      onToggleFavorite={(e) => handleAddFavorite(e, recipe.id)}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                flexGrow={1}
                p={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="h4">No Record Found!</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecipeList;
