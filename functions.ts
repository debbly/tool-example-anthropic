import Anthropic from "@anthropic-ai/sdk";

export const tools: Anthropic.Beta.Tools.Tool[] = [
  {
    name: 'get_weather',
    description: 'Get the weather for a specific location',
    input_schema: {
      type: 'object',
      properties: { location: { type: 'string' } },
    },
  },
  {
    name: "get_weather_with_location",
    description:
      "Get the weather for a location and check if it's suitable for kayaking.",
    input_schema: {
      type: "object",
      properties: {
          city: {
            type: "string",
            description: "A city",
          },
          state: {
            type: "string",
            description: "state that corresponds to city",
          },
          country: {
            type: "string",
            description: "Country that corresponds to city and state",
          },
      },
    },
  },
];

async function get_weather() {
  try {
    //lat, long set for Oakland, CA
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=37.8&lon=-122.2&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

async function get_location(city: string, state: string, country: string) {
  const location =  await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`);
  return location.json();
}

async function get_weather_with_location(city: string, state: string, country: string) {

  const location = await get_location(city, state, country);

  if (location) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location[0].lat}&lon=${location[0].lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "get_weather":
      return await get_weather();
    case "get_weather_with_location":
      return await get_weather_with_location(args["city"], args["state"], args["country"]);
    default:
      return null;
  }
}
