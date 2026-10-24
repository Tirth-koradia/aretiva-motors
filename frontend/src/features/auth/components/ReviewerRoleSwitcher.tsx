import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../api/authApi'
import { saveSession } from '../session'

export function ReviewerRoleSwitcher({
  currentRole,
}: {
  currentRole: 'customer' | 'admin'
}) {
  const [isSwitching, setIsSwitching] = useState(false)
  const navigate = useNavigate()

  const handleSwitch = async () => {
    setIsSwitching(true)
    try {
      if (currentRole === 'customer') {
        const session = await login({
          email: 'admin@aretiva.com',
          password: 'ChangeMe123!',
        })
        saveSession(session)
        navigate('/admin/inventory')
      } else {
        const session = await login({
          email: 'tirth.koradia@example.com',
          password: 'Customer1234!',
        })
        saveSession(session)
        navigate('/showroom')
      }
    } catch {
      // Proceed on error
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
      disabled={isSwitching}
      onClick={handleSwitch}
      title="Reviewer tool: fast demo role switcher"
      type="button"
    >
      <span className="text-[10px] text-amber-700/80 uppercase tracking-wider">
        Reviewer:
      </span>
      <span>
        {isSwitching
          ? 'Switching…'
          : currentRole === 'customer'
            ? 'Switch to Admin ⇄'
            : 'Switch to Customer ⇄'}
      </span>
    </button>
  )
}
