// backend/utils/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// backend/utils/gemini.js
// import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDqW8vL0eT8mK9nB7vF5jKpR3sX9qZ2mN7");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // HII NDIO BEST KWA MWALIMU ASSIST
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
});

export const generateCBCContent = async ({ type, grade, subject, topic = '' }) => {
  let prompt = '';

  if (type === 'workplan') {
    prompt = `Tengeneza lesson plan ya ${subject} Darasa ${grade} kwa CBC Kenya. Weka strand, sub-strand, learning outcomes, activities zinazoboresha competencies 7, na rubric ya viwango 4. Toa kwa Kiswahili na Kiingereza.`;
  } else if (type === 'questions') {
    prompt = `Tengeneza maswali 6 ya ${subject} Darasa ${grade} yenye maana na yanayotumia maisha halisi. Yazingatie CBC strands na competencies. Weka majibu. Toa kwa lugha zote mbili.`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text.replace(/```/g, '').trim(),
      generatedAt: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })
    };
  } catch (error) {
    console.error('Gemini Error:', error.message);
    return { success: false, error: 'Gemini haikuweza kujibu. Jaribu tena.' };
  }
};