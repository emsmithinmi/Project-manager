import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function WaitingModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) return
    setSaving(true)
    await onConfirm(reason.trim())
    setReason('')
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="There is a Holdup"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm} disabled={!reason.trim() || saving}>
            {saving ? 'Setting…' : 'Set Waiting'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm" style={{ color: '#6c7086' }}>
          What's blocking this task? This will be recorded as a comment and the task
          (and its project, if any) will be moved to Waiting.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Describe the blocker…"
          rows={3}
          autoFocus
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
          style={{ backgroundColor: '#1e1e2e', borderColor: '#313244', color: '#cdd6f4' }}
          onFocus={e => e.target.style.borderColor = '#89b4fa'}
          onBlur={e => e.target.style.borderColor = '#313244'}
        />
      </div>
    </Modal>
  )
}
