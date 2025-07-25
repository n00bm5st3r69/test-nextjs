import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Recipe } from "@/types/recipe";

export interface RecipeState {
  recipes: Recipe[];
  recipe: Recipe;
  searchString: string;
  loading: boolean;
  error: string | null;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: RecipeState = {
  recipes: [],
  recipe: {
    id: 0,
    name: "",
    email: "",
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    dateAdded: "",
    isFavorite: false,
    image: "",
  },
  searchString: "",
  loading: false,
  error: null,
  createStatus: "idle",
};

export const fetchRecipes = createAsyncThunk<Recipe[]>(
  "recipes/fetch",
  async () => {
    const response = await axios.get<Recipe[]>("/api/recipes");
    return response.data;
  }
);

export const createRecipe = createAsyncThunk<
  Recipe,
  FormData,
  { rejectValue: string }
>("recipes/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.recipe;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to create recipe"
    );
  }
});

export const fetchRecipeById = createAsyncThunk<
  Recipe,
  string,
  { rejectValue: string }
>("recipes/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<Recipe>(`/api/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue("Failed to fetch recipe");
  }
});

export const updateRecipe = createAsyncThunk<
  Recipe,
  { data: FormData },
  { rejectValue: string }
>("recipes/update", async ({ data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/api/update`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.recipe;
  } catch (error: any) {
    return rejectWithValue("Failed to update recipe");
  }
});

export const deleteRecipe = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("recipes/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue("Failed to delete recipe");
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
    onSearch: (state, action: PayloadAction<string>) => {
      state.searchString = action.payload;
    },
    onClearRecipe: (state) => {
      state.recipe = initialState.recipe;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecipes.fulfilled,
        (state, action: PayloadAction<Recipe[]>) => {
          state.loading = false;
          state.recipes = action.payload;
        }
      )
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = "Failed to load recipes";
      })

      // Create Recipe
      .addCase(createRecipe.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(
        createRecipe.fulfilled,
        (state, action: PayloadAction<Recipe>) => {
          state.createStatus = "succeeded";
          state.recipes.push(action.payload);
        }
      )
      .addCase(createRecipe.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Failed to create recipe";
      })
      .addCase(
        fetchRecipeById.fulfilled,
        (state, action: PayloadAction<Recipe>) => {
          state.recipe = action.payload;
        }
      );
  },
});

export const { toggleFavorite, onClearRecipe, onSearch } = recipesSlice.actions;
export default recipesSlice.reducer;
