import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskRow    from '../components/tasks/TaskRow'
import TaskDetail from '../components/tasks/TaskDetail'
import Button     from '../components/ui/Button'
import { CaptureTaskModal } from '../components/daily/QuickCaptureModals'

const TABS = [
  { key: 'all',         label: 'All Active'   },
  { key: 'inbox',       label: 'Inbox'        },
  { key: 'next_action', label: 'Next Actions' },
  { key: 'queued',      label: 'Queued'       },
  { key: 'waiting',     label: 'Waiting'      },
  { key: 'scheduled',   label: 'Scheduled'    },
  { key: 'someday',     label: 'Someday'      },
  { key: 'done',        label: 'Done'         },
]

// "All Active" = all statuses except done
const ALL_ACTIVE = ['inbox', 'next_action', 'queued', 'scheduled', 'waiting', 'someday']

export default function Tasks() {
  const [activeTab,    setActiveTab]    = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCapture,  setShowCapture]  = useState(false)

  const filters = activeTab === 'all'
    ? {}  // we filter client-side for "all active"
    : { status: activeTab }

  const { tasks, loading, refresh, createTask } = useTasks(filters)

  const displayed = activeTab === 'all'
    ? tasks.filter(t => ALL_ACTIVE.includes(t.status))
    : tasks

  const handleCapture = async (title) => {
    await createTask(title)
    setActiveTab('inbox')
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: '#313244' }}
      >
        <h1 className="text-xl font-semibold" style={{ color: '#cdd6f4' }}>Tasks</h1>
        <Button size="sm" variant="primary" onClick={() => setShowCapture(true)}>
          + New Task
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex gap-1 px-4 py-3 border-b shrink-0 overflow-x-auto"
        style={{ borderColor: '#313244' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0"
            style={{
              backgroundColor: activeTab === tab.key ? '#313244' : 'transparent',
              color: activeTab === tab.key ? '#cdd6f4' : '#6c7086',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: '#6c7086' }}>Loading…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm" style={{ color: '#6c7086' }}>
              No {TABS.find(t => t.key === activeTab)?.label.toLowerCase()} tasks.
            </p>
            {activeTab === 'inbox' && (
              <Button size="sm" variant="secondary" onClick={() => setShowCapture(true)}>
                Capture something
              </Button>
            )}
          </div>
        ) : (
          <div
            className="rounded-none border-0"
            style={{ backgroundColor: '#181825' }}
          >
            {displayed.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Task detail modal ── */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onRefresh={() => {
            refresh()
            setSelectedTask(null)
          }}
        />
      )}

      {/* ── Capture modal ── */}
      <CaptureTaskModal
        open={showCapture}
        onClose={() => setShowCapture(false)}
        onCreate={handleCapture}
      />
    </div>
  )
}
