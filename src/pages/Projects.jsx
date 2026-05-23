import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import ProjectRow    from '../components/projects/ProjectRow'
import ProjectDetail from '../components/projects/ProjectDetail'
import Button        from '../components/ui/Button'
import { CaptureProjectModal } from '../components/daily/QuickCaptureModals'

const TABS = [
  { key: 'all',        label: 'All Active'  },
  { key: 'inbox',      label: 'Inbox'       },
  { key: 'planning',   label: 'Planning'    },
  { key: 'in_progress',label: 'In Progress' },
  { key: 'waiting',    label: 'Waiting'     },
  { key: 'stalled',    label: 'Stalled'     },
  { key: 'completed',  label: 'Completed'   },
  { key: 'archived',   label: 'Archived'    },
]

// "All Active" = everything except completed and archived
const ALL_ACTIVE_STATUSES = ['inbox', 'planning', 'in_progress', 'waiting', 'stalled']

export default function Projects() {
  const [activeTab,       setActiveTab]       = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCapture,     setShowCapture]      = useState(false)

  const filters = activeTab === 'all'
    ? {}
    : activeTab === 'archived'
    ? { archived: true }
    : { status: activeTab }

  const { projects, loading, refresh, createProject } = useProjects(filters)

  // Client-side filter for "all active" and archived
  const displayed = activeTab === 'all'
    ? projects.filter(p => ALL_ACTIVE_STATUSES.includes(p.status) && !p.archived_at)
    : activeTab === 'archived'
    ? projects.filter(p => !!p.archived_at)
    : activeTab === 'completed'
    ? projects.filter(p => p.status === 'completed')
    : projects.filter(p => p.status === activeTab && !p.archived_at)

  const handleCapture = async (title) => {
    await createProject(title)
    setActiveTab('inbox')
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: '#313244' }}
      >
        <h1 className="text-xl font-semibold" style={{ color: '#cdd6f4' }}>Projects</h1>
        <Button size="sm" variant="primary" onClick={() => setShowCapture(true)}>
          + New Project
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

      {/* ── Project list ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: '#6c7086' }}>Loading…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm" style={{ color: '#6c7086' }}>
              No {TABS.find(t => t.key === activeTab)?.label.toLowerCase()} projects.
            </p>
            {activeTab === 'inbox' && (
              <Button size="sm" variant="secondary" onClick={() => setShowCapture(true)}>
                Capture something
              </Button>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: '#181825' }}>
            {displayed.map(project => (
              <ProjectRow
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Project detail modal ── */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={refresh}
        />
      )}

      {/* ── Capture modal ── */}
      <CaptureProjectModal
        open={showCapture}
        onClose={() => setShowCapture(false)}
        onCreate={handleCapture}
      />
    </div>
  )
}
