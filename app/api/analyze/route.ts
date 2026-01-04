import { NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { randomBytes } from "crypto"
import { spawn } from "child_process"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface AnalysisResult {
  riskScore: number
  riskLevel: "SAFE" | "SUSPICIOUS" | "MALICIOUS"
  summary: string
  warnings: string[]
  metadata: {
    packageName: string
    versionName: string
    versionCode: string
    fileSize: string
    sha256: string
  }
  permissions: {
    dangerous: Array<{
      name: string
      description: string
    }>
    normal: string[]
  }
  signature: {
    isSigned: boolean
    certificateType: string
    issuer: string
  }
}

export async function POST(request: Request) {
  let tempFilePath: string | null = null

  try {
    const formData = await request.formData()
    const file = formData.get("apk") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith(".apk")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Create temporary file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempFileName = `${randomBytes(16).toString("hex")}.apk`
    tempFilePath = join(tmpdir(), tempFileName)

    await writeFile(tempFilePath, buffer)

    // Run Python analysis script
    const result = await analyzeApkWithPython(tempFilePath, file.name, buffer.length)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath)
      } catch (err) {
        console.error("Failed to delete temp file:", err)
      }
    }
  }
}

function analyzeApkWithPython(filePath: string, fileName: string, fileSize: number): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", ["scripts/analyze_apk.py", filePath, fileName, fileSize.toString()])

    let outputData = ""
    let errorData = ""

    python.stdout.on("data", (data) => {
      outputData += data.toString()
    })

    python.stderr.on("data", (data) => {
      errorData += data.toString()
    })

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorData)
        reject(new Error(`Python script failed with code ${code}`))
        return
      }

      try {
        const result = JSON.parse(outputData)
        resolve(result)
      } catch (err) {
        reject(new Error("Failed to parse analysis result"))
      }
    })
  })
}
