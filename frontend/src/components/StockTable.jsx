import React, { useState, useMemo } from 'react'

const BUCKETS = ['All', 'Nifty 50', 'Nifty Next 50', 'Nifty Midcap', 'Nifty Smallcap']

export default function StockTable({ stocks, loading, starred, onToggleStar }) {
  const [bucket, setBucket] = useState('All')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('symbol')
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const starMap = useMemo(() => {
    const m = {}
    starred.forEach((s, i) => { m[s] = i + 1 })
    return m
  }, [starred])

  const favouriteStocks = useMemo(() => {
    const stockMap = {}
    stocks.forEach((s) => { stockMap[s.symbol] = s })
    return starred.map((sym) => stockMap[sym]).filter(Boolean)
  }, [stocks, starred])

  const filtered = useMemo(() => {
    let list = stocks.filter((s) => !starMap[s.symbol])
    if (bucket !== 'All') {
      list = list.filter((s) => s.bucket === bucket)
    }
    if (search) {
      const q = search.toUpperCase()
      list = list.filter(
        (s) => s.symbol?.toUpperCase().includes(q) || s.name?.toUpperCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let va = a[sortKey]
      let vb = b[sortKey]
      if (va == null) va = sortDir === 'asc' ? Infinity : -Infinity
      if (vb == null) vb = sortDir === 'asc' ? Infinity : -Infinity
      if (typeof va === 'string') {
        const cmp = va.localeCompare(vb)
        return sortDir === 'asc' ? cmp : -cmp
      }
      return sortDir === 'asc' ? va - vb : vb - va
    })
    return list
  }, [stocks, bucket, search, sortKey, sortDir, starMap])

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="ml-1 opacity-30">&#8597;</span>
    return <span className="ml-1">{sortDir === 'asc' ? '&#8593;' : '&#8595;'}</span>
  }

  const thClass =
    'px-3 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap'
  const tdClass = 'px-3 py-2.5 text-sm whitespace-nowrap border-t'

  const StarCell = ({ sym }) => (
    <td
      className={`${tdClass} text-center cursor-pointer`}
      style={{ width: 36 }}
      onClick={() => onToggleStar(sym)}
      title={starMap[sym] ? 'Remove from favourites' : 'Add to favourites'}
    >
      <span style={{ color: starMap[sym] ? '#f59e0b' : 'var(--text-secondary)', fontSize: 18 }}>
        {starMap[sym] ? '\u2605' : '\u2606'}
      </span>
    </td>
  )

  const renderRow = (s, i, isFav) => (
    <tr
      key={s.symbol}
      className="transition-colors"
      style={{
        backgroundColor: isFav
          ? 'color-mix(in srgb, var(--positive) 8%, var(--card))'
          : i % 2 === 0
            ? 'var(--card)'
            : 'var(--hover)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <StarCell sym={s.symbol} />
      <td className={tdClass} style={{ fontWeight: 600 }} title={s.name || s.symbol}>{s.symbol}</td>
      <td className={tdClass} style={{ color: 'var(--text-secondary)' }}>
        <span
          className="inline-block px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: bucketColor(s.bucket), color: 'white' }}
        >
          {s.bucket}
        </span>
      </td>
      <td className={tdClass} style={{ fontWeight: 600 }}>{fmt(s.currentPrice)}</td>
      <td className={tdClass}>{s.faceValue != null ? fmtInt(s.faceValue) : '--'}</td>
      <td className={tdClass} style={{ color: 'var(--positive)' }}>{fmt(s.dayHigh)}</td>
      <td className={tdClass} style={{ color: 'var(--negative)' }}>{fmt(s.dayLow)}</td>
      <td className={tdClass}>{fmt(s.week52High)}</td>
      <td className={tdClass}>{fmt(s.week52Low)}</td>
      <td className={tdClass}>{fmt(s.eps)}</td>
      <td className={tdClass}>{s.dividendYield != null ? `${s.dividendYield}%` : '--'}</td>
      <td className={tdClass}>{fmt(s.peRatio)}</td>
      <td className={tdClass}>{fmt(s.pbRatio)}</td>
    </tr>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          {BUCKETS.map((b) => (
            <button
              key={b}
              onClick={() => setBucket(b)}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: bucket === b ? 'var(--positive)' : 'var(--card)',
                color: bucket === b ? 'white' : 'var(--text)',
                borderRight: '1px solid var(--border)',
              }}
            >
              {b}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-1.5 rounded-lg border text-sm flex-1 min-w-[200px] outline-none"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {favouriteStocks.length > 0 && (
          <div
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--positive) 10%, var(--card))',
              borderBottom: '1px solid var(--border)',
              color: 'var(--positive)',
            }}
          >
            &#9733; Favourites ({favouriteStocks.length}/3)
          </div>
        )}
        <table className="w-full min-w-[1020px]">
          <thead
            style={{
              backgroundColor: 'var(--card)',
              borderBottom: '2px solid var(--border)',
            }}
          >
            <tr>
              <th className={`${thClass} text-center`} style={{ width: 36 }}>&#9733;</th>
              <th className={thClass} onClick={() => handleSort('symbol')}>
                Symbol <SortIcon col="symbol" />
              </th>
              <th className={thClass} onClick={() => handleSort('bucket')}>
                Index <SortIcon col="bucket" />
              </th>
              <th className={thClass} onClick={() => handleSort('currentPrice')}>
                Price <SortIcon col="currentPrice" />
              </th>
              <th className={thClass} onClick={() => handleSort('faceValue')}>
                Face Value <SortIcon col="faceValue" />
              </th>
              <th className={thClass} onClick={() => handleSort('dayHigh')}>
                Day High <SortIcon col="dayHigh" />
              </th>
              <th className={thClass} onClick={() => handleSort('dayLow')}>
                Day Low <SortIcon col="dayLow" />
              </th>
              <th className={thClass} onClick={() => handleSort('week52High')}>
                52W High <SortIcon col="week52High" />
              </th>
              <th className={thClass} onClick={() => handleSort('week52Low')}>
                52W Low <SortIcon col="week52Low" />
              </th>
              <th className={thClass} onClick={() => handleSort('eps')}>
                EPS <SortIcon col="eps" />
              </th>
              <th className={thClass} onClick={() => handleSort('dividendYield')}>
                Div% <SortIcon col="dividendYield" />
              </th>
              <th className={thClass} onClick={() => handleSort('peRatio')}>
                P/E <SortIcon col="peRatio" />
              </th>
              <th className={thClass} onClick={() => handleSort('pbRatio')}>
                P/B <SortIcon col="pbRatio" />
              </th>
            </tr>
          </thead>
          <tbody>
            {favouriteStocks.map((s) => renderRow(s, 0, true))}
            {favouriteStocks.length > 0 && (
              <tr>
                <td
                  colSpan={13}
                  style={{
                    padding: '4px 16px',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--card)',
                    borderBottom: '2px solid var(--border)',
                    fontStyle: 'italic',
                  }}
                >
                  &#8212; All Stocks &#8212;
                </td>
              </tr>
            )}
            {loading ? (
              <tr>
                <td colSpan={13} className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  Loading stock data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  No stocks found.
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => renderRow(s, i, false))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function fmt(v) {
  if (v == null) return '--'
  return Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtInt(v) {
  if (v == null) return '--'
  return Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function bucketColor(b) {
  switch (b) {
    case 'Nifty 50': return '#2563eb'
    case 'Nifty Next 50': return '#7c3aed'
    case 'Nifty Midcap': return '#d97706'
    case 'Nifty Smallcap': return '#059669'
    default: return '#64748b'
  }
}
