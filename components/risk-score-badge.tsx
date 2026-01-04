"use client"

import { cn } from "@/lib/utils"

interface RiskScoreBadgeProps {
  score: number
  className?: string
}

export function RiskScoreBadge({ score, className }: RiskScoreBadgeProps) {
  const getRiskColor = () => {
    if (score >= 60) return "text-destructive"
    if (score >= 30) return "text-warning"
    return "text-success"
  }

  const getRiskBg = () => {
    if (score >= 60) return "bg-destructive"
    if (score >= 30) return "bg-warning"
    return "bg-success"
  }

  const getProgressWidth = () => {
    return `${score}%`
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
        <span className={cn("text-2xl font-bold", getRiskColor())}>{score}/100</span>
      </div>
      <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 ease-out", getRiskBg())}
          style={{ width: getProgressWidth() }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Safe</span>
        <span>Moderate</span>
        <span>Dangerous</span>
      </div>
    </div>
  )
}
