import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000; // Port must be exactly 3000

app.use(express.json());

// Initialize Gemini SDK lazily
let ai: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// API endpoint for generating custom wishes/poems with Gemini
app.post('/api/generate-wish', async (req, res) => {
  try {
    const { name, relation, tone, dynamicPrompt } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Recipient name is required' });
    }

    const client = getGemini();
    
    const prompt = `Write a beautiful, unique, and personalized birthday wish or poem.
Recipient's Name: ${name}
Relationship to the creator: ${relation || 'friend'}
Tone of the message: ${tone || 'heartfelt'}
Specific details, hobbies, or memories to include: ${dynamicPrompt || 'none'}

The message should feel magical, premium, and deeply emotional (like Pixar/Disney meets Apple: modern yet incredibly warm).
Do not use generic clichés. Keep it relatively concise (1-2 short stanzas or 2-4 sentences) so it fits beautifully inside a premium animated digital greeting card.
Return ONLY the final greeting/poem itself. Do not include any introductory text, outro remarks, or quotation marks around the message.`;

    const response = await client.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });

    const text = response.text || '';
    res.json({ text: text.trim() });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate wish' });
  }
});

// Configure Vite or Static Files
const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

if (!isProd) {
  // Import Vite dynamically to avoid loading it in production build
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);
  
  // Serve index.html for SPA routing
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await import('fs').then(fs => fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8'));
      template = await vite.transformIndexHtml(url, template);
      
      // Inject Supabase environment secrets dynamically
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      const injection = `
        <script id="supabase-injected-secrets">
          window.__SUPABASE_URL__ = ${JSON.stringify(supabaseUrl)};
          window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(supabaseAnonKey)};
        </script>
      `;
      template = template.replace('</head>', `${injection}</head>`);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Production static serving
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath, { index: false }));
  app.get('*', async (req, res) => {
    try {
      const fs = await import('fs');
      const filePath = path.join(distPath, 'index.html');
      if (fs.existsSync(filePath)) {
        let template = fs.readFileSync(filePath, 'utf-8');
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
        const injection = `
          <script id="supabase-injected-secrets">
            window.__SUPABASE_URL__ = ${JSON.stringify(supabaseUrl)};
            window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(supabaseAnonKey)};
          </script>
        `;
        template = template.replace('</head>', `${injection}</head>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } else {
        res.status(404).send('Not Found');
      }
    } catch (err) {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    }
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Wishly server running at http://0.0.0.0:${port} in ${isProd ? 'production' : 'development'} mode`);
});
