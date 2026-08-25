'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function toast({ type, title, message }: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-toast-in rounded-sm shadow-md border p-4 transition-all duration-300 flex items-start justify-between gap-3
              ${t.type === 'success' ? 'bg-white border-emerald-300 text-emerald-950' : ''}
              ${t.type === 'error' ? 'bg-white border-red-300 text-red-950' : ''}
              ${t.type === 'info' ? 'bg-white border-walnut-200 text-walnut-900' : ''}
            `}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">
                {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider">{t.title}</h4>
                {t.message && (
                  <p className="text-xs text-walnut-600 mt-1 leading-relaxed">{t.message}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-walnut-400 hover:text-walnut-700 active:scale-95 transition-transform text-xs shrink-0 p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
