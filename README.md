# Anthropic Tool Example - Typescript

A simple one page Express app using Anthropic's Tool feature to get the weather using Open Weather. All necessary code is in the `app.ts` file. 

## Getting Started

Once you've forked the repository, install all dependencies using:
```
npm install
```

Create a `.env` file with the following keys:
```
ANTHROPIC_API_KEY=
OPENWEATHER_API_KEY=
```

To start the application:
```
npm start
```

Make requests:
```
curl -X POST -H "Content-Type: application/json" -d '{"message": "What is the weather in SF?"}'
```

The location is currently hardcoded to be SF, in order to have the application be more flexible you can use [this repo]() as a reference to build out a dynamic location <> weather app.


The `function.ts` file is not being used, and is a cleaner way to separate out the tool code!
 
 Currently, there not much documentation for the feature on Typescript, you can check out some writing about Tool here:
 - an example [tool.ts](https://github.com/anthropics/anthropic-sdk-typescript/blob/5bcaddbd396fa81e9b65bf2ce3b2917affae5c0a/examples/tools.ts)
 - [Documentation](https://docs.anthropic.com/claude/docs/tool-use) - still pretty Python specific
 -
