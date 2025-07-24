import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
   const filePath = path.join(process.cwd(), 'src', 'data', 'recipes.json');

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const recipes = JSON.parse(fileContent);

    res.status(200).json(recipes)
  } catch (error) {
    console.error('Failed to read recipes.json:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

