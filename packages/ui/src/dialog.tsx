"use client"

import * as React from "react"

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open: controlledOpen, onOpenChange, children }: DialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogTrigger = ({ children, asChild }: DialogTriggerProps) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within Dialog");
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => context.setOpen(true)
    });
  }
  
  return (
    <button onClick={() => context.setOpen(true)}>
      {children}
    </button>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent = ({ children, className = "" }: DialogContentProps) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");
  
  if (!context.open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => context.setOpen(false)}
      />
      
      {/* Content */}
      <div className={`relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 ${className}`}>
        {children}
      </div>
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DialogHeader = ({ children, className = "" }: DialogHeaderProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogTitle = ({ children, className = "" }: DialogTitleProps) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  );
};

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogDescription = ({ children, className = "" }: DialogDescriptionProps) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} 