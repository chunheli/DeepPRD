'use client'

import { useWizardStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/ui/file-uploader'
import { Server } from 'lucide-react'

export function StepTechContext() {
  const { projectData, updateProjectData, removeTechContext } = useWizardStore()

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl">技术背景资料</CardTitle>
        <CardDescription>
          上传相关的技术架构、接口文档或数据库设计文档（可选）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploader
          files={projectData.techContext}
          onFilesChange={(files) => updateProjectData({ techContext: files })}
          onRemoveFile={removeTechContext}
          accept={{ 'text/markdown': ['.md'], 'text/plain': ['.txt'] }}
          title="上传技术文档"
          description="支持 .md, .txt 文件"
          icon={<Server className="h-6 w-6 text-green-500" />}
        />
      </CardContent>
    </Card>
  )
}








