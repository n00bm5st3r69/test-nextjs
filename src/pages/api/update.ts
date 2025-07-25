import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
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
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm({ uploadDir: imageDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: "Form parsing error" });

    const id = getFieldValue(fields.id);
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

    let recipes = JSON.parse(fs.readFileSync(recipesFile, "utf8"));
    const recipeIndex = recipes.findIndex((r: any) => r.id == id);

    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const imagePath = recipes[recipeIndex].image;

    let newImagePath = imagePath;

    if (image) {
      const ext = image.originalFilename?.split(".").pop();
      const baseName = path.basename(imagePath, path.extname(imagePath));
      const version = Date.now();
      const versionedFileName = `${baseName}_v${version}.${ext}`;
      const newImageRelPath = `/images/${versionedFileName}`;
      const newImageAbsPath = path.join(
        process.cwd(),
        "public",
        "images",
        versionedFileName
      );

      fs.renameSync(image.filepath, newImageAbsPath);

      const oldImageAbsPath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(oldImageAbsPath)) {
        fs.unlinkSync(oldImageAbsPath);
      }

      newImagePath = newImageRelPath;
    }

    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      ...(image ? { image: newImagePath } : {}),
      name,
      email,
      description,
      ingredients,
      instructions,
    };

    fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2));

    return res
      .status(200)
      .json({ message: "Recipe updated successfully", recipes });
  });
}
