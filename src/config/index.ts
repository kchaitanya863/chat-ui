export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}

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
      conversations: 'conversations',
      currentConversation: 'currentConversation',
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
      userMessage: 'bg-blue-500 text-white',
      assistantMessage: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
      text: {
        primary: 'text-gray-900 dark:text-gray-100',
        secondary: 'text-gray-600 dark:text-gray-300',
        inverse: 'text-white',
      },
      background: {
        primary: 'bg-white dark:bg-gray-900',
        secondary: 'bg-gray-50 dark:bg-gray-800',
        tertiary: 'bg-gray-100 dark:bg-gray-700',
        hover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
        active: 'bg-gray-200 dark:bg-gray-600',
      },
      border: 'border-gray-200 dark:border-gray-700'
    },
  },
} 