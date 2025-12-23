'use client'

import React, { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FileUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  onRemoveFile: (fileName: string) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number // in bytes
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function FileUploader({
  files,
  onFilesChange,
  onRemoveFile,
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  title = "拖拽文件到这里",
  description = "或点击上传",
  icon
}: FileUploaderProps) {
  
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    // Filter duplicates
    const newFiles = acceptedFiles.filter(file => !files.some(f => f.name === file.name))
    
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles])
    }

    if (fileRejections.length > 0) {
      console.warn('Rejected files:', fileRejections)
      // TODO: Show toast error
    }
  }, [files, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize,
    disabled: files.length >= maxFiles
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-purple-500" />
    if (file.name.endsWith('.md')) return <FileText className="h-5 w-5 text-blue-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-2",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-3 rounded-full bg-muted/50">
          {icon || <Upload className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          支持文件: {Object.keys(accept || {}).join(', ') || '所有文件'} (最大 {maxFiles} 个)
        </p>
      </div>

      {files.length > 0 && (
        <ScrollArea className="h-[200px] w-full border rounded-md p-4">
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {getFileIcon(file)}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile(file.name)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}








