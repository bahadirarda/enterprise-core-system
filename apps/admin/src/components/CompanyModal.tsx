'use client'

import { useState, useEffect } from 'react'
import { X, Building2, User, CreditCard, Settings, MapPin, Phone, Mail, Globe, Users, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { adminActions, CreateCompanyData, UpdateCompanyData } from '@/lib/adminActions'
import { Company } from '@/lib/supabase'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  company?: Company | null
  mode: 'create' | 'edit'
}

type Step = 'basic' | 'contact' | 'subscription' | 'settings' | 'review'

interface FormData {
  // Basic Info
  name: string
  domain: string
  description: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  
  // Contact Info
  contact_name: string
  contact_email: string
  contact_phone: string
  address: string
  city: string
  country: string
  website: string
  
  // Subscription
  plan: 'Basic' | 'Professional' | 'Enterprise'
  user_limit: number
  billing_cycle: 'monthly' | 'yearly'
  
  // Settings
  timezone: string
  language: string
  features: string[]
  custom_domain: boolean
  sso_enabled: boolean
}

export default function CompanyModal({ isOpen, onClose, onSuccess, company, mode }: CompanyModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    name: '',
    domain: '',
    description: '',
    industry: '',
    size: 'small',
    
    // Contact Info
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: 'Turkey',
    website: '',
    
    // Subscription
    plan: 'Basic',
    user_limit: 10,
    billing_cycle: 'monthly',
    
    // Settings
    timezone: 'Europe/Istanbul',
    language: 'tr',
    features: [],
    custom_domain: false,
    sso_enabled: false
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [completedSteps, setCompletedSteps] = useState<Step[]>([])

  const steps: { id: Step; title: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'basic', 
      title: 'Company Information', 
      icon: <Building2 className="w-5 h-5" />,
      description: 'Basic company details and industry information'
    },
    { 
      id: 'contact', 
      title: 'Contact Details', 
      icon: <User className="w-5 h-5" />,
      description: 'Primary contact and address information'
    },
    { 
      id: 'subscription', 
      title: 'Subscription Plan', 
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Choose the right plan for your organization'
    },
    { 
      id: 'settings', 
      title: 'Configuration', 
      icon: <Settings className="w-5 h-5" />,
      description: 'System preferences and feature settings'
    },
    { 
      id: 'review', 
      title: 'Review & Submit', 
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Review all information before creating'
    }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Consulting', 'Real Estate', 'Other'
  ]

  const planFeatures = {
    Basic: ['Up to 10 users', 'Basic HRMS features', 'Email support', 'Monthly reports'],
    Professional: ['Up to 100 users', 'Advanced HRMS features', 'Priority support', 'Custom reports', 'API access'],
    Enterprise: ['Unlimited users', 'Full feature set', '24/7 dedicated support', 'Custom integrations', 'SSO', 'Advanced analytics']
  }

  const planPricing = {
    Basic: { monthly: 500, yearly: 5000 },
    Professional: { monthly: 1200, yearly: 12000 },
    Enterprise: { monthly: 2500, yearly: 25000 }
  }

  useEffect(() => {
    if (company && mode === 'edit') {
      setFormData({
        ...formData,
        name: company.name,
        domain: company.domain,
        plan: company.plan,
        // Other fields would be loaded from company data
      })
    } else {
      // Reset form for create mode
      setCurrentStep('basic')
      setCompletedSteps([])
      setErrors({})
    }
  }, [company, mode, isOpen])

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 'basic':
        if (!formData.name.trim()) newErrors.name = 'Company name is required'
        if (!formData.domain.trim()) newErrors.domain = 'Domain is required'
        if (!formData.industry) newErrors.industry = 'Industry is required'
        break
      
      case 'contact':
        if (!formData.contact_name.trim()) newErrors.contact_name = 'Contact name is required'
        if (!formData.contact_email.trim()) newErrors.contact_email = 'Contact email is required'
        if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
          newErrors.contact_email = 'Invalid email format'
        }
        break
      
      case 'subscription':
        if (formData.user_limit < 1) newErrors.user_limit = 'User limit must be at least 1'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps([...completedSteps.filter(s => s !== currentStep), currentStep])
      const currentIndex = steps.findIndex(s => s.id === currentStep)
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id)
      }
    }
  }

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep('review')) return

    setLoading(true)

    try {
      let result
      if (mode === 'create') {
        result = await adminActions.createCompany({
          name: formData.name,
          domain: formData.domain,
          plan: formData.plan
        } as CreateCompanyData)
      } else if (company) {
        result = await adminActions.updateCompany({
          id: company.id,
          name: formData.name,
          domain: formData.domain,
          plan: formData.plan
        } as UpdateCompanyData)
      }

      if (result?.success) {
        onSuccess()
        onClose()
      } else {
        setErrors({ submit: result?.error || 'An error occurred' })
      }
    } catch {
      setErrors({ submit: 'Unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const renderBasicStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter company name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Domain *
          </label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => updateFormData('domain', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.domain ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="company.com"
          />
          {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of the company"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => updateFormData('industry', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.industry ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Size
          </label>
          <select
            value={formData.size}
            onChange={(e) => updateFormData('size', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="startup">Startup (1-10)</option>
            <option value="small">Small (11-50)</option>
            <option value="medium">Medium (51-200)</option>
            <option value="large">Large (201-1000)</option>
            <option value="enterprise">Enterprise (1000+)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Primary Contact Name *
          </label>
          <input
            type="text"
            value={formData.contact_name}
            onChange={(e) => updateFormData('contact_name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.contact_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="John Smith"
          />
          {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => updateFormData('contact_email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.contact_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="john@company.com"
          />
          {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => updateFormData('contact_phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+90 212 123 45 67"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateFormData('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://company.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Company address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Istanbul"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => updateFormData('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Turkey">Turkey</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionStep = () => (
    <div className="space-y-8">
      {/* Plan Selection */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Basic', 'Professional', 'Enterprise'] as const).map((plan) => (
            <div
              key={plan}
              onClick={() => updateFormData('plan', plan)}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                formData.plan === plan
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {formData.plan === plan && (
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="text-center">
                <h5 className="text-lg font-semibold text-gray-900 mb-2">{plan}</h5>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ₺{planPricing[plan][formData.billing_cycle].toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  per {formData.billing_cycle === 'monthly' ? 'month' : 'year'}
                </p>
                
                <ul className="text-sm text-left space-y-2">
                  {planFeatures[plan].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Cycle */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Billing Cycle
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="monthly"
              checked={formData.billing_cycle === 'monthly'}
              onChange={(e) => updateFormData('billing_cycle', e.target.value)}
              className="mr-2 text-blue-500 focus:ring-blue-500"
            />
            Monthly
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="yearly"
              checked={formData.billing_cycle === 'yearly'}
              onChange={(e) => updateFormData('billing_cycle', e.target.value)}
              className="mr-2 text-blue-500 focus:ring-blue-500"
            />
            Yearly (2 months free)
          </label>
        </div>
      </div>

      {/* User Limit */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Initial User Limit
        </label>
        <input
          type="number"
          min="1"
          max={formData.plan === 'Enterprise' ? 10000 : formData.plan === 'Professional' ? 100 : 10}
          value={formData.user_limit}
          onChange={(e) => updateFormData('user_limit', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          You can adjust this limit later in your account settings
        </p>
      </div>
    </div>
  )

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => updateFormData('timezone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
            <option value="UTC">UTC (GMT+0)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => updateFormData('language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tr">Turkish</option>
            <option value="en">English</option>
            <option value="de">German</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      {/* Feature Toggles */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Feature Configuration</h4>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Custom Domain</span>
              <p className="text-sm text-gray-500">Use your own domain for the HRMS portal</p>
            </div>
            <input
              type="checkbox"
              checked={formData.custom_domain}
              onChange={(e) => updateFormData('custom_domain', e.target.checked)}
              className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Single Sign-On (SSO)</span>
              <p className="text-sm text-gray-500">Enable SAML/OAuth integration</p>
            </div>
            <input
              type="checkbox"
              checked={formData.sso_enabled}
              onChange={(e) => updateFormData('sso_enabled', e.target.checked)}
              disabled={formData.plan !== 'Enterprise'}
              className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
          </label>
        </div>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Review Company Information</h4>
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Company Name</label>
            <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Domain</label>
            <p className="text-lg font-semibold text-gray-900">{formData.domain}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Industry</label>
            <p className="text-lg font-semibold text-gray-900">{formData.industry}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Company Size</label>
            <p className="text-lg font-semibold text-gray-900 capitalize">{formData.size}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h5 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Primary Contact</label>
              <p className="text-gray-900">{formData.contact_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{formData.contact_email}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="border-t border-gray-200 pt-6">
          <h5 className="text-md font-semibold text-gray-900 mb-3">Subscription Details</h5>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">{formData.plan} Plan</p>
              <p className="text-sm text-gray-500">
                ₺{planPricing[formData.plan][formData.billing_cycle].toLocaleString()} / {formData.billing_cycle === 'monthly' ? 'month' : 'year'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">User Limit</p>
              <p className="text-lg font-semibold text-gray-900">{formData.user_limit}</p>
            </div>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic': return renderBasicStep()
      case 'contact': return renderContactStep()
      case 'subscription': return renderSubscriptionStep()
      case 'settings': return renderSettingsStep()
      case 'review': return renderReviewStep()
      default: return renderBasicStep()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {mode === 'create' ? 'Create New Company' : 'Edit Company'}
                </h3>
                <p className="text-indigo-100">
                  {mode === 'create' ? 'Set up a new enterprise company account' : 'Update company information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep === step.id ? 'text-blue-600' : 
                  completedSteps.includes(step.id) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id ? 'bg-blue-100 border-2 border-blue-500' :
                    completedSteps.includes(step.id) ? 'bg-green-100 border-2 border-green-500' :
                    'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 max-h-[50vh] overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {steps.find(s => s.id === currentStep)?.title}
            </h4>
            <p className="text-gray-600">
              {steps.find(s => s.id === currentStep)?.description}
            </p>
          </div>
          
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 'basic'}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            
            {currentStep === 'review' ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create Company' : 'Save Changes'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 