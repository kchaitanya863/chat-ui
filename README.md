# Azure OpenAI Chat UI

A modern chat interface built with Next.js and Azure OpenAI API, featuring a ChatGPT-like experience with conversation history, file uploads, and theme customization.

## Features

- 🤖 Azure OpenAI API integration
- 💾 Local storage for conversation history
- 📁 File upload support
- 🌓 Dark/Light theme toggle
- 📱 Responsive design
- 📤 Import/Export conversations
- 🔍 Automatic conversation titling

## Prerequisites

- Node.js 18+ and npm
- Azure OpenAI API access
- Azure OpenAI deployment

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat-ui
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Update `.env.local` with your Azure OpenAI credentials:
```env
NEXT_PUBLIC_AZURE_API_KEY=your-api-key-here
NEXT_PUBLIC_AZURE_ENDPOINT=https://your-instance.openai.azure.com
NEXT_PUBLIC_AZURE_DEPLOYMENT_ID=your-deployment-id
NEXT_PUBLIC_AZURE_API_VERSION=2024-10-21
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the application.

## Usage

- **New Chat**: Click the "New Chat" button to start a fresh conversation
- **File Upload**: Use the file upload button to share text files with the AI
- **Theme Toggle**: Switch between light and dark modes using the theme toggle
- **Import/Export**: Backup and restore your conversations using the import/export features
- **Conversation History**: Access previous conversations from the sidebar

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_AZURE_API_KEY` | Your Azure OpenAI API key | Yes |
| `NEXT_PUBLIC_AZURE_ENDPOINT` | Your Azure OpenAI endpoint URL | Yes |
| `NEXT_PUBLIC_AZURE_DEPLOYMENT_ID` | Your Azure OpenAI deployment ID | Yes |
| `NEXT_PUBLIC_AZURE_API_VERSION` | API version (default: 2024-10-21) | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Application description | No |
| `NEXT_PUBLIC_DEFAULT_THEME` | Default theme (light/dark/system) | No |

## Technical Details

- Built with Next.js 14
- Uses Tailwind CSS for styling
- Implements Azure OpenAI Chat API
- Local storage for persistence
- TypeScript for type safety

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
