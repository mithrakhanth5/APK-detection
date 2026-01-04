"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileWarning, Loader2 } from "lucide-react"
import { ApkResults } from "@/components/apk-results"
import type { AnalysisResult } from "@/types/analysis"

export function ApkUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    setResult(null)

    // Validate file type
    if (!selectedFile.name.endsWith(".apk")) {
      setError("Invalid file type. Please upload an APK file.")
      return
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError("File size exceeds 100MB limit.")
      return
    }

    setFile(selectedFile)
  }

  const analyzeApk = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("apk", file)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to analyze APK. Please try again.")
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  if (result) {
    return <ApkResults result={result} onReset={reset} />
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Upload APK File</CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload an Android APK file for comprehensive security analysis before installation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              accept=".apk"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isAnalyzing}
            />
            <div className="flex flex-col items-center gap-4 text-center">
              {file ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <FileWarning className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Drop APK file here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">Maximum file size: 100MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive-foreground">{error}</p>
            </div>
          )}

          {file && (
            <div className="flex gap-3">
              <Button
                onClick={analyzeApk}
                disabled={isAnalyzing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze APK"
                )}
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                disabled={isAnalyzing}
                className="border-border text-foreground hover:bg-accent bg-transparent"
              >
                Clear
              </Button>
            </div>
          )}

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-medium text-sm text-foreground mb-2">Analysis includes:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• APK metadata extraction and validation</li>
              <li>• Permission analysis and risk assessment</li>
              <li>• Certificate and signature verification</li>
              <li>• Malicious pattern detection</li>
              <li>• Comprehensive security scoring</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
