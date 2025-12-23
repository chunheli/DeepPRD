'use client'

import { useWizardStore } from '@/lib/store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function StepProjectInfo() {
  const { projectData, updateProjectData } = useWizardStore()

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl">项目初始化</CardTitle>
        <CardDescription>
          首先，请为我们要生成的需求文档定义一个主题。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">需求主题名称</Label>
          <Input
            id="theme"
            placeholder="例如：权限访问可视化（PAV）-角色视角分析"
            value={projectData.theme}
            onChange={(e) => updateProjectData({ theme: e.target.value })}
            className="h-12 text-lg"
          />
          <p className="text-sm text-muted-foreground">
            这将作为生成文档的主标题和 Prompt 的核心上下文。
          </p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            📄 系统已预置以下标准文档：
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
            <li>系统需求文档模板 (v2.0)</li>
            <li>系统需求文档撰写要求 (Standard)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            * 这些文档将自动注入到 AI 上下文中作为生成标准，您无需手动上传。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}








