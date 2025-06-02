'use client'

import React from 'react'
import { Building2, Users, Search, User, Clock, Eye, Edit, Trash2, RefreshCw, UserPlus, Settings, Globe, BarChart3 } from 'lucide-react'
import { Company } from '@/lib/supabase'

interface CompaniesPageProps {
  companies: Company[]
  companiesLoading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedFilter: string
  setSelectedFilter: (filter: string) => void
  refetchCompanies: () => void
  getFilteredCompanies: () => Company[]
  handleCreateCompany: () => void
  handleEditCompany: (company: Company) => void
  handleDeleteCompany: (companyId: string) => void
  deleteLoading: string | null
}

export default function CompaniesPage({ 
  companies,
  companiesLoading, 
  searchTerm, 
  setSearchTerm, 
  selectedFilter,
  setSelectedFilter,
  refetchCompanies, 
  getFilteredCompanies,
  handleCreateCompany,
  handleEditCompany,
  handleDeleteCompany,
  deleteLoading
}: CompaniesPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DevOps Style Header - Companies (Soft Blue/Indigo Theme) */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-slate-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Company Management</h1>
                <p className="text-gray-600">Enterprise-level company administration and user allocation</p>
              </div>
            </div>
            
            {/* Real-time Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Active Companies</p>
                    <p className="font-medium text-gray-900 text-sm">{companiesLoading ? '...' : companies?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Enterprise Plans</p>
                  <p className="font-bold text-purple-600 text-lg">{companiesLoading ? '...' : companies?.filter(c => c.plan === 'Enterprise').length || 0}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="font-bold text-green-600 text-lg">{companiesLoading ? '...' : companies?.reduce((sum, c) => sum + (c.user_count || 0), 0) || 0}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Monthly Revenue</p>
                  <p className="font-bold text-blue-600 text-lg">₺{companiesLoading ? '...' : Math.round((companies?.reduce((sum, c) => sum + ((c.plan === 'Enterprise' ? 2500 : c.plan === 'Professional' ? 1200 : 500) * (c.user_count || 0)), 0) || 0)).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button 
                onClick={refetchCompanies}
                disabled={companiesLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh companies"
              >
                <RefreshCw className={`w-4 h-4 ${companiesLoading ? 'animate-spin' : ''}`} />
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
                <span className="font-medium">{getFilteredCompanies().length} Active</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 rounded text-purple-700">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span className="font-medium">{getFilteredCompanies().filter(c => c.plan === 'Enterprise').length} Enterprise</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded text-blue-700">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{getFilteredCompanies().reduce((sum, c) => sum + (c.user_count || 0), 0)} Users</span>
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
                  placeholder="Search companies..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button 
              onClick={handleCreateCompany}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 shadow-sm text-sm font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Company
            </button>
          </div>
        </div>

        {/* Modern Table-like Layout */}
        {companiesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {getFilteredCompanies().map((company) => (
              <div key={company.id} className="group bg-white border border-gray-200 hover:border-gray-300 rounded-lg hover:shadow-sm transition-all duration-200">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {/* Company Info */}
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors border border-blue-200">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {company.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            company.plan === 'Enterprise' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            company.plan === 'Professional' 
                              ? 'bg-green-100 text-green-700 border border-green-200' :
                              'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {company.plan}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            Active
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {company.domain}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {company.user_count || 0} users
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(company.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue & Actions */}
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-base font-semibold text-gray-900">
                          ₺{((company.plan === 'Enterprise' ? 2500 : company.plan === 'Professional' ? 1200 : 500) * (company.user_count || 0)).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">monthly revenue</div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditCompany(company)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit company"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCompany(company.id)}
                          disabled={deleteLoading === company.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete company"
                        >
                          {deleteLoading === company.id ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
        {!companiesLoading && getFilteredCompanies().length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedFilter !== 'all' 
                ? "No companies match your search criteria."
                : "Get started by adding your first company."
              }
            </p>
            {(!searchTerm && selectedFilter === 'all') && (
              <button 
                onClick={handleCreateCompany}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Your First Company
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 