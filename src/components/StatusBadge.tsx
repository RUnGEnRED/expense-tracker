import { StatusWniosku } from '@prisma/client'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StatusWniosku
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    OCZEKUJACY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ZAAKCEPTOWANY: 'bg-green-100 text-green-800 border-green-200',
    ODRZUCONY: 'bg-red-100 text-red-800 border-red-200',
  }

  const labels = {
    OCZEKUJACY: 'Oczekujący',
    ZAAKCEPTOWANY: 'Zaakceptowany',
    ODRZUCONY: 'Odrzucony',
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      styles[status],
      className
    )}>
      {labels[status]}
    </span>
  )
}
