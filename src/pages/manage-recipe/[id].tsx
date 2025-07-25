import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSchema } from "@/utils/validator";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  fetchRecipeById,
  onClearRecipe,
} from "@/store/recipesSlice";
import { ArrowBack, Delete } from "@mui/icons-material";

const fields = [
  { name: "name", label: "YOUR NAME", multiline: false, rows: 1 },
  { name: "email", label: "EMAIL ADDRESS", multiline: false, rows: 1 },
  { name: "title", label: "TITLE", multiline: false, rows: 1 },
  { name: "description", label: "DESCRIPTION", multiline: true, rows: 3 },
  { name: "ingredients", label: "INGREDIENTS", multiline: true, rows: 3 },
  { name: "instructions", label: "INSTRUCTIONS", multiline: true, rows: 4 },
];

type RecipeFormData = z.infer<typeof recipeSchema>;

const RecipeFormPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { recipe } = useAppSelector((s) => s.recipes);
  const { id } = router.query;
  const isEditMode = id !== "add" && Boolean(id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imageFile = watch("image");

  useEffect(() => {
    if (isEditMode && typeof id === "string") {
      dispatch(fetchRecipeById(id));
    }
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (recipe.id) {
      reset(recipe);
      if (recipe.image && recipe.image !== "/") {
        setImagePreview(recipe.image);
      } else {
        setImagePreview("");
      }
    }
  }, [recipe]);

  useEffect(() => {
    const file = imageFile?.[0];

    if (file instanceof File) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [imageFile]);

  useEffect(() => {
    return () => {
      dispatch(onClearRecipe());
    };
  }, [onClearRecipe, dispatch]);

  const onSubmit = async (data: RecipeFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "image") formData.append(key, value as string);
    });

    if (data.image && data.image.length > 0 && data.image[0] instanceof File) {
      formData.append("image", data.image[0]);
    }

    try {
      if (isEditMode && typeof id === "string") {
        formData.append("id", id);

        await dispatch(updateRecipe({ data: formData })).unwrap();
        enqueueSnackbar("Recipe updated!", { variant: "success" });
      } else {
        await dispatch(createRecipe(formData)).unwrap();
        enqueueSnackbar("Recipe created!", { variant: "success" });
      }

      router.push("/");
    } catch (err: any) {
      const errMessage = typeof err === "string" ? err : "Action failed";
      console.log(errMessage);
      enqueueSnackbar(errMessage, {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || typeof id !== "string") return;

    try {
      await dispatch(deleteRecipe(id)).unwrap();
      enqueueSnackbar("Recipe deleted", { variant: "success" });
      router.push("/");
    } catch (err: any) {
      enqueueSnackbar("Delete failed", { variant: "error" });
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();
  const handleBack = () => router.back();

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} bgcolor="#f5f5f5">
      <Box display="flex" justifyContent="space-between" px={2} py={1}>
        <Button onClick={handleBack}>
          <ArrowBack />
          Back
        </Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 12, lg: 4 }} p={3}>
            <Box
              onClick={handleImageClick}
              sx={{
                width: "90%",
                height: "30vh",
                borderRadius: 2,
                backgroundColor: "#d0d3d8",
                backgroundImage: imagePreview
                  ? `url(${imagePreview})`
                  : `url('/placeholder-image.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#666",
                fontWeight: "bold",
                userSelect: "none",
                justifySelf: "center",
              }}
            >
              {!imagePreview && "Click to upload"}
            </Box>

            <input
              type="file"
              accept="image/*"
              hidden
              {...register("image")}
              ref={(e) => {
                register("image").ref(e);
                fileInputRef.current = e;
              }}
            />
            {errors.image && (
              <Typography color="error" fontSize="0.875rem" mt={0.5}>
                {errors.image.message as string}
              </Typography>
            )}
          </Grid>

          <Grid
            size={{ xs: 12, md: 12, lg: 8 }}
            container
            spacing={2}
            p={4}
            direction="column"
          >
            {fields.map(({ name, label, multiline, rows }) => (
              <Grid size={{ xs: 12 }} key={name}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: "bold", color: "#444" }}
                >
                  {label}
                </Typography>
                <TextField
                  fullWidth
                  multiline={multiline}
                  rows={rows}
                  {...register(name as keyof RecipeFormData)}
                  error={!!errors[name as keyof RecipeFormData]}
                  helperText={
                    errors[name as keyof RecipeFormData]?.message as string
                  }
                  placeholder={multiline ? "Type here..." : undefined}
                  size="small"
                  sx={{ backgroundColor: "#fff" }}
                  disabled={name === "title" && isEditMode}
                />
              </Grid>
            ))}

            <Grid
              size={{ xs: 12 }}
              display="flex"
              justifyContent="flex-end"
              mt={2}
              gap={2}
            >
              {isEditMode && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Save"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default RecipeFormPage;
