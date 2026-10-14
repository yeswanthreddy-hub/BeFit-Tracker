import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import SettingsSection from './SettingsSection'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../hooks/useSettings'
import { useNotifications } from '../../hooks/useNotifications'
import {
  applyImport,
  clearFitnessData,
  createExportPayload,
  deleteAllLocalData,
  downloadJson,
  exportFileName,
  parseImportPayload,
} from '../../utils/dataExport'

/**
 * Data management: export, import, clear fitness history and delete everything.
 *
 * BeFit lives entirely in this browser, so this section is the athlete's backup
 * and reset control. Destructive actions always confirm first, and an import
 * only ever writes the incoming fitness records to the current account.
 */
function DataManagement() {
  const { user, refresh, logout } = useAuth()
  const { updateSettings } = useSettings()
  const { notify } = useNotifications()
  const navigate = useNavigate()

  const fileRef = useRef(null)
  const [confirm, setConfirm] = useState(null) // 'import' | 'clear' | 'delete' | null
  const [pendingImport, setPendingImport] = useState(null)
  const [busy, setBusy] = useState(false)

  function closeConfirm() {
    if (busy) return
    setConfirm(null)
    setPendingImport(null)
  }

  function handleExport() {
    try {
      const now = new Date()
      const payload = createExportPayload(user, user?.id, now)
      downloadJson(payload, exportFileName(now))
      notify({ tone: 'success', title: 'Data exported', message: 'Data exported successfully.' })
    } catch {
      notify({ tone: 'error', title: 'Export failed', message: 'We could not export your data.' })
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    let result
    try {
      result = parseImportPayload(await file.text())
    } catch {
      notify({ tone: 'error', title: 'Import failed', message: 'We could not read that file. Please try again.' })
      return
    }

    if (!result.ok) {
      notify({ tone: 'error', title: 'Invalid file', message: result.message })
      return
    }

    setPendingImport(result.payload)
    setConfirm('import')
  }

  function handleConfirm() {
    if (busy) return
    setBusy(true)

    try {
      if (confirm === 'import' && pendingImport) {
        const written = applyImport(user?.id, user, pendingImport)
        if (pendingImport.settings) updateSettings(pendingImport.settings)
        refresh()
        notify({
          tone: 'success',
          title: 'Data imported',
          message: written > 0 ? 'Your BeFit data was imported successfully.' : 'Nothing to import.',
        })
      } else if (confirm === 'clear') {
        clearFitnessData(user?.id)
        notify({
          tone: 'success',
          title: 'Fitness data cleared',
          message: 'Your workout, nutrition and progress history was removed.',
        })
      } else if (confirm === 'delete') {
        deleteAllLocalData()
        logout()
        navigate('/login', { replace: true })
        return
      }
    } catch {
      notify({ tone: 'error', title: 'Import failed', message: 'Something went wrong. Please try again.' })
    }

    setBusy(false)
    setConfirm(null)
    setPendingImport(null)
  }

  return (
    <SettingsSection
      id="data"
      eyebrow="Data Management"
      title="Your BeFit Data"
      description="Back up, restore or remove the fitness data BeFit keeps in this browser."
    >
      <div className="settings-data">
        <article className="settings-data__card card">
          <h3 className="settings-data__title">Export My Data</h3>
          <p className="settings-data__text">
            Download a JSON file with your profile, settings, workouts, nutrition, progress and AI
            insight history. Your password and any API keys are never included.
          </p>
          <Button variant="secondary" onClick={handleExport}>
            Export My Data
          </Button>
        </article>

        <article className="settings-data__card card">
          <h3 className="settings-data__title">Import My Data</h3>
          <p className="settings-data__text">
            Restore from a BeFit export file. Importing replaces your current fitness data — you'll
            be asked to confirm first.
          </p>
          <input
            ref={fileRef}
            id="settings-import-file"
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import My Data
          </Button>
        </article>

        <article className="settings-data__card card">
          <h3 className="settings-data__title">Clear Fitness Data</h3>
          <p className="settings-data__text">
            Remove your completed workouts, food logs, custom workouts, progress and AI insight
            history. Your account, profile and settings are kept.
          </p>
          <Button variant="secondary" onClick={() => setConfirm('clear')}>
            Clear Fitness Data
          </Button>
        </article>

        <article className="settings-data__card card settings-data__card--danger">
          <h3 className="settings-data__title">Delete All Local Data</h3>
          <p className="settings-data__text">
            Permanently remove your BeFit local account, profile, workouts, nutrition history,
            progress and settings from this browser. This cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setConfirm('delete')}>
            Delete All Local Data
          </Button>
        </article>
      </div>

      <ConfirmDialog
        open={confirm === 'import'}
        title="Import BeFit data?"
        description="Importing this file will replace your current BeFit data. Continue?"
        confirmLabel="Import Data"
        busyLabel="Importing…"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      <ConfirmDialog
        open={confirm === 'clear'}
        title="Clear fitness data?"
        description="This removes your completed workouts, food logs, custom workouts, progress and AI insight history. Your account and settings remain."
        confirmLabel="Clear Fitness Data"
        busyLabel="Clearing…"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete all local data?"
        description="This will permanently remove your BeFit local account, profile, workouts, nutrition history, progress and settings from this browser. This action cannot be undone. Are you sure?"
        confirmLabel="Delete Everything"
        busyLabel="Deleting…"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </SettingsSection>
  )
}

export default DataManagement
