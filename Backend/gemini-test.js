// TEST FILE: gemini-test.js (weka kwenye backend root)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCrQGOfHJW22ljVLkFu11XSDD74Q0ANZu4"); // Test key inafanya kazi

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // HII NDIO INAYOFANYA KAZI SASA (not 2.5!)
});

async function main() {
  try {
    const prompt = "Eleza CBC Kenya kwa maneno 10 tu kwa Kiswahili.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Says:");
    console.log(text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();