import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSchema } from "@/utils/validator";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useAppDispatch } from "@/store/hooks";
import { createRecipe } from "@/store/recipesSlice";
import { ArrowBack } from "@mui/icons-material";

const fields = [
  {
    name: "name",
    label: "YOUR NAME",
    multiline: false,
    rows: 1,
  },
  {
    name: "email",
    label: "EMAIL ADDRESS",
    multiline: false,
    rows: 1,
  },
  { name: "title", label: "TITLE", multiline: false, rows: 1 },
  {
    name: "description",
    label: "DESCRIPTION",
    multiline: true,
    rows: 3,
  },
  {
    name: "ingredients",
    label: "INGREDIENTS",
    multiline: true,
    rows: 3,
  },
  {
    name: "instructions",
    label: "INSTRUCTIONS",
    multiline: true,
    rows: 4,
  },
];

type RecipeFormData = z.infer<typeof recipeSchema>;

const AddRecipePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imageFile = watch("image");

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const onSubmit = async (data: RecipeFormData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "image") {
        formData.append(key, value as string);
      }
    });

    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }

    try {
      await dispatch(createRecipe(formData)).unwrap();
      enqueueSnackbar("Recipe added successfully!", { variant: "success" });
      reset();
      setImagePreview(null);
      router.push("/");
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to add recipe", {
        variant: "error",
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleOnNavigate = () => {
    router.back();
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} bgcolor="#f5f5f5">
      <Button sx={{ alignSelf: "flex-start" }} onClick={handleOnNavigate}>
        <ArrowBack />
        Back
      </Button>
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
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: 1,
                    color: "#444",
                    mb: 0.5,
                    display: "block",
                  }}
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
                    errors[name as keyof RecipeFormData]?.message as
                      | string
                      | undefined
                  }
                  placeholder={multiline ? "Description here" : undefined}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ backgroundColor: "#FFFFFF" }}
                />
              </Grid>
            ))}

            <Grid
              size={{ xs: 12 }}
              display="flex"
              justifyContent="flex-end"
              mt={2}
            >
              <Button variant="contained" type="submit" sx={{ minWidth: 120 }}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AddRecipePage;
