import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch'; // Import the fetch function
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// Parse incoming JSON data
app.use(bodyParser.json());

const tools: Anthropic.Beta.Tools.Tool[] = [
  {
    name: 'get_weather',
    description: 'Get the weather for a specific location',
    input_schema: {
      type: 'object',
      properties: { location: { type: 'string' } },
    },
  }
];

async function get_weather() {
  try {
    //lat, long set for Oakland, CA
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=37.8&lon=-122.2&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
    }
    
    const responseData = await response.json(); // Parse JSON response
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error; // Rethrow the error
  }
}

const runFunction = async (name: string, args: any) => {
  switch (name) {
    case 'get_weather':
      return await get_weather();
    default:
      return null;
  }
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/chat', async (req, res) => {
  try {
    const userMessage: Anthropic.Beta.Tools.ToolsBetaMessageParam = {
      role: 'user',
      content: req.body.message,
    };

    const message = await client.beta.tools.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [userMessage],
      tools,
    });

    if (message.stop_reason === 'tool_use') {
      const tool = message.content.find((content): content is Anthropic.Beta.Tools.ToolUseBlock => content.type === 'tool_use');

      if (tool) {
        console.log(tool);
        try {
          // Call runFunction directly with await
          const toolResult = await runFunction(tool.name, null);
          console.log('tool res: ', toolResult);

          const toolResultText = toolResult?.main?.temp.toString() || 'Unknown'; // Extract temperature from toolResult

          console.log('Tool Result: ' + toolResultText);

          // Use the resolved toolResult directly
          const result = await client.beta.tools.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [
              userMessage,
              { role: message.role, content: message.content },
              {
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: tool.id,
                    content: [{ type: 'text', text: toolResultText }],
                  },
                ],
              },
            ],
            tools,
          });
          res.json({ response: result });
        } catch (error) {
          console.error('Error occurred while running tool function:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
