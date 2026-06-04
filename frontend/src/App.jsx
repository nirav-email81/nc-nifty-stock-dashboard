import React, { useState, useEffect, useCallback, useRef } from 'react'
import IndexCards from './components/IndexCards'
import StockTable from './components/StockTable'
import { fetchIndices, fetchStocks } from './api'

const POLL_INTERVAL = 600000

export default function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })
  const [indices, setIndices] = useState({})
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [nextIn, setNextIn] = useState(600)
  const [clock, setClock] = useState(new Date())
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nc_starred') || '[]') }
    catch { return [] }
  })
  const timerRef = useRef(null)

  const toggleStar = (symbol) => {
    setStarred((prev) => {
      let next
      if (prev.includes(symbol)) {
        next = prev.filter((s) => s !== symbol)
      } else {
        next = prev.length >= 3 ? [...prev.slice(1), symbol] : [...prev, symbol]
      }
      localStorage.setItem('nc_starred', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const loadData = useCallback(async () => {
    try {
      setError('')
      const [idx, stk] = await Promise.all([fetchIndices(), fetchStocks()])
      setIndices(idx)
      setStocks(stk)
      setLastRefresh(new Date())
      setNextIn(600)
    } catch (e) {
      setError('Failed to load data. Is the backend running on port 5000?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    timerRef.current = setInterval(loadData, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [loadData])

  useEffect(() => {
    const interval = setInterval(() => {
      setNextIn((n) => Math.max(0, n - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">NC Nifty Stock Dashboard</h1>
            <div className="flex gap-4" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span>Updated: {lastRefresh.toLocaleTimeString('en-IN')}</span>
              <span>Next: {formatTime(nextIn)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {clock.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
              {clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
            {error && (
              <span className="text-sm" style={{ color: 'var(--negative)' }}>{error}</span>
            )}
            <button
              onClick={() => setDark((d) => !d)}
              className="px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              title="Toggle dark mode"
            >
              {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
            </button>
          </div>
        </div>

        <IndexCards indices={indices} />

        <StockTable stocks={stocks} loading={loading} starred={starred} onToggleStar={toggleStar} />

        <footer className="mt-8 pt-6 border-t text-center text-xs leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <p>Built using opencode with free-to-use AI Model &quot;Big Pickle&quot; which is available through the OpenCode Zen platform.</p>
          <p className="mt-1">React 18, Vite 5, Tailwind CSS 4, Python Flask 3, yfinance, NSE India APIs.</p>
        </footer>
      </div>
    </div>
  )
}
