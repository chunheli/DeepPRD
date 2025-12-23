'use client'

import { useWizardStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/ui/file-uploader'
import { FileText } from 'lucide-react'

export function StepRawRequirements() {
  const { projectData, addRawRequirement, removeRawRequirement, updateProjectData } = useWizardStore()

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl">原始需求梳理</CardTitle>
        <CardDescription>
          上传您手写的原始需求描述或会议记录（Markdown 格式）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploader
          files={projectData.rawRequirements}
          onFilesChange={(files) => {
             // Handle new files (simple implementation: clear and set or append)
             // Store handles "add", so we iterate new ones.
             // But FileUploader gives all files.
             // Let's just reset the list in store or sync it.
             // For simplicity, let's update the store logic to allow bulk set or just handle diff.
             // Actually store has `addRawRequirement` and `remove`.
             // Let's modify FileUploader to just emit "add" event? No, standard is value/onChange.
             // I'll just map the file list to the store's updateProjectData directly for simplicity if I change the store interface, 
             // but currently store has individual adders.
             // Let's assume I can just replace the array in projectData.
             updateProjectData({ rawRequirements: files })
          }}
          onRemoveFile={removeRawRequirement}
          accept={{ 'text/markdown': ['.md'], 'text/plain': ['.txt'] }}
          title="上传需求梳理文档"
          description="支持 .md, .txt 文件"
          icon={<FileText className="h-6 w-6 text-blue-500" />}
        />
      </CardContent>
    </Card>
  )
}








