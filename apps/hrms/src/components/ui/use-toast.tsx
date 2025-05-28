"use client"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  // Simple alert for now - in a real app you'd use a proper toast library
  const message = title + (description ? `\n${description}` : '')
  if (variant === "destructive") {
    alert(`❌ ${message}`)
  } else {
    alert(`✅ ${message}`)
  }
} 