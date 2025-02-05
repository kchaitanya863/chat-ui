'use client'

import { useState, useEffect } from 'react'
import { Loader2, Send, FileUp, Plus, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { config } from '@/config'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem(config.app.storageKeys.chatMessages)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(config.app.storageKeys.chatMessages, JSON.stringify(messages))
  }, [messages])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const newMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch(`${config.azure.endpoint}/openai/deployments/${config.azure.deploymentId}/chat/completions?api-version=${config.azure.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.azure.apiKey,
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
        }),
      })
      
      const data = await response.json()
      if (data.choices && data.choices[0]) {
        setMessages(prev => [...prev, data.choices[0].message])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > config.app.maxFileSize) {
      alert('File size exceeds the maximum limit')
      return
    }

    if (!config.app.supportedFileTypes.some(type => file.type.match(type))) {
      alert('File type not supported')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newMessage: Message = {
        role: 'user',
        content: `Uploaded file content:\n${content}`,
      }
      setMessages(prev => [...prev, newMessage])
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${config.ui.sidebar.width} bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700`}>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="Start new chat"
        >
          <Plus size={20} />
          New Chat
        </button>
        <div className="mt-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            Toggle Theme
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? config.ui.colors.userMessage
                    : config.ui.colors.assistantMessage
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label 
              className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              aria-label="Upload file"
            >
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                accept={config.app.supportedFileTypes.join(',')}
                aria-label="Upload file"
              />
              <FileUp size={20} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`p-2 bg-${config.ui.colors.primary}-500 text-white rounded-lg hover:bg-${config.ui.colors.primary}-600 disabled:opacity-50`}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
