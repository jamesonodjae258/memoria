import type { CaseStatus } from '@/types'

interface StatusBadgeProps {
  status: CaseStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const badgeStyles: Record<CaseStatus, { label: string; className: string }> = {
    intake: {
      label: 'Intake',
      className: 'bg-[#F2EFEA] text-[#4D4237] border-[#E5E2DC]',
    },
    documents_pending: {
      label: 'Documents Pending',
      className: 'bg-[#FBF3DB] text-[#956400] border-[#D4C596]/60',
    },
    family_review: {
      label: 'Family Review',
      className: 'bg-[#E1F3FE] text-[#1F6C9F] border-[#B9E0FC]',
    },
    approved: {
      label: 'Approved',
      className: 'bg-[#EDF3EC] text-[#346538] border-[#CCE0CB]',
    },
    completed: {
      label: 'Completed',
      className: 'bg-[#2C221E] text-white border-[#1A1310]',
    },
  }

  const current = badgeStyles[status] || badgeStyles.intake

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${current.className}`}
    >
      {current.label}
    </span>
  )
}
