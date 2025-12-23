import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs' // We need nodejs runtime for fs

// 增加超时时间
export const maxDuration = 300 // 5 minutes

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
})

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const theme = formData.get('theme') as string
    const rawRequirementsFiles = formData.getAll('rawRequirements') as File[]
    const visualsFiles = formData.getAll('visuals') as File[]
    const techContextFiles = formData.getAll('techContext') as File[]

    // 1. Read Templates
    const templatesDir = path.join(process.cwd(), 'templates')
    const templateContent = await fs.readFile(path.join(templatesDir, 'system-requirements-template.md'), 'utf-8')
    const guidelinesContent = await fs.readFile(path.join(templatesDir, 'writing-guidelines.md'), 'utf-8')

    // 2. Process User Inputs
    let rawRequirementsText = ""
    for (const file of rawRequirementsFiles) {
      const text = await file.text()
      rawRequirementsText += `\n--- Document: ${file.name} ---\n${text}\n`
    }

    let techContextText = ""
    for (const file of techContextFiles) {
      const text = await file.text()
      techContextText += `\n--- Document: ${file.name} ---\n${text}\n`
    }

    // 3. Process Images
    const imageContent: Anthropic.Messages.ImageBlockParam[] = []
    for (const file of visualsFiles) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      // Map file type to media type
      let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg"
      if (file.type === 'image/png') mediaType = 'image/png'
      if (file.type === 'image/webp') mediaType = 'image/webp'
      if (file.type === 'image/gif') mediaType = 'image/gif'
      
      imageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64
        }
      })
    }

    // 4. Construct Prompt
    const prompt = `
# 系统需求文档生成任务

## 需求主题
${theme}

## 目标
完成《${theme}-系统需求说明书》的撰写。

## 参考资料阅读清单

### 必读文档
1. **系统需求模板**：(如下)
${templateContent}

2. **系统需求文档撰写要求**：(如下)
${guidelinesContent}

3. **原始需求/用户需求**：(如下)
${rawRequirementsText || "无"}

4. **技术背景资料**：(如下)
${techContextText || "无"}

5. **交互设计稿**：
(见附带的图片)

## 撰写要求
请严格按照上述《系统需求文档撰写要求》和《系统需求模板》的结构，结合原始需求和交互设计稿，生成一份完整的系统需求文档。
请确保：
- 控制面需求：基于交互设计稿中的 UI 和交互逻辑撰写。
- 运行面需求：根据控制面需求推导后台需要提供的数据、接口、处理逻辑。
- 输出格式为纯 Markdown。
- 所有流程图、状态图、时序图等图表必须使用 Mermaid 语法生成，使用 \`\`\`mermaid 代码块包裹。
`

    // 5. Call Claude
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: [
          ...imageContent,
          { type: 'text', text: prompt }
        ]
      }
    ]

    // 6. Return Stream with auto-continue support
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        let stopReason = ''
        let continueCount = 0
        const maxContinues = 5 // 最多续写5次

        // 检查文档是否完整（以附录或特定结束标记结束）
        const isDocumentComplete = (content: string) => {
          const trimmed = content.trim()
          // 检查是否包含文档结束的标志性内容
          return trimmed.includes('## 8. 附录') ||
                 trimmed.includes('# 附录') ||
                 trimmed.includes('---END---') ||
                 trimmed.endsWith('```') && trimmed.includes('## 7.') // 数据需求章节结束
        }

        // 生成函数
        const generate = async (currentMessages: Anthropic.MessageParam[]) => {
          const stream = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
            max_tokens: 64000,
            messages: currentMessages,
            stream: true,
          })

          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              fullContent += chunk.delta.text
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
            if (chunk.type === 'message_delta' && chunk.delta.stop_reason) {
              stopReason = chunk.delta.stop_reason
              console.log(`Generation stopped with reason: ${stopReason}, content length: ${fullContent.length}`)
            }
          }
        }

        // 首次生成
        await generate(messages)

        // 如果因为 max_tokens 停止且文档不完整，自动续写
        while (
          (stopReason === 'max_tokens' || !isDocumentComplete(fullContent)) &&
          continueCount < maxContinues &&
          stopReason !== 'end_turn'
        ) {
          continueCount++
          console.log(`Auto-continuing generation (attempt ${continueCount})...`)

          // 添加换行分隔
          controller.enqueue(encoder.encode('\n'))
          fullContent += '\n'

          // 构建续写消息
          const continueMessages: Anthropic.MessageParam[] = [
            ...messages,
            {
              role: 'assistant',
              content: fullContent
            },
            {
              role: 'user',
              content: '请继续完成剩余内容，从你上次停止的地方继续写。不要重复已经写过的内容。'
            }
          ]

          stopReason = '' // 重置
          await generate(continueMessages)
        }

        console.log(`Generation complete. Total length: ${fullContent.length}, Stop reason: ${stopReason}, Continues: ${continueCount}`)
        controller.close()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Generation Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}








