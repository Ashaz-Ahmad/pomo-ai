import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Data = {
  response?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation context from history (limit to last 10 messages to prevent token overflow)
    let conversationContext = '';
    if (history && history.length > 0) {
      const recentHistory = history.slice(-10); // Only use last 10 messages
      conversationContext = recentHistory.map((msg: { role: string; content: string }) => {
        const speaker = msg.role === 'user' ? 'User' : 'AI';
        return `${speaker}: ${msg.content}`;
      }).join('\n\n') + '\n\n';
    }

    const fullPrompt = conversationContext + `User: ${message}\nAI:`;

    const result = await model.generateContent(fullPrompt);

    const response = result.response;
    const text = response.text();

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return res.status(500).json({ 
      error: 'Failed to get response from AI. Please check your API key and try again.' 
    });
  }
}

