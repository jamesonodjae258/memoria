'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

interface FuneralHomeProfile {
  id: string
  name: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  subscription_tier: string
  trial_ends_at: string | null
  onboarding_step: number
}

interface StaffMember {
  id: string
  full_name: string
  email?: string
  role: string
  created_at: string
  is_current_user?: boolean
}

interface StaffInvitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
}

export default function DirectorSettingsPage() {
  const [profile, setProfile] = useState<FuneralHomeProfile | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('director')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [invitations, setInvitations] = useState<StaffInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Facility Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [zip, setZip] = useState('')
  const [isSavingFacility, setIsSavingFacility] = useState(false)
  const [facilityMessage, setFacilityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Invite Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [profileRes, teamRes] = await Promise.all([
          fetch('/api/funeral-home/profile'),
          fetch('/api/funeral-home/team'),
        ])

        if (profileRes.ok) {
          const pData = await profileRes.json()
          if (pData.funeralHome) {
            setProfile(pData.funeralHome)
            setName(pData.funeralHome.name || '')
            setPhone(pData.funeralHome.phone || '')
            setAddress(pData.funeralHome.address || '')
            setCity(pData.funeralHome.city || '')
            setStateCode(pData.funeralHome.state || '')
            setZip(pData.funeralHome.zip || '')
          }
          if (pData.profile?.role) {
            setCurrentUserRole(pData.profile.role)
          }
        }

        if (teamRes.ok) {
          const tData = await teamRes.json()
          setStaffList(tData.staff || [])
          setInvitations(tData.invitations || [])
        }
      } catch (err) {
        console.error('Error loading settings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingFacility(true)
    setFacilityMessage(null)

    try {
      const res = await fetch('/api/funeral-home/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          city,
          state: stateCode,
          zip,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update facility details')
      }

      setFacilityMessage({ type: 'success', text: 'Facility profile updated successfully.' })
    } catch (err: any) {
      setFacilityMessage({ type: 'error', text: err.message || 'Error saving facility details' })
    } finally {
      setIsSavingFacility(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsSendingInvite(true)
    setInviteError(null)

    try {
      const res = await fetch('/api/funeral-home/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send team invitation')
      }

      if (data.invitation) {
        setInvitations((prev) => [data.invitation, ...prev])
      }

      setInviteEmail('')
      setIsInviteModalOpen(false)
    } catch (err: any) {
      setInviteError(err.message || 'Could not send invitation')
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/funeral-home/team?invite_id=${inviteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== inviteId))
      }
    } catch (err) {
      console.error('Failed to revoke invite:', err)
    }
  }

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member from your funeral home portal?')) {
      return
    }
    try {
      const res = await fetch(`/api/funeral-home/team?staff_id=${staffId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== staffId))
      }
    } catch (err) {
      console.error('Failed to remove staff:', err)
    }
  }

  const isDirector = currentUserRole === 'owner' || currentUserRole === 'director'

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col selection:bg-[#A8935D] selection:text-white">
      <DashboardHeader
        funeralHomeName={profile?.name || 'Memoria Memorial Home'}
        staffName={isDirector ? 'Funeral Director' : 'Staff Member'}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8C7E6E] mb-1">
              <Link href="/dashboard" className="hover:text-[#2C221E] transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#2C221E] font-semibold">Settings</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#2C221E] tracking-tight">
              Director Settings &amp; Team Management
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E50] mt-1">
              Manage funeral home facility details, staff roles, operating jurisdictions, and software subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/settings/states"
              className="btn-secondary text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-10 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Operating States</span>
            </Link>

            {isDirector && (
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="btn-primary text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-10 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>+ Invite Staff Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Overview Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Subscription & Trial */}
          <div className="card-premium p-6 relative flex flex-col justify-between">
            <div className="brass-inlay absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8935D] block mb-1">
                Account Status
              </span>
              <h3 className="font-display text-lg font-semibold text-[#2C221E]">
                30-Day Pro Trial Active
              </h3>
              <p className="text-xs text-[#6B5E50] mt-1.5 leading-relaxed">
                Full enterprise access to AI obituaries, state filings, and unlimited staff seats.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E2DC] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#346538] bg-[#EDF3EC] px-2.5 py-1 rounded">
                ✓ Full Access
              </span>
              <span className="text-xs text-[#8C7E6E]">Zero Fees in Trial</span>
            </div>
          </div>

          {/* Card 2: Operating States */}
          <div className="card-premium p-6 relative flex flex-col justify-between">
            <div className="brass-inlay absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8935D] block mb-1">
                Regulatory Jurisdiction
              </span>
              <h3 className="font-display text-lg font-semibold text-[#2C221E]">
                State Licenses &amp; Filings
              </h3>
              <p className="text-xs text-[#6B5E50] mt-1.5 leading-relaxed">
                Configure primary licensing and ancillary states for automatic PDF compliance pre-filling.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E2DC]">
              <Link
                href="/dashboard/settings/states"
                className="text-xs font-semibold text-[#A8935D] hover:underline"
              >
                Configure Operating States
              </Link>
            </div>
          </div>

          {/* Card 3: Team Roster Summary */}
          <div className="card-premium p-6 relative flex flex-col justify-between">
            <div className="brass-inlay absolute top-0 left-0 right-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8935D] block mb-1">
                Team Roster
              </span>
              <h3 className="font-display text-lg font-semibold text-[#2C221E]">
                {staffList.length} Active Staff Member{staffList.length === 1 ? '' : 's'}
              </h3>
              <p className="text-xs text-[#6B5E50] mt-1.5 leading-relaxed">
                {invitations.length} pending email invitation{invitations.length === 1 ? '' : 's'} awaiting confirmation.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E2DC] flex items-center justify-between">
              <span className="text-xs text-[#8C7E6E]">Role-Based Access</span>
              {isDirector && (
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="text-xs font-semibold text-[#2C221E] hover:text-[#A8935D] transition-colors"
                >
                  + Add Member
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Facility Profile Settings */}
        <div className="card-premium p-6 sm:p-8 relative">
          <div className="brass-inlay absolute top-0 left-0 right-0" />
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-[#2C221E]">
              Funeral Home Facility Profile
            </h2>
            <p className="text-xs text-[#6B5E50] mt-1">
              Information displayed on official state compliance worksheets, family dispatch notices, and death records.
            </p>
          </div>

          {facilityMessage && (
            <div
              className={`p-3.5 text-xs rounded border-l-4 mb-6 ${
                facilityMessage.type === 'success'
                  ? 'bg-[#EDF3EC] border-[#346538] text-[#346538]'
                  : 'bg-[#FDEBEC] border-[#9F2F2D] text-[#9F2F2D]'
              }`}
            >
              {facilityMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveFacility} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="field-label">Funeral Home / Chapel Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isDirector || isSavingFacility}
                  required
                  placeholder="Grace & Peace Chapel"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="field-label">Primary Office Telephone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isDirector || isSavingFacility}
                  placeholder="(555) 234-5678"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isDirector || isSavingFacility}
                placeholder="100 Memorial Way"
                className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="field-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isDirector || isSavingFacility}
                  placeholder="Austin"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="field-label">State</label>
                <input
                  type="text"
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  disabled={!isDirector || isSavingFacility}
                  placeholder="TX"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] uppercase text-center focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="field-label">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  disabled={!isDirector || isSavingFacility}
                  placeholder="78701"
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {isDirector && (
              <div className="pt-4 border-t border-[#E5E2DC] flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingFacility}
                  className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-6 py-2.5 shadow-sm"
                >
                  {isSavingFacility ? 'Saving Changes…' : 'Save Facility Details'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Section 2: Team Roster & Invitations */}
        <div className="card-premium p-6 sm:p-8 relative">
          <div className="brass-inlay absolute top-0 left-0 right-0" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#2C221E]">
                Staff Members &amp; Permissions
              </h2>
              <p className="text-xs text-[#6B5E50] mt-1">
                Colleagues who have access to case files, obituary generation, and state compliance worksheets.
              </p>
            </div>

            {isDirector && (
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="btn-primary text-xs font-semibold uppercase tracking-wider px-4 py-2 whitespace-nowrap shrink-0"
              >
                + Invite Staff
              </button>
            )}
          </div>

          {/* Active Staff Table */}
          <div className="border border-[#E5E2DC] rounded overflow-hidden mb-8">
            <div className="bg-[#FAF9F7] px-4 py-2.5 border-b border-[#E5E2DC] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2C221E] uppercase tracking-wider">
                Active Staff ({staffList.length})
              </span>
            </div>

            {staffList.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8C7E6E]">
                No staff profiles found.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E2DC]">
                {staffList.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#2C221E] text-[#D4C596] flex items-center justify-center font-display text-xs font-bold shrink-0">
                        {member.full_name ? member.full_name[0].toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#2C221E]">
                            {member.full_name}
                          </span>
                          {member.is_current_user && (
                            <span className="text-[10px] bg-[#EFECE6] text-[#6B5E50] px-2 py-0.5 rounded font-mono font-medium">
                              You
                            </span>
                          )}
                        </div>
                        {member.email && (
                          <span className="text-[11px] text-[#8C7E6E] block">{member.email}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded font-mono ${
                          member.role === 'owner' || member.role === 'director'
                            ? 'bg-[#FBF3DB] text-[#956400]'
                            : member.role === 'arranger'
                            ? 'bg-[#EBF5FB] text-[#2980B9]'
                            : 'bg-[#FAF9F7] border border-[#E5E2DC] text-[#6B5E50]'
                        }`}
                      >
                        {member.role}
                      </span>

                      {isDirector && !member.is_current_user && member.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(member.id)}
                          className="text-xs text-[#9F2F2D] hover:underline px-2 py-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="border border-[#E5E2DC] rounded overflow-hidden">
              <div className="bg-[#FAF9F7] px-4 py-2.5 border-b border-[#E5E2DC] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2C221E] uppercase tracking-wider">
                  Pending Invitations ({invitations.length})
                </span>
                <span className="text-[11px] text-[#8C7E6E]">Awaiting user registration</span>
              </div>

              <div className="divide-y divide-[#E5E2DC]">
                {invitations.map((invite) => (
                  <div key={invite.id} className="p-4 flex items-center justify-between gap-4 bg-white">
                    <div>
                      <span className="text-xs font-semibold text-[#2C221E] block">
                        {invite.email}
                      </span>
                      <span className="text-[11px] text-[#8C7E6E]">
                        Invited as {invite.role} on{' '}
                        {new Date(invite.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono uppercase bg-[#FAF9F7] border border-[#E5E2DC] text-[#8C7E6E] px-2 py-0.5 rounded">
                        Pending
                      </span>

                      {isDirector && (
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="text-xs text-[#9F2F2D] hover:underline px-2 py-1"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E2DC] shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="brass-inlay absolute top-0 left-0 right-0" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#2C221E]">
                  Invite Staff Member
                </h3>
                <p className="text-xs text-[#6B5E50] mt-0.5">
                  Send an email invitation to join your funeral home workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#8C7E6E] hover:text-[#2C221E] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3 bg-[#FDEBEC] border-l-2 border-[#9F2F2D] text-[#9F2F2D] text-xs rounded mb-4">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourchapel.com"
                  required
                  disabled={isSendingInvite}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="field-label">Staff Role &amp; Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={isSendingInvite}
                  className="w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:bg-white focus:border-[#A8935D] focus:outline-none transition-colors"
                >
                  <option value="director">Funeral Director (Full Access &amp; Case Signing)</option>
                  <option value="arranger">Arranger / Family Coordinator (Intakes &amp; Obituaries)</option>
                  <option value="staff">Administrative Staff (General Access)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#E5E2DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  disabled={isSendingInvite}
                  className="btn-secondary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-5 py-2 shadow-sm"
                >
                  {isSendingInvite ? 'Sending Invite…' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
