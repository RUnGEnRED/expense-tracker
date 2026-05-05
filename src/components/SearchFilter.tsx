'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useTransition, useState, useEffect, useRef } from 'react'
import { STATUS_LABELS } from '@/lib/mappings'
import { cn } from '@/lib/utils'

export function SearchFilter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [isPending, startTransition] = useTransition()
  const isFirstMount = useRef(true)
  
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const currentStatus = searchParams.get('status') || 'ALL'

  // "Clear on refresh" logic - if the user wants it empty on fresh load
  // We check if it's the first mount and if the user specifically asked for this behavior
  // Note: This is unconventional for search but requested by user
  useEffect(() => {
    if (isFirstMount.current && pathname.includes('/pracownik')) {
      // If we are on employee page and it's a fresh mount, we could clear it
      // but let's see if we just want to clear the INPUT or the URL too.
      // The user requested to clear this field.
      // I will clear the URL and the state on fresh mount for employee.
      if (searchParams.get('query')) {
         const params = new URLSearchParams(searchParams)
         params.delete('query')
         setQuery('')
         replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    }
    isFirstMount.current = false
  }, [])

  function handleSearch(term: string, status: string) {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    
    if (status && status !== 'ALL') {
      params.set('status', status)
    } else {
      params.delete('status')
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // Debounced search for query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get('query') || '')) {
        handleSearch(query, currentStatus)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const statusOptions = {
    ALL: 'Wszystkie',
    ...STATUS_LABELS
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 animate-in fade-in duration-500">
      <div className="flex-1 space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Wyszukiwarka</label>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder={pathname.includes('/kierownik') ? "Szukaj po nazwie, opisie lub imieniu pracownika..." : "Szukaj po nazwie lub opisie..."}
            className="pl-12 pr-12 h-14 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/50 text-lg font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); handleSearch('', currentStatus); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isPending && !query && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status wniosku</label>
        <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-2xl border-2 border-gray-100 min-h-[56px] items-center">
          {Object.entries(statusOptions).map(([key, label]) => {
            const isSelected = currentStatus === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSearch(query, key)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200",
                  isSelected
                    ? "bg-white text-blue-600 shadow-md scale-105 ring-1 ring-blue-100"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
