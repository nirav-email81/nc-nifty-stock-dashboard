import React from 'react'

const INDEX_ORDER = [
  'Gift Nifty',
  'Nifty 50',
  'Nifty Next 50',
  'Nifty Midcap 100',
  'Nifty Smallcap 100',
  'USD/INR',
  'Gold 24K',
]

export default function IndexCards({ indices }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
      {INDEX_ORDER.map((name) => {
        const idx = indices[name]
        if (!idx || idx.price == null) {
          return (
            <div
              key={name}
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="text-xs font-medium uppercase tracking-wider">{name}</div>
              <div className="text-lg font-bold mt-1">--</div>
            </div>
          )
        }
        const isPositive = idx.change >= 0
        return (
          <div
            key={name}
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              {name}
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--text)' }}
            >
              {idx.price?.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {idx.change != null && (
              <div
                className="text-sm font-medium mt-1"
                style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}
              >
                {isPositive ? '+' : ''}{idx.change.toFixed(2)}
                {' '}
                ({isPositive ? '+' : ''}{idx.changePercent?.toFixed(2)}%)
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
