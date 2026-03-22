import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Model configurations
export const AI_MODELS = {
  vision: {
    primary: process.env.AI_MODEL_VISION_PRIMARY || 'nvidia/nemotron-nano-12b-vl:free',
    alt1: process.env.AI_MODEL_VISION_ALT_1 || 'qwen/qwen3-vl-30b-a3b:free',
    alt2: process.env.AI_MODEL_VISION_ALT_2 || 'mistralai/mistral-small-3.1-24b-instruct:free',
  },
  chat: process.env.AI_MODEL_CHAT || 'stepfun/step-3.5-flash:free',
} as const;

export type VisionModel = typeof AI_MODELS.vision.primary;

// Extract receipt data using Vision AI
export async function extractReceiptData(imageBase64: string): Promise<{
  vendor: string;
  date: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  total: number;
}> {
  const dataUrl = `data:image/jpeg;base64,${imageBase64}`;
  
  const response = await openai.chat.completions.create({
    model: AI_MODELS.vision.primary,
    messages: [
      {
        role: 'system',
        content: `You are an expert OCR and document understanding system.
You will be given an image of a receipt or invoice.
Your task is to extract the following information:

1. vendor_name: The name of the store/vendor
2. transaction_date: The date on the receipt (format: YYYY-MM-DD)
3. line_items: Array of items with:
   - description: Item name/description
   - quantity: Number of items
   - unit_price: Price per unit
   - total: Total price for this item
4. total: The grand total amount

Return ONLY valid JSON with no explanations. Format:
{
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "items": [{"description": "string", "quantity": number, "unitPrice": number, "total": number}],
  "total": number
}`
      },
      {
        role: 'user',
        content: [
          { type: 'text' as const, text: 'Extract all information from this receipt:' },
          { type: 'image_url' as const, image_url: { url: dataUrl } }
        ]
      }
    ],
    max_tokens: 4096,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || '';
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found');
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to extract receipt data');
  }
}

// Natural language search
export async function naturalLanguageSearch(query: string, contextData?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: AI_MODELS.chat,
    messages: [
      {
        role: 'system',
        content: `You are a financial assistant for AXA Project.
${contextData ? `Here is the relevant data:\n${contextData}` : ''}
Answer questions about projects, budgets, expenses, and transactions.
Keep answers concise and in Indonesian unless the query is in English.`
      },
      {
        role: 'user',
        content: query
      }
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || 'Maaf, saya tidak dapat menjawab pertanyaan tersebut.';
}

// Anomaly detection
export async function detectAnomaly(estimatedCost: number, actualCost: number): Promise<{
  isAnomaly: boolean;
  percentageOver: number;
  message: string;
}> {
  if (estimatedCost === 0) {
    return { isAnomaly: false, percentageOver: 0, message: '' };
  }
  
  const percentage = ((actualCost - estimatedCost) / estimatedCost) * 100;
  const isAnomaly = percentage > 20;
  
  return {
    isAnomaly,
    percentageOver: Math.round(percentage),
    message: isAnomaly 
      ? `Pengeluaran melebihi estimasi sebesar ${Math.round(percentage)}%`
      : ''
  };
}

export { openai };