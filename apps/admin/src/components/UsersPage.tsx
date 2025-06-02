'use client'

import React, { useState } from 'react'
import { Building2, Users, Search, User, Clock, Eye, Edit, Trash2, RefreshCw, UserPlus, Settings, Globe, X, Mail, Phone, MapPin, Calendar, Shield, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft, Plus } from 'lucide-react'
import { Company } from '@/lib/supabase'

interface AdminUser {
  id: string
  email: string
  status: string
  last_login: string
  company?: Company
}

interface UsersPageProps {
  users: AdminUser[]
  usersLoading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  refetchUsers: () => void
  getFilteredUsers: () => AdminUser[]
}

interface NewUserForm {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  
  // Work Information
  companyId: string
  department: string
  position: string
  employeeId: string
  startDate: string
  
  // Account Settings
  role: 'admin' | 'manager' | 'employee' | 'viewer'
  permissions: string[]
  temporaryPassword: string
  requirePasswordChange: boolean
  
  // Subscription & Payment
  licenseType: 'basic' | 'professional' | 'enterprise' | 'trial'
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'trial'
  subscriptionEndDate: string
  
  // Contact & Address
  address: string
  city: string
  country: string
  emergencyContact: string
  emergencyPhone: string
}

const INITIAL_FORM_STATE: NewUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  companyId: '',
  department: '',
  position: '',
  employeeId: '',
  startDate: '',
  role: 'employee',
  permissions: [],
  temporaryPassword: '',
  requirePasswordChange: true,
  licenseType: 'basic',
  paymentStatus: 'paid',
  subscriptionEndDate: '',
  address: '',
  city: '',
  country: '',
  emergencyContact: '',
  emergencyPhone: ''
}

export default function UsersPage({ 
  users, 
  usersLoading, 
  searchTerm, 
  setSearchTerm, 
  refetchUsers, 
  getFilteredUsers 
}: UsersPageProps) {
  const [showUserModal, setShowUserModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<NewUserForm>(INITIAL_FORM_STATE)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewUserForm, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New states for department and position creation
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [newPositionName, setNewPositionName] = useState('')
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false)
  const [isCreatingPosition, setIsCreatingPosition] = useState(false)

  // Mock data - replace with actual data from your backend
  const mockCompanies = [
    { id: '1', name: 'DigiDaga Enterprise', plan: 'Enterprise' },
    { id: '2', name: 'TechCorp Solutions', plan: 'Professional' },
    { id: '3', name: 'StartupHub Inc', plan: 'Basic' }
  ]

  const [departments, setDepartments] = useState([
    { id: '1', name: 'IT & Teknoloji', companyId: '1' },
    { id: '2', name: 'İnsan Kaynakları', companyId: '1' },
    { id: '3', name: 'Muhasebe & Finans', companyId: '1' },
    { id: '4', name: 'Pazarlama', companyId: '1' },
    { id: '5', name: 'Satış', companyId: '1' },
    { id: '6', name: 'Yazılım Geliştirme', companyId: '2' },
    { id: '7', name: 'Proje Yönetimi', companyId: '2' },
    { id: '8', name: 'Operasyon', companyId: '3' },
  ])

  const [positions, setPositions] = useState([
    { id: '1', name: 'Software Developer', departmentId: '1' },
    { id: '2', name: 'System Administrator', departmentId: '1' },
    { id: '3', name: 'DevOps Engineer', departmentId: '1' },
    { id: '4', name: 'İK Uzmanı', departmentId: '2' },
    { id: '5', name: 'İK Müdürü', departmentId: '2' },
    { id: '6', name: 'Muhasebe Uzmanı', departmentId: '3' },
    { id: '7', name: 'Mali Müşavir', departmentId: '3' },
    { id: '8', name: 'Pazarlama Uzmanı', departmentId: '4' },
    { id: '9', name: 'Dijital Pazarlama Uzmanı', departmentId: '4' },
    { id: '10', name: 'Satış Temsilcisi', departmentId: '5' },
    { id: '11', name: 'Satış Müdürü', departmentId: '5' },
    { id: '12', name: 'Frontend Developer', departmentId: '6' },
    { id: '13', name: 'Backend Developer', departmentId: '6' },
    { id: '14', name: 'Proje Yöneticisi', departmentId: '7' },
    { id: '15', name: 'Scrum Master', departmentId: '7' },
    { id: '16', name: 'Operasyon Uzmanı', departmentId: '8' },
  ])

  // Get departments for selected company
  const getCompanyDepartments = () => {
    if (!formData.companyId) return []
    return departments.filter(dept => dept.companyId === formData.companyId)
  }

  // Get positions for selected department
  const getDepartmentPositions = () => {
    if (!formData.department) return []
    const selectedDept = departments.find(d => d.name === formData.department && d.companyId === formData.companyId)
    if (!selectedDept) return []
    return positions.filter(pos => pos.departmentId === selectedDept.id)
  }

  const validateStep = (step: number): boolean => {
    const errors: Partial<Record<keyof NewUserForm, string>> = {}
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) errors.firstName = 'Ad gerekli'
        if (!formData.lastName.trim()) errors.lastName = 'Soyad gerekli'
        if (!formData.email.trim()) errors.email = 'E-posta gerekli'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Geçerli e-posta adresi girin'
        if (!formData.phone.trim()) errors.phone = 'Telefon numarası gerekli'
        break
        
      case 2: // Work Information
        if (!formData.companyId) errors.companyId = 'Şirket seçimi gerekli'
        if (!formData.department.trim()) errors.department = 'Departman gerekli'
        if (!formData.position.trim()) errors.position = 'Pozisyon gerekli'
        if (!formData.startDate) errors.startDate = 'Başlangıç tarihi gerekli'
        break
        
      case 3: // Account Settings
        if (!formData.temporaryPassword.trim()) errors.temporaryPassword = 'Geçici şifre gerekli'
        else if (formData.temporaryPassword.length < 8) errors.temporaryPassword = 'Şifre en az 8 karakter olmalı'
        if (!formData.licenseType) errors.licenseType = 'Lisans türü seçimi gerekli'
        if (!formData.paymentStatus) errors.paymentStatus = 'Ödeme durumu seçimi gerekli'
        if (!formData.subscriptionEndDate) errors.subscriptionEndDate = 'Abonelik bitiş tarihi gerekli'
        break
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleInputChange = (field: keyof NewUserForm, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Reset dependent fields when company changes
    if (field === 'companyId') {
      setFormData(prev => ({ ...prev, department: '', position: '' }))
    }
    // Reset position when department changes
    if (field === 'department') {
      setFormData(prev => ({ ...prev, position: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    try {
      // Mock API call - replace with actual user creation logic
      console.log('Creating user:', formData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form and close modal
      setFormData(INITIAL_FORM_STATE)
      setCurrentStep(1)
      setFormErrors({})
      setShowUserModal(false)
      
      // Refresh users list
      refetchUsers()
      
      alert('Kullanıcı başarıyla oluşturuldu!')
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Kullanıcı oluşturulurken hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUserModal = () => {
    setShowUserModal(true)
    setCurrentStep(1)
    setFormData(INITIAL_FORM_STATE)
    setFormErrors({})
  }

  // Department creation functions
  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) return
    
    setIsCreatingDepartment(true)
    try {
      // Mock API call - replace with actual department creation
      const newDepartment = {
        id: Date.now().toString(),
        name: newDepartmentName,
        companyId: formData.companyId
      }
      
      setDepartments(prev => [...prev, newDepartment])
      setFormData(prev => ({ ...prev, department: newDepartment.name, position: '' })) // Reset position when department changes
      
      // Close modal and reset
      setShowDepartmentModal(false)
      setNewDepartmentName('')
      
      alert('Departman başarıyla oluşturuldu!')
      
    } catch (error) {
      console.error('Failed to create department:', error)
      alert('Departman oluşturulurken hata oluştu.')
    } finally {
      setIsCreatingDepartment(false)
    }
  }

  // Position creation functions
  const handleCreatePosition = async () => {
    if (!newPositionName.trim()) return
    
    setIsCreatingPosition(true)
    try {
      // Find selected department ID
      const selectedDept = departments.find(d => d.name === formData.department && d.companyId === formData.companyId)
      if (!selectedDept) {
        alert('Departman bulunamadı. Lütfen tekrar deneyin.')
        return
      }
      
      // Mock API call - replace with actual position creation
      const newPosition = {
        id: Date.now().toString(),
        name: newPositionName,
        departmentId: selectedDept.id
      }
      
      setPositions(prev => [...prev, newPosition])
      setFormData(prev => ({ ...prev, position: newPosition.name }))
      
      // Close modal and reset
      setShowPositionModal(false)
      setNewPositionName('')
      
      alert('Pozisyon başarıyla oluşturuldu!')
      
    } catch (error) {
      console.error('Failed to create position:', error)
      alert('Pozisyon oluşturulurken hata oluştu.')
    } finally {
      setIsCreatingPosition(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DevOps Style Header - Users (Soft Green/Emerald Theme) */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-green-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
                <p className="text-gray-600">Manage user accounts, roles, and access permissions</p>
              </div>
            </div>
            
            {/* Real-time Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Active Users</p>
                    <p className="font-medium text-gray-900 text-sm">{usersLoading ? '...' : getFilteredUsers().length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Online Now</p>
                  <p className="font-bold text-green-600 text-lg">{usersLoading ? '...' : Math.round((getFilteredUsers().length || 0) * 0.15)}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Companies</p>
                  <p className="font-bold text-blue-600 text-lg">{usersLoading ? '...' : new Set(users?.map(u => u.company?.name).filter(Boolean)).size || 0}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Avg Login</p>
                  <p className="font-bold text-emerald-600 text-lg">2.3h</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={refetchUsers}
                disabled={usersLoading}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh users"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Actions & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded text-green-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="font-medium">{getFilteredUsers().length} Total</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 rounded text-emerald-700">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="font-medium">{Math.round((getFilteredUsers().length || 0) * 0.15)} Online</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded text-blue-700">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{new Set(users?.map(u => u.company?.name).filter(Boolean)).size} Companies</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by email..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Role Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
                defaultValue="all"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button 
              onClick={openUserModal}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Modern Table-like User Layout */}
        {usersLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {getFilteredUsers().map((user) => (
              <div key={user.id} className="group bg-white border border-gray-200 hover:border-gray-300 rounded-lg hover:shadow-sm transition-all duration-200">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors border border-emerald-200">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                            {user.email}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            Active
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              user.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                            {user.status === 'online' ? 'Online' : 'Offline'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {user.company?.name || 'No Company'}
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Employee
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Last login: {new Date(user.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {user.company?.plan || 'Basic'} Plan
                        </div>
                        <div className="text-xs text-gray-500">
                          Member since 2024
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Empty State */}
        {!usersLoading && getFilteredUsers().length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "No users match your search criteria."
                : "No users have been added yet."
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={openUserModal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add First User
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Creation Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUserModal(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Yeni Kullanıcı Ekle</h2>
                  <p className="text-sm text-gray-600 mt-1">Portal kullanıcısı oluşturun ve sistem erişimi verin</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gray-50/50">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, title: 'Kişisel Bilgiler', icon: User },
                  { step: 2, title: 'İş Bilgileri', icon: Building2 },
                  { step: 3, title: 'Hesap Ayarları', icon: Settings },
                  { step: 4, title: 'Özet & Onay', icon: CheckCircle }
                ].map(({ step, title, icon: Icon }, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center space-x-2 ${
                      step <= currentStep ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      <div className={`p-2 rounded-lg border-2 ${
                        step <= currentStep 
                          ? 'bg-emerald-100 border-emerald-300' 
                          : 'bg-gray-100 border-gray-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{title}</span>
                    </div>
                    {index < 3 && (
                      <ChevronRight className={`w-4 h-4 mx-4 ${
                        step < currentStep ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-emerald-600" />
                      Kişisel Bilgiler
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Kullanıcının adı"
                        />
                        {formErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Kullanıcının soyadı"
                        />
                        {formErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-posta Adresi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="kullanici@ornekdomen.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon Numarası <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+90 555 123 45 67"
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doğum Tarihi
                        </label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Work Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-emerald-600" />
                      İş Bilgileri
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Şirket <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.companyId}
                          onChange={(e) => handleInputChange('companyId', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.companyId ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Şirket seçin</option>
                          {mockCompanies.map(company => (
                            <option key={company.id} value={company.id}>
                              {company.name} ({company.plan})
                            </option>
                          ))}
                        </select>
                        {formErrors.companyId && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.companyId}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departman <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.department}
                            onChange={(e) => {
                              if (e.target.value === 'create_new') {
                                setShowDepartmentModal(true)
                              } else {
                                handleInputChange('department', e.target.value)
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                              formErrors.department ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={!formData.companyId}
                          >
                            <option value="">Departman seçin</option>
                            {getCompanyDepartments().map(dept => (
                              <option key={dept.id} value={dept.name}>
                                {dept.name}
                              </option>
                            ))}
                            {formData.companyId && (
                              <option value="create_new" className="text-emerald-600 font-medium">
                                + Yeni Departman Oluştur
                              </option>
                            )}
                          </select>
                          {!formData.companyId && (
                            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center text-xs text-gray-500">
                              Önce şirket seçin
                            </div>
                          )}
                        </div>
                        {formErrors.department && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pozisyon <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.position}
                            onChange={(e) => {
                              if (e.target.value === 'create_new') {
                                setShowPositionModal(true)
                              } else {
                                handleInputChange('position', e.target.value)
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                              formErrors.position ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={!formData.department}
                          >
                            <option value="">Pozisyon seçin</option>
                            {getDepartmentPositions().map(pos => (
                              <option key={pos.id} value={pos.name}>
                                {pos.name}
                              </option>
                            ))}
                            {formData.department && (
                              <option value="create_new" className="text-emerald-600 font-medium">
                                + Yeni Pozisyon Oluştur
                              </option>
                            )}
                          </select>
                          {!formData.department && (
                            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center text-xs text-gray-500">
                              Önce departman seçin
                            </div>
                          )}
                        </div>
                        {formErrors.position && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personel Numarası
                        </label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={(e) => handleInputChange('employeeId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="EMP001, 12345, vs."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlangıç Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.startDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.startDate && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Account Settings */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-emerald-600" />
                      Hesap Ayarları
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kullanıcı Rolü <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value as NewUserForm['role'])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="employee">Çalışan</option>
                          <option value="manager">Yönetici</option>
                          <option value="admin">Admin</option>
                          <option value="viewer">Görüntüleyici</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Kullanıcının sistem içindeki yetki seviyesi
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Geçici Şifre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={formData.temporaryPassword}
                          onChange={(e) => handleInputChange('temporaryPassword', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.temporaryPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="En az 8 karakter"
                        />
                        {formErrors.temporaryPassword && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.temporaryPassword}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lisans Türü <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.licenseType}
                          onChange={(e) => handleInputChange('licenseType', e.target.value as NewUserForm['licenseType'])}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.licenseType ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="trial">Deneme (30 gün)</option>
                          <option value="basic">Temel Plan</option>
                          <option value="professional">Profesyonel Plan</option>
                          <option value="enterprise">Kurumsal Plan</option>
                        </select>
                        {formErrors.licenseType && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.licenseType}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Müşterinin satın aldığı lisans paketi
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ödeme Durumu <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) => handleInputChange('paymentStatus', e.target.value as NewUserForm['paymentStatus'])}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.paymentStatus ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="paid">Ödendi</option>
                          <option value="pending">Ödeme Bekliyor</option>
                          <option value="overdue">Vadesi Geçti</option>
                          <option value="trial">Deneme Sürümü</option>
                        </select>
                        {formErrors.paymentStatus && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.paymentStatus}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Müşterinin güncel ödeme durumu
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Abonelik Bitiş Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.subscriptionEndDate}
                          onChange={(e) => handleInputChange('subscriptionEndDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            formErrors.subscriptionEndDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {formErrors.subscriptionEndDate && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.subscriptionEndDate}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Müşterinin abonelik süresinin bitim tarihi
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requirePasswordChange"
                            checked={formData.requirePasswordChange}
                            onChange={(e) => handleInputChange('requirePasswordChange', e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor="requirePasswordChange" className="text-sm text-gray-700">
                            İlk giriş sırasında şifre değişikliği zorunlu
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Sistem Yetkileri
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          'Profil Görüntüleme',
                          'Profil Düzenleme',
                          'Rapor Görüntüleme',
                          'Rapor Oluşturma',
                          'Kullanıcı Yönetimi',
                          'Sistem Ayarları'
                        ].map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={permission}
                              checked={formData.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('permissions', [...formData.permissions, permission])
                                } else {
                                  handleInputChange('permissions', formData.permissions.filter(p => p !== permission))
                                }
                              }}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor={permission} className="text-sm text-gray-700">
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Summary & Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                      Özet & Onay
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Kişisel Bilgiler</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Ad Soyad:</span> {formData.firstName} {formData.lastName}</p>
                            <p><span className="font-medium">E-posta:</span> {formData.email}</p>
                            <p><span className="font-medium">Telefon:</span> {formData.phone}</p>
                            {formData.dateOfBirth && (
                              <p><span className="font-medium">Doğum Tarihi:</span> {formData.dateOfBirth}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">İş Bilgileri</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Şirket:</span> {mockCompanies.find(c => c.id === formData.companyId)?.name || 'Seçilmedi'}</p>
                            <p><span className="font-medium">Departman:</span> {formData.department}</p>
                            <p><span className="font-medium">Pozisyon:</span> {formData.position}</p>
                            <p><span className="font-medium">Başlangıç:</span> {formData.startDate}</p>
                            {formData.employeeId && (
                              <p><span className="font-medium">Personel No:</span> {formData.employeeId}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Hesap Ayarları</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Rol:</span> {
                              formData.role === 'admin' ? 'Admin' :
                              formData.role === 'manager' ? 'Yönetici' :
                              formData.role === 'employee' ? 'Çalışan' : 'Görüntüleyici'
                            }</p>
                            <p><span className="font-medium">Şifre Değişikliği:</span> {formData.requirePasswordChange ? 'Zorunlu' : 'İsteğe bağlı'}</p>
                            <p><span className="font-medium">Yetkiler:</span> {formData.permissions.length} özellik seçildi</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span>Kullanıcı oluşturulduktan sonra e-posta ile bilgilendirilecektir.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200/50 bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Adım {currentStep} / 4
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1 inline" />
                    Geri
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    İleri
                    <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Kullanıcı Oluştur</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Creation Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDepartmentModal(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Yeni Departman</h3>
                  <p className="text-sm text-gray-600 mt-1">Şirket için yeni departman oluşturun</p>
                </div>
              </div>
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departman Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Örn: IT & Teknoloji, İnsan Kaynakları..."
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateDepartment()}
                />
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <strong>Şirket:</strong> {mockCompanies.find(c => c.id === formData.companyId)?.name}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200/50 bg-gray-50/50">
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateDepartment}
                disabled={!newDepartmentName.trim() || isCreatingDepartment}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isCreatingDepartment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Position Creation Modal */}
      {showPositionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPositionModal(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Yeni Pozisyon</h3>
                  <p className="text-sm text-gray-600 mt-1">Departman için yeni pozisyon oluşturun</p>
                </div>
              </div>
              <button
                onClick={() => setShowPositionModal(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pozisyon Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Örn: Software Developer, Proje Yöneticisi..."
                  onKeyPress={(e) => e.key === 'Enter' && handleCreatePosition()}
                />
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg space-y-1">
                <div><strong>Şirket:</strong> {mockCompanies.find(c => c.id === formData.companyId)?.name}</div>
                <div><strong>Departman:</strong> {formData.department}</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200/50 bg-gray-50/50">
              <button
                onClick={() => setShowPositionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreatePosition}
                disabled={!newPositionName.trim() || isCreatingPosition}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isCreatingPosition ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}