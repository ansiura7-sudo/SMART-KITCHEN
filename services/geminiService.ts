
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserPlan } from "../types";

export const generateRecipes = async (ingredients: string[], plan: UserPlan): Promise<Recipe[]> => {
  // Creating a new instance right before the call as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const count = plan === UserPlan.PREMIUM ? 10 : 5;
  const ingredientsList = ingredients.join(', ');

  const systemInstruction = `Ты — профессиональный кулинарный ИИ-помощник.
Твоя задача — на основе ингредиентов, которые вводит пользователь, сгенерировать список блюд.

Правила:
1. Используй ТОЛЬКО те ингредиенты, которые указал пользователь.
2. Можно добавлять базовые продукты: соль, перец, растительное/сливочное масло, вода.
3. НЕ добавляй новые основные ингредиенты (мясо, овощи, крупы), которых нет в списке.
4. Предложи ровно ${count} блюд.
5. Для каждого блюда укажи: название, краткое описание, список ингредиентов, пошаговый рецепт, время приготовления и сложность.
6. В ответе используй русский язык.
7. Сложность может быть только: 'Легко', 'Средне', 'Сложно'.`;

  try {
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
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
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

    const text = response.text;
    if (!text) throw new Error("Модель вернула пустой ответ");
    
    const data = JSON.parse(text);
    return data.recipes;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateDishImage = async (name: string, description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Extreme photorealistic, high-end editorial food photography of "${name}". ${description}. 
  Professional plating, top-down or 45 degree angle, soft natural lighting, high resolution, appetizing colors, no text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error("No image data found");
  } catch (error) {
    console.error("Image API Error:", error);
    throw error;
  }
};
