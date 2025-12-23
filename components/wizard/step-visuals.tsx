'use client'

import { useWizardStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/ui/file-uploader'
import { Image as ImageIcon } from 'lucide-react'

export function StepVisuals() {
  const { projectData, updateProjectData, removeVisual } = useWizardStore()

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl">视觉与交互设计</CardTitle>
        <CardDescription>
          上传交互设计稿、原型图或关键页面截图。这是生成"控制面需求"的关键依据。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploader
          files={projectData.visuals}
          onFilesChange={(files) => updateProjectData({ visuals: files })}
          onRemoveFile={removeVisual}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
          maxFiles={10}
          title="上传交互设计图"
          description="支持 PNG, JPG (最多 10 张)"
          icon={<ImageIcon className="h-6 w-6 text-purple-500" />}
        />
      </CardContent>
    </Card>
  )
}








