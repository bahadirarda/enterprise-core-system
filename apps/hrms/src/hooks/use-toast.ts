import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: []
}

let state = initialState
let listeners: Array<(state: ToastState) => void> = []

function dispatch(action: { type: string; payload?: any }) {
  switch (action.type) {
    case 'ADD_TOAST':
      state = {
        ...state,
        toasts: [...state.toasts, action.payload]
      }
      break
    case 'REMOVE_TOAST':
      state = {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      }
      break
    case 'CLEAR_TOASTS':
      state = {
        ...state,
        toasts: []
      }
      break
  }
  
  listeners.forEach(listener => listener(state))
}

export function useToast() {
  const [toastState, setToastState] = useState(state)

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000
  }: {
    title: string
    description?: string
    variant?: 'default' | 'destructive'
    duration?: number
  }) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id,
        title,
        description,
        variant,
        duration
      }
    })

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch({
          type: 'REMOVE_TOAST',
          payload: id
        })
      }, duration)
    }

    return id
  }, [])

  const dismiss = useCallback((toastId: string) => {
    dispatch({
      type: 'REMOVE_TOAST',
      payload: toastId
    })
  }, [])

  return {
    toast,
    dismiss,
    toasts: toastState.toasts
  }
} 