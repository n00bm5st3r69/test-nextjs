import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";

type RecipeCardProps = {
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const CustomCard: React.FC<RecipeCardProps> = ({
  title,
  description,
  author,
  date,
  image,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <Card sx={{ display: "flex", p: 1, flex: 1 }}>
      <CardMedia
        component="img"
        sx={{ width: 180, height: 130, borderRadius: 1, objectFit: "cover" }}
        image={image}
        alt="Recipe"
      />

      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onToggleFavorite}>
            {isFavorite ? <Star color="warning" /> : <StarBorder />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={1}>
          {description}
        </Typography>

        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
          See more
        </Typography>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="body2">Added by: {author}</Typography>
          <Typography variant="body2">Date: {date}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomCard;
