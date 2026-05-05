'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface VisualToggleProps<T extends string> {
  options: Record<T, { label: string; icon?: React.ReactNode; description?: string }>
  value: T
  onChange: (value: T) => void
  name: string // for form submission
}

export function VisualToggle<T extends string>({ options, value, onChange, name }: VisualToggleProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <input type="hidden" name={name} value={value} />
      {Object.entries(options).map(([key, opt]: [string, any]) => {
        const isSelected = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as T)}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group",
              isSelected 
                ? "border-blue-600 bg-blue-50 shadow-md ring-4 ring-blue-50" 
                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
            )}>
              {opt.icon}
            </div>
            <div className="flex-1 pr-6">
              <p className={cn(
                "font-bold text-sm",
                isSelected ? "text-blue-900" : "text-gray-900"
              )}>
                {opt.label}
              </p>
              {opt.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              )}
            </div>
            {isSelected && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 animate-in zoom-in duration-300">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface ChipToggleProps<T extends string> {
  options: Record<T, string>
  value: T
  onChange: (value: T) => void
  name: string
}

export function ChipToggle<T extends string>({ options, value, onChange, name }: ChipToggleProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={value} />
      {Object.entries(options).map(([key, label]: [string, any]) => {
        const isSelected = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as T)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 border-2",
              isSelected
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
