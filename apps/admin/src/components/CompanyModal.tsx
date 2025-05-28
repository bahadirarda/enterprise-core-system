'use client'

import { useState, useEffect } from 'react'
import { X, Building2 } from 'lucide-react'
import { adminActions, CreateCompanyData, UpdateCompanyData } from '@/lib/adminActions'
import { Company } from '@/lib/supabase'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  company?: Company | null
  mode: 'create' | 'edit'
}

export default function CompanyModal({ isOpen, onClose, onSuccess, company, mode }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    plan: 'Basic' as 'Basic' | 'Professional' | 'Enterprise'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (company && mode === 'edit') {
      setFormData({
        name: company.name,
        domain: company.domain,
        plan: company.plan
      })
    } else {
      setFormData({
        name: '',
        domain: '',
        plan: 'Basic'
      })
    }
    setError('')
  }, [company, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.domain.trim()) {
      setError('Lütfen tüm gerekli alanları doldurun')
      return
    }

    setLoading(true)
    setError('')

    try {
      let result
      if (mode === 'create') {
        result = await adminActions.createCompany(formData as CreateCompanyData)
      } else if (company) {
        result = await adminActions.updateCompany({
          id: company.id,
          ...formData
        } as UpdateCompanyData)
      }

      if (result?.success) {
        onSuccess()
        onClose()
      } else {
        setError(result?.error || 'Bir hata oluştu')
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Yeni Şirket Ekle' : 'Şirket Düzenle'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şirket Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Şirket adını girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain *
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ornek.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Basic">Basic</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : mode === 'create' ? 'Şirket Ekle' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 