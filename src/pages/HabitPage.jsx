import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getHabitHistory } from '../lib/api/daily'
import { HABITS } from '../lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDateMap(history) {
  const map = {}
  for (const row of history) map[row.date] = row
  return map
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0…Sun=6
  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d).toISOString().split('T')[0])
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function computeCurrentStreak(dateMap, habitKey) {
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const row = dateMap[dateStr]
    if (!row || !row[habitKey]) break
    streak++
  }
  return streak
}

function computeLongestStreak(history, habitKey) {
  let longest = 0, current = 0
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  let prevDate = null
  for (const row of sorted) {
    if (!row[habitKey]) { current = 0; prevDate = null; continue }
    if (prevDate) {
      const diff = (new Date(row.date) - new Date(prevDate)) / 86400000
      current = diff === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    prevDate = row.date
    if (current > longest) longest = current
  }
  return longest
}

function computePercent(dateMap, habitKey, days) {
  const today = new Date()
  let completed = 0, total = 0
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const row = dateMap[dateStr]
    if (row) { total++; if (row[habitKey]) completed++ }
  }
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

// ─── Components ───────────────────────────────────────────────────────────────

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const TIMEFRAMES = [
  { key: 7,   label: '7 days'  },
  { key: 30,  label: '30 days' },
  { key: 90,  label: '90 days' },
  { key: 365, label: '1 year'  },
]

function HabitCalendar({ habitKey, calYear, calMonth, dateMap, onPrev, onNext }) {
  const grid  = useMemo(() => buildCalendarGrid(calYear, calMonth), [calYear, calMonth])
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: '#181825', borderColor: '#313244' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ color: '#6c7086' }}
          onMouseEnter={e => e.target.style.color = '#cdd6f4'}
          onMouseLeave={e => e.target.style.color = '#6c7086'}
        >
          ← Prev
        </button>
        <h3 className="text-sm font-semibold" style={{ color: '#cdd6f4' }}>
          {MONTHS[calMonth]} {calYear}
        </h3>
        <button
          onClick={onNext}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ color: '#6c7086' }}
          onMouseEnter={e => e.target.style.color = '#cdd6f4'}
          onMouseLeave={e => e.target.style.color = '#6c7086'}
        >
          Next →
        </button>
      </div>

      {/* DOW header */}
      <div className="grid grid-cols-7 mb-2">
        {DOW_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium py-1" style={{ color: '#6c7086' }}>{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((dateStr, idx) => {
          if (!dateStr) return <div key={`empty-${idx}`} />
          const row      = dateMap[dateStr]
          const done     = !!(row && row[habitKey])
          const isToday  = dateStr === today
          const isFuture = dateStr > today
          const dayNum   = parseInt(dateStr.split('-')[2], 10)

          return (
            <div
              key={dateStr}
              className="flex flex-col items-center justify-center rounded-lg py-1.5 gap-0.5"
              style={{
                backgroundColor: isToday ? '#1e3a5f' : 'transparent',
                outline: isToday ? '1px solid #89b4fa' : 'none',
                minHeight: '48px',
              }}
            >
              <span className="text-xs" style={{ color: isToday ? '#89b4fa' : isFuture ? '#45475a' : '#cdd6f4' }}>
                {dayNum}
              </span>
              {!isFuture && row && (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: done ? '#0F9D58' : '#313244' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: '#313244' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0F9D58' }} />
          <span className="text-xs" style={{ color: '#6c7086' }}>Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#313244' }} />
          <span className="text-xs" style={{ color: '#6c7086' }}>Missed</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HabitPage() {
  const { habit: habitKey } = useParams()
  const navigate = useNavigate()

  const habit = HABITS.find(h => h.key === habitKey)

  const today = new Date()
  const [history,   setHistory]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [timeframe, setTimeframe] = useState(30)
  const [calYear,   setCalYear]   = useState(today.getFullYear())
  const [calMonth,  setCalMonth]  = useState(today.getMonth())

  useEffect(() => {
    setLoading(true)
    getHabitHistory(365).then(setHistory).finally(() => setLoading(false))
  }, [])

  const dateMap = useMemo(() => buildDateMap(history), [history])

  const currentStreak = useMemo(() => computeCurrentStreak(dateMap, habitKey), [dateMap, habitKey])
  const longestStreak = useMemo(() => computeLongestStreak(history, habitKey), [history, habitKey])
  const percent       = useMemo(() => computePercent(dateMap, habitKey, timeframe), [dateMap, habitKey, timeframe])

  const barColor = percent >= 70 ? '#0F9D58' : percent >= 40 ? '#FBBC05' : '#DB4437'

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  if (!habit) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm" style={{ color: '#DB4437' }}>Habit not found.</p>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
        style={{ borderColor: '#313244' }}
      >
        <button
          onClick={() => navigate('/habits')}
          className="text-sm transition-opacity hover:opacity-80"
          style={{ color: '#6c7086' }}
        >
          ← Habits
        </button>
        <span style={{ color: '#313244' }}>/</span>
        <span className="text-xl">{habit.icon}</span>
        <span className="text-sm font-medium" style={{ color: '#cdd6f4' }}>{habit.label}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: '#6c7086' }}>Loading…</p>
          </div>
        ) : (
          <>
            {/* Streak stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: '#181825', borderColor: '#313244' }}>
                <p className="text-3xl font-bold" style={{ color: '#89b4fa' }}>{currentStreak}</p>
                <p className="text-xs mt-1" style={{ color: '#6c7086' }}>Current Streak</p>
              </div>
              <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: '#181825', borderColor: '#313244' }}>
                <p className="text-3xl font-bold" style={{ color: '#cba6f7' }}>{longestStreak}</p>
                <p className="text-xs mt-1" style={{ color: '#6c7086' }}>Best Streak</p>
              </div>
              <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: '#181825', borderColor: '#313244' }}>
                <p className="text-3xl font-bold" style={{ color: barColor }}>{percent}%</p>
                <p className="text-xs mt-1" style={{ color: '#6c7086' }}>
                  {TIMEFRAMES.find(t => t.key === timeframe)?.label} completion
                </p>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#6c7086' }}>Timeframe:</span>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: timeframe === tf.key ? '#313244' : 'transparent',
                    color: timeframe === tf.key ? '#cdd6f4' : '#6c7086',
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <HabitCalendar
              habitKey={habitKey}
              calYear={calYear}
              calMonth={calMonth}
              dateMap={dateMap}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />

            <p className="text-xs pb-4" style={{ color: '#45475a' }}>
              Streak = consecutive days completed · Best = longest run ever
            </p>
          </>
        )}
      </div>
    </div>
  )
}
