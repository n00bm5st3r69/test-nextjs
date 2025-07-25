import { IncomingForm, File } from "formidable";
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { getFieldValue } from "../../utils/formatter";

export const config = {
  api: {
    bodyParser: false,
  },
};

const recipesFile = path.join(process.cwd(), "src", "data", "recipes.json");
const imageDir = path.join(process.cwd(), "public", "images");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ uploadDir: imageDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parsing error" });

    const name = getFieldValue(fields.name);
    const email = getFieldValue(fields.email);
    const title = getFieldValue(fields.title);
    const description = getFieldValue(fields.description);
    const ingredients = getFieldValue(fields.ingredients);
    const instructions = getFieldValue(fields.instructions);
    const rawImage = files.image;
    const image: File | undefined = Array.isArray(rawImage)
      ? rawImage[0]
      : rawImage;

    if (!name || !email || !title || !instructions || !image) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const ext = image.originalFilename?.split(".").pop();
    const imageName = `${String(title)}.${ext}`.replace(/\s+/g, "_");
    const imagePath = path.join(imageDir, imageName);
    fs.renameSync((image as File).filepath, imagePath);

    const data = fs.readFileSync(recipesFile, "utf-8");
    const recipes = JSON.parse(data);

    const isDuplicateTitle = recipes.some(
      (recipe: any) =>
        recipe.title.toLowerCase() === String(title).toLowerCase()
    );

    if (isDuplicateTitle) {
      return res.status(400).json({ message: "Title already exists" });
    }

    const newRecipe = {
      id: recipes.length + 1,
      name,
      email,
      title,
      description,
      ingredients,
      instructions,
      dateAdded: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      isFavorite: false,
      image: `/images/${imageName}`,
    };

    recipes.push(newRecipe);
    fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2), "utf-8");

    return res
      .status(201)
      .json({ message: "Recipe added successfully", recipe: newRecipe });
  });
}
