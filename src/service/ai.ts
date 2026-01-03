import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// eklenmedi
export const generateDiagnosisSuggestion = async (symptoms: string) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key tanımlanmamış.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Sen uzman bir doktorsun. Aşağıdaki hasta şikayetlerine dayanarak olası bir teşhis ve önerilen tedavi planı oluştur.
        Lütfen cevabı geçerli bir JSON formatında ver. Başka hiçbir metin ekleme.
        Format şu şekilde olmalı:
        {
            "diagnosis": "Olası teşhis buraya",
            "treatment": "Önerilen tedavi planı buraya (ilaçlar, istirahat vb.)"
        }

        Hasta Şikayetleri: ${symptoms}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Yapay zeka önerisi oluşturulamadı.");
    }
};
