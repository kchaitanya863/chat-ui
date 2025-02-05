export const config = {
  azure: {
    endpoint: process.env.NEXT_PUBLIC_AZURE_ENDPOINT || 'https://azure-openai-evcc.openai.azure.com',
    deploymentId: process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_ID || 'EVCC_openAI_instance_testing',
    apiVersion: process.env.NEXT_PUBLIC_AZURE_API_VERSION || '2024-10-21',
    apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY || '',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Chat UI',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A ChatGPT-like interface using Azure OpenAI API',
    defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'system',
    storageKeys: {
      chatMessages: 'chatMessages',
      theme: 'theme',
    },
    maxFileSize: 1024 * 1024 * 5, // 5MB
    supportedFileTypes: ['text/*'],
  },
  ui: {
    sidebar: {
      width: 'w-64',
      mobileWidth: 'w-full',
    },
    colors: {
      primary: 'blue',
      userMessage: 'bg-blue-500',
      assistantMessage: 'bg-gray-200 dark:bg-gray-700',
    },
  },
} 