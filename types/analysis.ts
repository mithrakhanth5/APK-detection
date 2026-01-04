export interface AnalysisResult {
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
