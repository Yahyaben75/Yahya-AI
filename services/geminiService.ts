
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { EditResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<EditResult> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageUrl: string | null = null;
        let text: string | null = null;

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text = part.text;
                } else if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
        }
        
        if (!imageUrl) {
            throw new Error("API did not return an image.");
        }

        return { imageUrl, text };
    } catch (error) {
        console.error("Error editing image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to communicate with the Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};

export const generateImage = async (prompt: string): Promise<EditResult> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("API did not return any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

        return { imageUrl, text: null };
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to communicate with the Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
