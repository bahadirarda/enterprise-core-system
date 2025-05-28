'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, Text3D, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Building,
  DollarSign,
  CreditCard,
  FileText,
  UserPlus,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  Eye,
  Clock,
  AlertCircle,
  Save,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Three.js Background - Simplified and subtle
function AnimatedSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.02
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.01
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.01
    }
  })

  return (
    <Float speed={0.2} rotationIntensity={0.05} floatIntensity={0.05}>
      <mesh
        ref={meshRef}
        position={position}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={0.03}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </Float>
  )
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const [positions] = useState(() => {
    const positions = new Float32Array(150 * 3)
    for (let i = 0; i < 150; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return positions
  })

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.002
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={150}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6366f1"
        size={0.0005}
        transparent
        opacity={0.1}
        sizeAttenuation
      />
    </points>
  )
}

function BackgroundScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
      dpr={[1, 1.2]}
      performance={{ min: 0.8 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={0.1} color="#6366f1" />
        
        <ParticleField />
        <Stars radius={20} depth={15} count={30} factor={0.3} saturation={0.05} fade />
        
        <AnimatedSphere position={[-1, 0.3, -1.5]} />
        <AnimatedSphere position={[1, -0.3, -2]} />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.02} />
      </Suspense>
    </Canvas>
  )
}

// Application Status Types
interface ApplicationProgress {
  id: string
  employee_email: string
  employee_name: string
  current_step: number
  form_data: any
  status: 'draft' | 'form_sent' | 'form_completed' | 'review_pending' | 'completed'
  created_at: string
  updated_at: string
  hr_manager_id: string
  form_url?: string
}

interface AddEmployeeWizardProps {
  onComplete: () => void
  onCancel: () => void
  existingProgress?: ApplicationProgress
}

const steps = [
  { id: 1, title: 'Kişisel Bilgiler', description: 'Temel kimlik bilgileri', icon: User },
  { id: 2, title: 'İletişim & Acil Durum', description: 'İletişim detayları', icon: Phone },
  { id: 3, title: 'İş Bilgileri', description: 'Pozisyon ve departman', icon: Building },
  { id: 4, title: 'Finansal Bilgiler', description: 'Maaş ve ödeme detayları', icon: CreditCard },
  { id: 5, title: 'Form Gönderimi & Tamamlama', description: 'Davet ve onay', icon: Send }
]

export function AddEmployeeWizard({ onComplete, onCancel, existingProgress }: AddEmployeeWizardProps) {
  const [currentStep, setCurrentStep] = useState(existingProgress?.current_step || 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formSent, setFormSent] = useState(existingProgress?.status === 'form_sent')
  const [applicationId, setApplicationId] = useState(existingProgress?.id)
  const { toast } = useToast()
  // const supabase = createClientComponentClient()

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    first_name: existingProgress?.form_data?.first_name || '',
    last_name: existingProgress?.form_data?.last_name || '',
    email: existingProgress?.form_data?.email || '',
    phone: existingProgress?.form_data?.phone || '',
    birth_date: existingProgress?.form_data?.birth_date || '',
    tc_identity: existingProgress?.form_data?.tc_identity || '',
    address: existingProgress?.form_data?.address || '',
    
    // Step 2: Contact & Emergency
    emergency_contact_name: existingProgress?.form_data?.emergency_contact_name || '',
    emergency_contact_phone: existingProgress?.form_data?.emergency_contact_phone || '',
    emergency_contact_relationship: existingProgress?.form_data?.emergency_contact_relationship || '',
    
    // Step 3: Work Info
    department_id: existingProgress?.form_data?.department_id || '',
    position_id: existingProgress?.form_data?.position_id || '',
    salary: existingProgress?.form_data?.salary || '',
    hire_date: existingProgress?.form_data?.hire_date || new Date().toISOString().split('T')[0],
    employee_id: existingProgress?.form_data?.employee_id || '',
    
    // Step 4: Financial Info
    tax_id: existingProgress?.form_data?.tax_id || '',
    bank_account: existingProgress?.form_data?.bank_account || '',
    
    // Step 5: Notes
    notes: existingProgress?.form_data?.notes || ''
  })

  // Mock data
  const departments = [
    { id: '1', name: 'İnsan Kaynakları' },
    { id: '2', name: 'Yazılım Geliştirme' },
    { id: '3', name: 'Pazarlama' },
    { id: '4', name: 'Satış' },
    { id: '5', name: 'Finans' }
  ]

  const positions = [
    { id: '1', title: 'İK Uzmanı', department_id: '1', salary_range: '45000-65000' },
    { id: '2', title: 'Frontend Developer', department_id: '2', salary_range: '80000-120000' },
    { id: '3', title: 'UI/UX Designer', department_id: '2', salary_range: '70000-100000' },
    { id: '4', title: 'Pazarlama Uzmanı', department_id: '3', salary_range: '50000-75000' },
    { id: '5', title: 'Satış Temsilcisi', department_id: '4', salary_range: '40000-80000' }
  ]

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.first_name && formData.email) {
        saveProgress()
      }
    }, 30000)

    return () => clearInterval(autoSaveInterval)
  }, [formData])

  // Generate employee ID
  useEffect(() => {
    if (formData.first_name && formData.last_name && !formData.employee_id) {
      const initials = `${formData.first_name.charAt(0)}${formData.last_name.charAt(0)}`.toUpperCase()
      const timestamp = Date.now().toString().slice(-4)
      setFormData(prev => ({
        ...prev,
        employee_id: `EMP${initials}${timestamp}`
      }))
    }
  }, [formData.first_name, formData.last_name])

  const saveProgress = async () => {
    if (!formData.first_name || !formData.email) return

    setIsSaving(true)
    try {
      const progressData = {
        id: applicationId || `app_${Date.now()}`,
        employee_email: formData.email,
        employee_name: `${formData.first_name} ${formData.last_name}`,
        current_step: currentStep,
        form_data: formData,
        status: formSent ? 'form_sent' : 'draft',
        updated_at: new Date().toISOString(),
        hr_manager_id: 'current_user_id'
      }

      console.log('Saving progress:', progressData)
      
      if (!applicationId) {
        setApplicationId(progressData.id)
      }

      toast({
        title: "✅ İlerleme Kaydedildi",
        description: "Çalışma ilerlemeniz bulutta güvenli bir şekilde saklandı.",
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: "⚠️ Kaydetme Hatası",
        description: "İlerleme kaydedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      saveProgress()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const sendEmployeeForm = async () => {
    setIsSubmitting(true)
    try {
      const formUrl = `https://forms.kikos.app/employee-form/${applicationId}`
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Sending form to employee:', {
        email: formData.email,
        name: `${formData.first_name} ${formData.last_name}`,
        formUrl
      })

      setFormSent(true)
      
      await saveProgress()

      toast({
        title: "📧 Form Gönderildi!",
        description: `${formData.first_name} ${formData.last_name} adresine doldurulacak form gönderildi.`,
      })

    } catch (error) {
      console.error('Error sending form:', error)
      toast({
        title: "❌ Gönderim Hatası",
        description: "Form gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeApplication = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Completing employee application:', formData)

      toast({
        title: "🎉 Başarılı!",
        description: `${formData.first_name} ${formData.last_name} başarıyla sisteme eklendi.`,
      })

      onComplete()
    } catch (error) {
      console.error('Error completing application:', error)
      toast({
        title: "❌ Hata",
        description: "İşlem tamamlanırken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-700 font-medium">Ad *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Adınızı girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-700 font-medium">Soyad *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Soyadınızı girin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">E-posta Adresi *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ornek@sirket.com"
                />
                <p className="text-gray-500 text-sm">Form bu adrese gönderilecek</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">Telefon Numarası *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+90 555 123 45 67"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-gray-700 font-medium">Doğum Tarihi</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tc_identity" className="text-gray-700 font-medium">TC Kimlik No</Label>
                <Input
                  id="tc_identity"
                  value={formData.tc_identity}
                  onChange={(e) => setFormData(prev => ({ ...prev, tc_identity: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="12345678901"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 font-medium">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                placeholder="Tam adres bilgisi..."
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Acil Durum İletişim Bilgileri
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name" className="text-gray-700 font-medium">Acil Durum Kişisi Adı *</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone" className="text-gray-700 font-medium">Telefon Numarası *</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+90 555 987 65 43"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship" className="text-gray-700 font-medium">Yakınlık Derecesi *</Label>
                <Select 
                  value={formData.emergency_contact_relationship} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, emergency_contact_relationship: value }))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anne">Anne</SelectItem>
                    <SelectItem value="baba">Baba</SelectItem>
                    <SelectItem value="es">Eş</SelectItem>
                    <SelectItem value="kardes">Kardeş</SelectItem>
                    <SelectItem value="diger">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                İş Bilgileri ve Pozisyon
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700 font-medium">Departman *</Label>
                <Select 
                  value={formData.department_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Departman seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-gray-700 font-medium">Pozisyon *</Label>
                <Select 
                  value={formData.position_id} 
                  onValueChange={(value) => {
                    const position = positions.find(p => p.id === value)
                    setFormData(prev => ({ 
                      ...prev, 
                      position_id: value,
                      salary: position?.salary_range.split('-')[0] || ''
                    }))
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Pozisyon seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {positions
                      .filter(pos => !formData.department_id || pos.department_id === formData.department_id)
                      .map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title}
                        <span className="text-sm text-gray-500 ml-2">({pos.salary_range} TL)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-gray-700 font-medium">Maaş (TL) *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="50000"
                />
                {formData.position_id && (
                  <p className="text-gray-500 text-sm">
                    Önerilen aralık: {positions.find(p => p.id === formData.position_id)?.salary_range} TL
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date" className="text-gray-700 font-medium">İşe Başlama Tarihi *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_id" className="text-gray-700 font-medium">Çalışan ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Otomatik oluşturulacak..."
              />
              <p className="text-gray-500 text-sm">
                Ad ve soyad girildikten sonra otomatik oluşturulur
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Finansal Bilgiler
              </h3>
              <p className="text-gray-600">Bu bilgiler bordro ve ödeme işlemleri için kullanılacaktır.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id" className="text-gray-700 font-medium">Vergi Kimlik No</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account" className="text-gray-700 font-medium">Banka Hesap Numarası</Label>
              <Input
                id="bank_account"
                value={formData.bank_account}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="TR12 3456 7890 1234 5678 9012 34"
              />
              <p className="text-gray-500 text-sm">
                Maaş ödemelerinin yapılacağı hesap numarası (opsiyonel)
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Form Gönderimi & Son Kontrol
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 font-medium">Ek Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                placeholder="Bu çalışan hakkında özel notlar, önemli bilgiler veya hatırlatmalar..."
                rows={4}
              />
            </div>

            {/* Employee Form Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Çalışan Formu Durumu
              </h4>
              
              {!formSent ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Çalışan bilgileri hazır. Form gönderilsin mi?
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={sendEmployeeForm}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Form Gönder
                    </Button>
                    <span className="text-gray-600 text-sm">
                      {formData.email} adresine gönderilecek
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Form başarıyla gönderildi!</span>
                  </div>
                  <p className="text-green-800">
                    {formData.first_name} {formData.last_name} ({formData.email}) adresine form gönderildi.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Formu İzle
                    </Button>
                    <Button
                      onClick={completeApplication}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      İşlemi Tamamla
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Özet Bilgiler
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ad Soyad:</p>
                  <p className="text-gray-900 font-medium">{formData.first_name} {formData.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">E-posta:</p>
                  <p className="text-gray-900 font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Telefon:</p>
                  <p className="text-gray-900 font-medium">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Çalışan ID:</p>
                  <p className="text-gray-900 font-medium">{formData.employee_id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Departman:</p>
                  <p className="text-gray-900 font-medium">
                    {departments.find(d => d.id === formData.department_id)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Pozisyon:</p>
                  <p className="text-gray-900 font-medium">
                    {positions.find(p => p.id === formData.position_id)?.title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Maaş:</p>
                  <p className="text-gray-900 font-medium">{formData.salary} TL</p>
                </div>
                <div>
                  <p className="text-gray-600">İşe Başlama:</p>
                  <p className="text-gray-900 font-medium">{formData.hire_date}</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Subtle animated background */}
      <BackgroundScene />
      
      {/* Left Sidebar - Progress */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col relative z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Yeni Çalışan</h1>
              <p className="text-sm text-gray-600">Adım {currentStep}/5</p>
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="bg-gray-100 rounded-full h-2 mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-blue-600">{Math.round((currentStep / 5) * 100)}% Tamamlandı</span>
          </div>
        </div>
        
        {/* Vertical Step Indicators */}
        <div className="flex-1 p-6 space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                step.id === currentStep 
                  ? 'bg-blue-50 border-l-4 border-blue-600' 
                  : step.id < currentStep 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'bg-gray-50 border-l-4 border-gray-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : step.id < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {step.id < currentStep ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  step.id
                )}
              </motion.div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${
                  step.id === currentStep 
                    ? 'text-blue-700' 
                    : step.id < currentStep 
                    ? 'text-green-700' 
                    : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
              {step.id === currentStep && (
                <ChevronRight className="h-5 w-5 text-blue-600" />
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Auto-save Status */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-blue-700">Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Otomatik kaydedildi</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Content Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              {(() => {
                const IconComponent = steps[currentStep - 1].icon
                return <IconComponent className="h-6 w-6 text-blue-600" />
              })()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{steps[currentStep - 1].title}</h2>
              <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
            <Button
              onClick={saveProgress}
              variant="outline"
              disabled={!formData.first_name || !formData.email || isSaving}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>

            {currentStep < 5 && (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                İleri
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 