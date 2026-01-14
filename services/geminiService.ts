
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ReferenceFile {
  data: string;
  mimeType: string;
}

export const analyzeWorkflowImage = async (
  base64Image: string, 
  additionalInstructions?: string,
  referenceFile?: ReferenceFile
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';

  const basePrompt = `
    Analyze this workflow diagram image which describes "Quản lý đánh giá, lịch sử tham gia thầu" (Contractor Evaluation & Bidding History Management).
    
    Tasks:
    1. Summarize the business workflow described.
    2. Identify all logical steps and decision points.
    3. Suggest an optimized relational database schema (tables and fields) to support this specific workflow.
       
       QUY TẮC ĐẶT TÊN BẮT BUỘC:
       - TÊN BẢNG (tableName): Phải là tiếng Việt KHÔNG DẤU, viết theo kiểu PascalCase (ví dụ: QuanLyNhaThau, DanhMucVatTu, LichSuDauThau).
       - TÊN CỘT (fields[].name): Phải là tiếng Việt KHÔNG DẤU, bắt đầu bằng ký tự 'f' và viết theo kiểu CamelCase (ví dụ: fMaNhaThau, fTenNhaThau, fNgayDanhGia, fDiemSo).
       - Không sử dụng ký tự đặc biệt hay khoảng trắng trong tên bảng và tên cột.

    4. Provide specific database design tips for scalability and data integrity.
  `;

  const refinementPrompt = additionalInstructions 
    ? `\n\nUSER REQUEST FOR REFINEMENT: ${additionalInstructions}\nPlease adjust your analysis and database suggestions based on this specific request while still considering the overall workflow in the image and STRICTLY ADHERING to the naming conventions (unaccented Vietnamese, fields start with 'f').`
    : "";

  const referencePrompt = referenceFile
    ? `\n\nAn additional reference file has been provided. Use its content as extra context for the refinement request.`
    : "";

  const finalPrompt = `
    ${basePrompt}
    ${refinementPrompt}
    ${referencePrompt}
    
    Please provide the response in a structured JSON format matching the schema provided.
    Ensure descriptions are in Vietnamese as requested by the user context.
  `;

  const parts: any[] = [
    { inlineData: { mimeType: "image/png", data: base64Image } },
    { text: finalPrompt }
  ];

  if (referenceFile) {
    parts.push({ 
      inlineData: { 
        mimeType: referenceFile.mimeType, 
        data: referenceFile.data 
      } 
    });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          workflowSummary: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["title", "description", "type"]
            }
          },
          databaseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tableName: { type: Type.STRING },
                fields: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      isPrimaryKey: { type: Type.BOOLEAN },
                      isForeignKey: { type: Type.BOOLEAN },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "type", "isPrimaryKey", "isForeignKey", "description"]
                  }
                },
                reasoning: { type: Type.STRING }
              },
              required: ["tableName", "fields", "reasoning"]
            }
          },
          optimizationTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["workflowSummary", "steps", "databaseSchema", "optimizationTips"]
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not parse the AI analysis result.");
  }
};
