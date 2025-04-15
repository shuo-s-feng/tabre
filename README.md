# Tabre

A powerful web-based API definition and testing platform that enables you to define and play with API endpoints. With Tabre, you can:

- Define APIs using a declarative JSON format
- Test APIs directly from your browser tabs
- Let ChatGPT understand and utilize your API definitions
- Transform and chain API calls with preprocessing capabilities
- Access browser context (cookies, localStorage) in your API calls but no worry about leaks as they remain in the original tab

## Getting Started

1. Install the Chrome Extension:

   - Visit [Tabre - Tab Request](https://chromewebstore.google.com/detail/tabre-tab-request/gbjmofioeokcjcpmdpcpoelpkljihdjg) in the Chrome Web Store
   - Click "Add to Chrome" to install the extension
   - This extension is required to make requests on behalf of your browser tabs

2. Try out the [demo](https://demo.tabre.org/) to see Tabre in action

3. For local development:
   ```bash
   git clone https://github.com/shuo-s-feng/tabre.git
   cd tabre
   yarn install
   yarn dev
   ```

## Features

- Built with React 19 and TypeScript
- Material UI components with Emotion styling
- Markdown support with KaTeX math rendering
- OpenAI integration
- Powerful API definition system

## Project Structure

```
tabre/
├── src/                     # Source files
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── components/          # React components
│   ├── constants/           # Constants and configurations
│   ├── extensions/          # Custom request query string builders
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite environment types
├── public/                  # Static assets and API definitions
│   └── domain.com/          # Domain-specific API endpoints
│       ├── single-step/     # Single-step API endpoints
│       └── multiple-steps/  # Multi-step API endpoints
├── docs/                    # Documentation
│   └── API.md               # API definition guide
...
```

## API Definition System

Tabre provides a powerful API definition system that allows you to create and manage API endpoints through JSON files. Key features include:

- **Parameter Preprocessing**: Transform input parameters using other API calls
- **Custom Request Handling**: Define custom query string builders and request methods
- **Flexible Response Parsing**: Parse responses using config-based or custom JavaScript
- **Tab Context Injection**: Access browser context like cookies and local storage

For detailed documentation on creating API definitions, see [API.md](docs/API.md).

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
