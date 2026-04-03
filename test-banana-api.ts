import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set');
    process.exit(1);
  }

  console.log('Testing Google GenAI Nano Banana (gemini-3-pro-image-preview)...');
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: 'A cute little cat playing with a ball of yarn, highly detailed, 4k',
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          imageSize: "1K" as any
        }
      }
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const imageBuffer = Buffer.from(part.inlineData.data as string, 'base64');
          const ext = part.inlineData.mimeType === 'image/jpeg' ? 'jpg' : 'png';
          const filePath = path.join(__dirname, `test-cat.${ext}`);
          fs.writeFileSync(filePath, imageBuffer);
          console.log(`✅ Success! Image generated and saved to: ${filePath}`);
          return;
        }
      }
    }
    console.log('❌ Failed: No image data returned');
  } catch (err: any) {
    console.error('❌ API Error:', err.message);
  }
}

run();
