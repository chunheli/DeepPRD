'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useWizardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Sparkles, Download, RefreshCw, AlertCircle, FileText, Image as ImageIcon, Server } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Mermaid } from '@/components/ui/mermaid'

export function StepGeneration() {
  const { projectData } = useWizardStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // 用于累积文本并节流更新
  const bufferRef = useRef<string>('')
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  // 当 result 更新且正在生成时，自动滚动到底部
  useEffect(() => {
    if (isGenerating && result) {
      scrollToBottom()
    }
  }, [result, isGenerating, scrollToBottom])

  const flushBuffer = useCallback(() => {
    if (bufferRef.current) {
      setResult(prev => prev + bufferRef.current)
      bufferRef.current = ''
    }
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setResult('')
    bufferRef.current = ''

    try {
      const formData = new FormData()
      formData.append('theme', projectData.theme)

      projectData.rawRequirements.forEach(file => formData.append('rawRequirements', file))
      projectData.visuals.forEach(file => formData.append('visuals', file))
      projectData.techContext.forEach(file => formData.append('techContext', file))

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 每 100ms 更新一次 UI，减少重渲染
      updateTimerRef.current = setInterval(flushBuffer, 100)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        bufferRef.current += text
      }

      // 清理定时器并刷新剩余内容
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current)
        updateTimerRef.current = null
      }
      flushBuffer()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current)
        updateTimerRef.current = null
      }
      flushBuffer()
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectData.theme || 'system-requirements'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl">准备生成</CardTitle>
          <CardDescription>
            DeepPRD 已准备好根据以下资料生成文档。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/30 border flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">原始需求</p>
                <p className="text-xs text-muted-foreground">{projectData.rawRequirements.length} 个文件</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">交互图</p>
                <p className="text-xs text-muted-foreground">{projectData.visuals.length} 张图片</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border flex items-center gap-3">
              <Server className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">技术背景</p>
                <p className="text-xs text-muted-foreground">{projectData.techContext.length} 个文件</p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>生成失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!result && !isGenerating && (
            <div className="flex justify-center py-8">
              <Button size="lg" onClick={handleGenerate} className="gap-2 text-lg h-12 px-8">
                <Sparkles className="h-5 w-5" />
                开始生成需求文档
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(result || isGenerating) && (
        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">生成预览</span>
              {isGenerating && <span className="text-xs text-muted-foreground animate-pulse ml-2">正在写入...</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
                重新生成
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={isGenerating || !result}>
                <Download className="h-4 w-4 mr-2" />
                下载 .md
              </Button>
            </div>
          </div>
          <ScrollArea ref={scrollAreaRef} className="h-[600px] w-full p-6 bg-card">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const language = match ? match[1] : ''
                    const codeString = String(children).replace(/\n$/, '')

                    // 如果是 mermaid 代码块，使用 Mermaid 组件渲染
                    if (language === 'mermaid') {
                      return <Mermaid chart={codeString} />
                    }

                    // 其他代码块正常渲染
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}

