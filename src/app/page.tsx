'use client'

import { useState, useEffect } from 'react'
import { Loader2, Send, FileUp, Plus, MessageSquare, Trash2, Download, Upload } from 'lucide-react'
import { config, type Message, type Conversation } from '@/config'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load conversations from localStorage on initial render
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(config.app.storageKeys.conversations)
      const savedCurrentId = localStorage.getItem(config.app.storageKeys.currentConversation)
      
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations)
        setConversations(parsedConversations)
        
        if (savedCurrentId) {
          const current = parsedConversations.find((c: Conversation) => c.id === savedCurrentId)
          if (current) {
            setCurrentConversation(current)
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      // If there's an error loading, initialize with empty state
      setConversations([])
      setCurrentConversation(null)
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(config.app.storageKeys.conversations, JSON.stringify(conversations))
      if (currentConversation) {
        localStorage.setItem(config.app.storageKeys.currentConversation, currentConversation.id)
      } else {
        localStorage.removeItem(config.app.storageKeys.currentConversation)
      }
    } catch (error) {
      console.error('Error saving conversations:', error)
    }
  }, [conversations, currentConversation])

  const generateTitle = async (messages: Message[]) => {
    try {
      const response = await fetch(`${config.azure.endpoint}/openai/deployments/${config.azure.deploymentId}/chat/completions?api-version=${config.azure.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.azure.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate a short, concise title (max 6 words) for this conversation based on the first message. Respond with just the title, no quotes or additional text.'
            },
            messages[0]
          ],
        }),
      })
      
      const data = await response.json()
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content.trim()
      }
      return 'New Conversation'
    } catch (error) {
      console.error('Error generating title:', error)
      return 'New Conversation'
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const newMessage: Message = { role: 'user', content: input }
    let updatedConversation: Conversation
    
    if (!currentConversation) {
      // Create new conversation
      updatedConversation = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [newMessage],
        createdAt: new Date().toISOString()
      }
      setCurrentConversation(updatedConversation)
      setConversations(prev => [...prev, updatedConversation])
    } else {
      // Update existing conversation
      updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, newMessage]
      }
      setCurrentConversation(updatedConversation)
      setConversations(prev => 
        prev.map(conv => conv.id === currentConversation.id ? updatedConversation : conv)
      )
    }
    
    setInput('')
    setIsLoading(true)
    
    try {
      // Make API call for the response
      const response = await fetch(`${config.azure.endpoint}/openai/deployments/${config.azure.deploymentId}/chat/completions?api-version=${config.azure.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.azure.apiKey,
        },
        body: JSON.stringify({
          messages: updatedConversation.messages,
        }),
      })
      
      const data = await response.json()
      if (data.choices && data.choices[0]) {
        const assistantMessage = data.choices[0].message
        updatedConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage]
        }
        
        // Generate title for new conversations
        if (updatedConversation.messages.length === 2 && updatedConversation.title === 'New Conversation') {
          const title = await generateTitle([newMessage])
          updatedConversation = { ...updatedConversation, title }
        }
        
        setCurrentConversation(updatedConversation)
        setConversations(prev => 
          prev.map(conv => conv.id === updatedConversation.id ? updatedConversation : conv)
        )
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setCurrentConversation(null)
    setInput('')
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation)
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
      
      if (!currentConversation) {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          title: 'File Upload',
          messages: [newMessage],
          createdAt: new Date().toISOString()
        }
        setCurrentConversation(newConversation)
        setConversations(prev => [...prev, newConversation])
      } else {
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage]
        }
        setCurrentConversation(updatedConversation)
        setConversations(prev => 
          prev.map(conv => conv.id === currentConversation.id ? updatedConversation : conv)
        )
      }
    }
    reader.readAsText(file)
  }

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering conversation selection
    const isCurrentConversation = currentConversation?.id === conversationId
    
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    if (isCurrentConversation) {
      setCurrentConversation(null)
    }
  }

  const handleExportConversations = () => {
    try {
      const exportData = {
        conversations,
        currentConversationId: currentConversation?.id,
        exportDate: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting conversations:', error)
      alert('Failed to export conversations')
    }
  }

  const handleImportConversations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)
        
        if (importData.conversations && Array.isArray(importData.conversations)) {
          setConversations(prev => {
            // Merge imported conversations with existing ones, avoiding duplicates
            const existingIds = new Set(prev.map(conv => conv.id))
            const newConversations = importData.conversations.filter(
              (conv: Conversation) => !existingIds.has(conv.id)
            )
            return [...prev, ...newConversations]
          })

          if (importData.currentConversationId) {
            const current = importData.conversations.find(
              (c: Conversation) => c.id === importData.currentConversationId
            )
            if (current) {
              setCurrentConversation(current)
            }
          }
          alert('Conversations imported successfully')
        }
      } catch (error) {
        console.error('Error importing conversations:', error)
        alert('Failed to import conversations. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  if (!mounted) {
    return (
      <div className={`flex h-screen ${config.ui.colors.background.primary}`}>
        <div className={`${config.ui.sidebar.width} ${config.ui.colors.background.secondary} p-4 border-r ${config.ui.colors.border} flex flex-col`}>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
        <div className={`flex-1 flex flex-col ${config.ui.colors.background.primary}`}>
          <div className="flex-1 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-[80%]" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-[80%] ml-auto" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${config.ui.colors.background.primary}`}>
      {/* Sidebar */}
      <div className={`${config.ui.sidebar.width} ${config.ui.colors.background.secondary} p-4 border-r ${config.ui.colors.border} flex flex-col`}>
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center gap-2 p-2 rounded-lg ${config.ui.colors.background.tertiary} ${config.ui.colors.text.primary} hover:${config.ui.colors.background.active}`}
          aria-label="Start new chat"
        >
          <Plus size={20} />
          <span>New Chat</span>
        </button>
        
        {/* Import/Export Buttons */}
        <div className="mt-2 flex gap-2">
          <label 
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg ${config.ui.colors.text.primary} ${config.ui.colors.background.hover} cursor-pointer`}
            aria-label="Import conversations"
          >
            <input
              type="file"
              accept=".json"
              onChange={handleImportConversations}
              className="hidden"
            />
            <Upload size={16} />
            <span>Import</span>
          </label>
          <button
            onClick={handleExportConversations}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg ${config.ui.colors.text.primary} ${config.ui.colors.background.hover}`}
            aria-label="Export conversations"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
        
        {/* Conversations List */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {conversations.slice().reverse().map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg mb-2 ${config.ui.colors.text.primary} ${config.ui.colors.background.hover} group ${
                currentConversation?.id === conversation.id ? config.ui.colors.background.tertiary : ''
              }`}
            >
              <MessageSquare size={16} />
              <span className="truncate text-left flex-1">{conversation.title}</span>
              <Trash2 
                size={16} 
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                aria-label="Delete conversation"
              />
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className={`mt-4 pt-4 border-t ${config.ui.colors.border}`}>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${config.ui.colors.background.primary}`}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentConversation?.messages.map((message, index) => (
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
              <Loader2 className={`animate-spin ${config.ui.colors.text.primary}`} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${config.ui.colors.border}`}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label 
              className={`cursor-pointer p-2 rounded ${config.ui.colors.text.primary} ${config.ui.colors.background.hover}`}
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
              className={`flex-1 p-2 rounded-lg border ${config.ui.colors.border} ${config.ui.colors.background.primary} ${config.ui.colors.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`p-2 bg-${config.ui.colors.primary}-500 ${config.ui.colors.text.inverse} rounded-lg hover:bg-${config.ui.colors.primary}-600 disabled:opacity-50`}
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
