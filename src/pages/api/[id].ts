import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const dataFilePath = path.join(process.cwd(), "src", "data", "recipes.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing recipe ID" });
  }

  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf-8");
    const recipes = JSON.parse(jsonData);

    const recipe = recipes.find((r: any) => r.id.toString() === id.toString());

    if (req.method === "GET") {
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      return res.status(200).json(recipe);
    }

    if (req.method === "DELETE") {
      const index = recipes.findIndex(
        (r: any) => r.id.toString() === id.toString()
      );

      if (index === -1) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const deletedRecipe = recipes[index];
      recipes.splice(index, 1);

      fs.writeFileSync(dataFilePath, JSON.stringify(recipes, null, 2));

      const imagePath = path.join(
        process.cwd(),
        "public",
        deletedRecipe.image || ""
      );
      if (
        deletedRecipe.image &&
        !deletedRecipe.image.includes("placeholder-image.png") &&
        fs.existsSync(imagePath)
      ) {
        fs.unlinkSync(imagePath);
      }

      return res.status(200).json({ message: "Recipe deleted successfully" });
    }

    return res
      .setHeader("Allow", ["GET", "DELETE"])
      .status(405)
      .end("Method Not Allowed");
  } catch (error) {
    console.error(`${req.method} error:`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
