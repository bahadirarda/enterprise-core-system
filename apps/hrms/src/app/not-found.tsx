"use client"

import { Building, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
          <Building className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
        <p className="text-gray-600 mb-6 text-center max-w-xs">
          Aradığınız sayfa bulunamadı veya erişim yetkiniz yok. Lütfen ana sayfaya dönün veya menüden başka bir sayfa seçin.
        </p>
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Home className="h-5 w-5 mr-2" />
          Ana Sayfa
        </Link>
      </div>
    </div>
  )
} 