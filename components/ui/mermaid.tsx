'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

// 初始化 mermaid 配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
})

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const renderChart = async () => {
      if (!chart) return

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(id, chart)
        setSvg(svg)
        setError(false)
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(true)
      }
    }

    renderChart()
  }, [chart, mounted])

  // 服务端渲染或未挂载时显示占位符
  if (!mounted) {
    return (
      <pre className="p-4 bg-zinc-800 rounded-lg overflow-x-auto text-sm">
        <code className="text-zinc-300">{chart}</code>
      </pre>
    )
  }

  // 渲染失败时显示原始代码块
  if (error) {
    return (
      <pre className="p-4 bg-zinc-800 rounded-lg overflow-x-auto text-sm">
        <code className="text-zinc-300">{chart}</code>
      </pre>
    )
  }

  // 还没渲染完成时显示加载状态
  if (!svg) {
    return (
      <div className="my-4 flex justify-center p-4">
        <div className="text-zinc-400 text-sm">加载图表中...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
