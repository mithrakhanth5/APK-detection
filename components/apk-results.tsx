"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Key,
  Download,
  ArrowLeft,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RiskScoreBadge } from "@/components/risk-score-badge"
import type { AnalysisResult } from "@/types/analysis"

interface ApkResultsProps {
  result: AnalysisResult
  onReset: () => void
}

export function ApkResults({ result, onReset }: ApkResultsProps) {
  const [showConsent, setShowConsent] = useState(result.riskLevel === "SUSPICIOUS" || result.riskLevel === "MALICIOUS")
  const [consentGiven, setConsentGiven] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    permissions: true,
    signature: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const getRiskColor = () => {
    switch (result.riskLevel) {
      case "SAFE":
        return "text-success"
      case "SUSPICIOUS":
        return "text-warning"
      case "MALICIOUS":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBgColor = () => {
    switch (result.riskLevel) {
      case "SAFE":
        return "bg-success/10 border-success/50"
      case "SUSPICIOUS":
        return "bg-warning/10 border-warning/50"
      case "MALICIOUS":
        return "bg-destructive/10 border-destructive/50"
      default:
        return "bg-muted"
    }
  }

  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case "SAFE":
        return <ShieldCheck className="h-12 w-12" />
      case "SUSPICIOUS":
        return <ShieldAlert className="h-12 w-12" />
      case "MALICIOUS":
        return <Shield className="h-12 w-12" />
      default:
        return <Shield className="h-12 w-12" />
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button onClick={onReset} variant="ghost" className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Analyze Another APK
      </Button>

      {/* Risk Summary */}
      <Card className={`border-2 ${getRiskBgColor()}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className={getRiskColor()}>{getRiskIcon()}</div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">Risk Level: {result.riskLevel}</h2>
                  <Badge variant="outline" className={`${getRiskColor()} border-current`}>
                    Score: {result.riskScore}/100
                  </Badge>
                </div>
                <p className="text-muted-foreground">{result.summary}</p>
              </div>

              <RiskScoreBadge score={result.riskScore} />

              <div className="space-y-2">
                {result.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                    <span className="text-foreground">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Warning */}
      {showConsent && !consentGiven && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive-foreground">Security Warning</AlertTitle>
          <AlertDescription className="text-destructive-foreground/90 mt-2">
            This APK has been flagged as potentially harmful. Installing it may compromise your device security, steal
            personal data, or cause other damage. We strongly recommend NOT installing this application.
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => setConsentGiven(true)}
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/20"
              >
                I Understand the Risks
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* APK Metadata */}
      <Card className="border-border bg-card">
        <CardHeader
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection("metadata")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">APK Metadata</CardTitle>
            </div>
            {expandedSections.metadata ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {expandedSections.metadata && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Package Name</p>
                <p className="font-mono text-sm text-foreground mt-1">{result.metadata.packageName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-mono text-sm text-foreground mt-1">
                  {result.metadata.versionName} ({result.metadata.versionCode})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-mono text-sm text-foreground mt-1">{result.metadata.fileSize}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SHA256 Hash</p>
                <p className="font-mono text-xs text-foreground mt-1 break-all">{result.metadata.sha256}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Permissions Analysis */}
      <Card className="border-border bg-card">
        <CardHeader
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection("permissions")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-foreground">Permissions Analysis</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {result.permissions.dangerous.length} dangerous permissions found
                </CardDescription>
              </div>
            </div>
            {expandedSections.permissions ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {expandedSections.permissions && (
          <CardContent className="space-y-4">
            {result.permissions.dangerous.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-destructive mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Dangerous Permissions
                </h4>
                <div className="space-y-2">
                  {result.permissions.dangerous.map((perm, idx) => (
                    <div key={idx} className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                      <p className="font-mono text-sm text-foreground">{perm.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{perm.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.permissions.normal.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-success mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Normal Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.permissions.normal.map((perm, idx) => (
                    <Badge key={idx} variant="outline" className="font-mono text-xs border-border text-foreground">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Signature Verification */}
      <Card className="border-border bg-card">
        <CardHeader
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection("signature")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-foreground">Signature Verification</CardTitle>
                <CardDescription className="text-muted-foreground">Certificate and signing information</CardDescription>
              </div>
            </div>
            {expandedSections.signature ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {expandedSections.signature && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Signed</p>
                <p className="text-sm text-foreground mt-1 flex items-center gap-2">
                  {result.signature.isSigned ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      No
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificate Type</p>
                <p className="text-sm text-foreground mt-1">{result.signature.certificateType}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issuer</p>
              <p className="font-mono text-xs text-foreground mt-1 break-all">{result.signature.issuer}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      {(result.riskLevel === "SAFE" || consentGiven) && (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Ready to Install</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.riskLevel === "SAFE"
                    ? "This APK appears to be safe for installation."
                    : "You have acknowledged the security risks."}
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Download className="h-4 w-4 mr-2" />
                Proceed with Installation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
