
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserPlan } from "../types";

export const generateRecipes = async (ingredients: string[], plan: UserPlan): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const count = plan === UserPlan.PREMIUM ? 10 : 5;
  const ingredientsList = ingredients.join(', ');

  const systemInstruction = `Ты — профессиональный кулинарный ИИ-помощник.
Твоя задача — на основе ингредиентов, которые вводит пользователь, сгенерировать список блюд.

Правила:
1. Используй ТОЛЬКО те ингредиенты, которые указал пользователь.
2. Можно добавлять базовые продукты: соль, перец, масло (растительное/сливочное), вода.
3. НЕ добавляй новые основные ингредиенты, которых нет в списке.
4. Предложи ровно ${count} блюд.
5. Для каждого блюда укажи: название, краткое описание, список ингредиентов, пошаговый рецепт (5-8 шагов), время приготовления и сложность.
6. В ответе используй русский язык.
7. Сложность может быть только: 'Легко', 'Средне', 'Сложно'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Ингредиенты: ${ingredientsList}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                time: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["name", "description", "ingredients", "steps", "time", "difficulty"]
            }
          }
        },
        required: ["recipes"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return data.recipes;
};

export const generateDishImage = async (name: string, description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Более детальный промпт для фотореалистичности
  const prompt = `Extreme photorealistic, professional food photography of a dish called "${name}". 
  Dish details: ${description}. 
  Style: Editorial food photography, macro shot, soft natural daylight, shallow depth of field, 
  blurred restaurant background, appetizing textures, steam rising, rich colors, high-end plating. 
  No text, no watermarks, clear focus on the food.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};
