"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
  defaultOpen?: boolean
}

const Select = ({ children, value, onValueChange, disabled, defaultOpen = false }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  
  const onOpenChange = React.useCallback((newOpen: boolean) => {
    if (!disabled) {
      setOpen(newOpen)
    }
  }, [disabled])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSelectContext()
    
    return (
      <button
        ref={ref}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        onClick={() => onOpenChange(!open)}
        {...props}
      >
        {children}
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelectContext()
  const [selectedLabel, setSelectedLabel] = React.useState<string>("")
  
  React.useEffect(() => {
    // Find the selected item's label from context
    const selectElement = document.querySelector(`[data-select-value="${value}"]`)
    if (selectElement) {
      setSelectedLabel(selectElement.textContent || "")
    } else {
      setSelectedLabel("")
    }
  }, [value])

  if (value && selectedLabel) {
    return <span className="text-gray-900">{selectedLabel}</span>
  }
  
  return <span className="text-gray-500">{placeholder}</span>
}

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const { open, onOpenChange } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscapeKey)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscapeKey)
      }
    }
  }, [open, onOpenChange])

  // Kesinlikle açık değilse null döndür
  if (open !== true) return null

  return (
    <div 
      ref={contentRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-900 shadow-lg"
      style={{ display: open ? 'block' : 'none' }}
    >
      {children}
    </div>
  )
}

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { onValueChange, onOpenChange, value: selectedValue } = useSelectContext()
  const isSelected = selectedValue === value

  return (
    <div 
      data-select-value={value}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-900'
      }`}
      onClick={() => {
        onValueChange?.(value)
        onOpenChange(false)
      }}
    >
      {children}
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } 