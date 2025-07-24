// store/slices/recipeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Recipe {
  id: number;
  name: string;
  email: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  dateAdded: string;
  isFavorite: boolean;
  image: string;
}

export interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
  createStatus: "idle",
};

export const fetchRecipes = createAsyncThunk<Recipe[]>("recipes/fetch", async () => {
  const response = await axios.get<Recipe[]>("/api/recipes");
  return response.data;
});

export const createRecipe = createAsyncThunk<
  Recipe,
  FormData,
  { rejectValue: string }
>("recipes/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.recipe;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to create recipe");
  }
});

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const recipe = state.recipes.find((r) => r.id === action.payload);
      if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = "Failed to load recipes";
      })

      // Create Recipe
      .addCase(createRecipe.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action: PayloadAction<Recipe>) => {
        state.createStatus = "succeeded";
        state.recipes.push(action.payload);
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Failed to create recipe";
      });
  },
});

export const { toggleFavorite } = recipesSlice.actions;
export default recipesSlice.reducer;
