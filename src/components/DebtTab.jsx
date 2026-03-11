import { useState, useMemo } from 'react'
import { AMBER, GREEN, RED, BORDER, SURFACE2, TEXT, TEXT_DIM, FIRE_TARGET, TODAY, addMonths, fmtDate, fmt, computePayoff } from '../constants.js'
import { SECTION, INPUT } from './UI.jsx'
import DebtRow from './DebtRow.jsx'

export default function DebtTab({ debts, onUpdateDebt }) {
  const [lumpSum, setLumpSum] = useState({ debtId: debts[0]?.id || '', amount: 0 })

  const activeDebts = debts.filter(d => d.balance > 0)
  const lumpDebt = debts.find(d => d.id === lumpSum.debtId)
  const basePayoff = lumpDebt ? computePayoff(lumpDebt.balance, lumpDebt.apr, lumpDebt.monthly) : null
  const lumpPayoff = lumpDebt ? computePayoff(Math.max(0, lumpDebt.balance - lumpSum.amount), lumpDebt.apr, lumpDebt.monthly) : null
  const monthsSaved = basePayoff && lumpPayoff ? basePayoff.months - lumpPayoff.months : 0
  const interestSaved = basePayoff && lumpPayoff ? basePayoff.totalInterest - lumpPayoff.totalInterest : 0

  const debtFreeMonth = useMemo(() => {
    let latest = 0
    debts.forEach(d => {
      if (d.balance > 0 && d.type !== 'lease' && d.type !== 'fixed' && d.type !== 'charge' && d.monthly > 0) {
        const p = computePayoff(d.balance, d.apr, d.monthly)
        if (p.months > latest) latest = p.months
      }
    })
    return latest
  }, [debts])

  return (
    <div>
      {debts.map(d => <DebtRow key={d.id} debt={d} onUpdate={onUpdateDebt} />)}

      <SECTION title="Lump Sum Simulator" subtitle="Drop extra cash — see what it moves" accent>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Debt</div>
          <select
            value={lumpSum.debtId}
            onChange={e => setLumpSum(p => ({ ...p, debtId: e.target.value }))}
            style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: '10px 12px', fontSize: 13, outline: 'none', WebkitAppearance: 'none' }}
          >
            {activeDebts.map(d => (
              <option key={d.id} value={d.id} style={{ background: '#111' }}>{d.name} — {fmt(d.balance)}</option>
            ))}
          </select>
        </div>
        <INPUT label="Lump Sum Amount" value={lumpSum.amount} onChange={v => setLumpSum(p => ({ ...p, amount: v }))} step={500} />

        {lumpDebt && lumpSum.amount > 0 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div style={{ padding: '12px', background: SURFACE2, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: TEXT_DIM, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Without</div>
                <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: RED }}>{basePayoff ? fmtDate(basePayoff.date) : '—'}</div>
              </div>
              <div style={{ padding: '12px', background: SURFACE2, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: TEXT_DIM, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>With {fmt(lumpSum.amount)}</div>
                <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: GREEN }}>{lumpPayoff ? fmtDate(lumpPayoff.date) : '—'}</div>
              </div>
            </div>
            {monthsSaved > 0 && (
              <div style={{ padding: '10px 14px', background: GREEN + '11', border: `1px solid ${GREEN}33`, borderRadius: 6, fontSize: 12, color: GREEN, textAlign: 'center' }}>
                Saves <strong>{monthsSaved} months</strong>
                {interestSaved > 1 && ` · ${fmt(interestSaved)} in interest`}
              </div>
            )}
          </div>
        )}
      </SECTION>

      <SECTION title="Payoff Waterfall" subtitle="Estimated clearance order">
        {debts.filter(d => d.balance > 0 && d.type !== 'fixed' && d.monthly > 0).map(d => {
          const p = computePayoff(d.balance, d.apr, d.monthly)
          const maxBal = Math.max(...debts.map(x => x.balance))
          const pct = Math.max(5, 100 - (d.balance / Math.max(1, maxBal)) * 80)
          const isPromo = d.apr === 0 && d.promoDeadline
          return (
            <div key={d.id} style={{ marginBottom: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: TEXT }}>{d.name}</span>
                <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: TEXT_DIM }}>{p.months > 0 ? fmtDate(p.date) : '—'}</span>
              </div>
              <div style={{ height: 4, background: BORDER, borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: isPromo ? AMBER : TEXT_DIM, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
        {debtFreeMonth > 0 && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: GREEN + '0a', border: `1px solid ${GREEN}22`, borderRadius: 6, textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: GREEN }}>Estimated debt freedom: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{fmtDate(addMonths(TODAY, debtFreeMonth))}</strong></span>
          </div>
        )}
      </SECTION>
    </div>
  )
}
