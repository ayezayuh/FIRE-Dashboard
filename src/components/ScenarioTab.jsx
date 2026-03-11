import { useState } from 'react'
import { AMBER, GREEN, RED, BORDER, SURFACE2, TEXT, TEXT_DIM, TODAY, addMonths, fmtDate, fmt, computePayoff, computeFIRE, FIRE_TARGET } from '../constants.js'
import { SECTION, INPUT } from './UI.jsx'

export default function ScenarioTab({ debts, fire }) {
  const [selectedDebtId, setSelectedDebtId] = useState(debts[0]?.id || '')
  const [lumpAmount, setLumpAmount] = useState(0)
  const [lumpTarget, setLumpTarget] = useState('debt')

  const activeDebts = debts.filter(d => d.balance > 0)
  const selectedDebt = debts.find(d => d.id === selectedDebtId)

  const baseCalc = computeFIRE(fire.currentPortfolio, fire.monthlyContrib, fire.annualReturn)

  return (
    <div>
      <SECTION title="Payment Sensitivity" subtitle="What does changing your monthly payment do?">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Debt</div>
          <select
            value={selectedDebtId}
            onChange={e => setSelectedDebtId(e.target.value)}
            style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: '10px 12px', fontSize: 13, outline: 'none', WebkitAppearance: 'none' }}
          >
            {activeDebts.map(d => (
              <option key={d.id} value={d.id} style={{ background: '#111' }}>{d.name}</option>
            ))}
          </select>
        </div>
        {selectedDebt && (
          <div>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(mult => {
              const pay = Math.round(selectedDebt.monthly * mult)
              const p = computePayoff(selectedDebt.balance, selectedDebt.apr, Math.max(1, pay))
              const isCurrent = mult === 1
              return (
                <div key={mult} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 14px', marginBottom: 6, borderRadius: 6,
                  background: isCurrent ? AMBER + '15' : SURFACE2,
                  border: `1px solid ${isCurrent ? AMBER + '55' : BORDER}`
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: isCurrent ? AMBER : TEXT }}>{fmt(pay)}/mo</div>
                    {isCurrent && <div style={{ fontSize: 10, color: AMBER, marginTop: 1 }}>current</div>}
                    {!isCurrent && p.totalInterest > 1 && (
                      <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 1 }}>{fmt(p.totalInterest)} interest</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: isCurrent ? AMBER : p.months < computePayoff(selectedDebt.balance, selectedDebt.apr, selectedDebt.monthly).months ? GREEN : RED }}>
                      {p.months > 0 && selectedDebt.balance > 0 ? fmtDate(p.date) : 'Already paid'}
                    </div>
                    {!isCurrent && (() => {
                      const base = computePayoff(selectedDebt.balance, selectedDebt.apr, selectedDebt.monthly)
                      const diff = base.months - p.months
                      return diff !== 0 ? (
                        <div style={{ fontSize: 10, color: diff > 0 ? GREEN : RED, marginTop: 1 }}>
                          {diff > 0 ? `${diff}mo earlier` : `${Math.abs(diff)}mo later`}
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SECTION>

      <SECTION title="Windfall / Raise Simulator" subtitle="Drop a number, see the ripple" accent>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Apply Windfall To</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['debt', 'portfolio'].map(t => (
              <button key={t} onClick={() => setLumpTarget(t)}
                style={{ flex: 1, padding: '9px', background: lumpTarget === t ? AMBER + '20' : SURFACE2, border: `1px solid ${lumpTarget === t ? AMBER : BORDER}`, color: lumpTarget === t ? AMBER : TEXT_DIM, borderRadius: 6, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', fontWeight: lumpTarget === t ? 700 : 400 }}
              >{t === 'debt' ? '💳 Debt Paydown' : '📈 Portfolio Injection'}</button>
            ))}
          </div>
          {lumpTarget === 'debt' && (
            <select
              value={selectedDebtId}
              onChange={e => setSelectedDebtId(e.target.value)}
              style={{ width: '100%', background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, padding: '10px 12px', fontSize: 13, outline: 'none', WebkitAppearance: 'none', marginBottom: 12 }}
            >
              {activeDebts.map(d => (
                <option key={d.id} value={d.id} style={{ background: '#111' }}>{d.name} — {fmt(d.balance)}</option>
              ))}
            </select>
          )}
        </div>
        <INPUT label="Windfall Amount" value={lumpAmount} onChange={setLumpAmount} step={1000} />

        {lumpAmount > 0 && lumpTarget === 'debt' && selectedDebt && (() => {
          const base = computePayoff(selectedDebt.balance, selectedDebt.apr, selectedDebt.monthly)
          const boosted = computePayoff(Math.max(0, selectedDebt.balance - lumpAmount), selectedDebt.apr, selectedDebt.monthly)
          const saved = base.months - boosted.months
          return (
            <div style={{ padding: 14, background: SURFACE2, borderRadius: 8, border: `1px solid ${GREEN}33` }}>
              <div style={{ fontSize: 12, color: TEXT, marginBottom: 10 }}>Impact on <strong>{selectedDebt.name}</strong></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div><div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 2 }}>New Balance</div><div style={{ fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", color: GREEN }}>{fmt(Math.max(0, selectedDebt.balance - lumpAmount))}</div></div>
                <div><div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 2 }}>Payoff Date</div><div style={{ fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", color: GREEN }}>{fmtDate(boosted.date)}</div></div>
                <div><div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 2 }}>Months Saved</div><div style={{ fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", color: AMBER }}>{saved}</div></div>
              </div>
            </div>
          )
        })()}

        {lumpAmount > 0 && lumpTarget === 'portfolio' && (() => {
          const boosted = computeFIRE(fire.currentPortfolio + lumpAmount, fire.monthlyContrib, fire.annualReturn)
          const saved = baseCalc.months - boosted.months
          return (
            <div style={{ padding: 14, background: SURFACE2, borderRadius: 8, border: `1px solid ${AMBER}33` }}>
              <div style={{ fontSize: 12, color: TEXT, marginBottom: 10 }}>{fmt(lumpAmount)} injected into portfolio</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 2 }}>New FIRE Date</div><div style={{ fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", color: AMBER }}>{fmtDate(boosted.date)}</div></div>
                <div><div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 2 }}>Months Saved</div><div style={{ fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", color: GREEN }}>{saved}</div></div>
              </div>
            </div>
          )
        })()}
      </SECTION>

      <SECTION title="Raise Scenarios" subtitle="How salary increases move the FIRE date">
        {[0, 10000, 20000, 30000, 50000].map(raise => {
          const extraMonthly = Math.round((raise * 0.65) / 12)
          const result = computeFIRE(fire.currentPortfolio, fire.monthlyContrib + extraMonthly, fire.annualReturn)
          const saved = baseCalc.months - result.months
          const isCurrent = raise === 0
          return (
            <div key={raise} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 14px', marginBottom: 6, borderRadius: 6,
              background: isCurrent ? AMBER + '15' : SURFACE2,
              border: `1px solid ${isCurrent ? AMBER + '55' : BORDER}`
            }}>
              <div>
                <div style={{ fontSize: 13, color: isCurrent ? AMBER : TEXT }}>
                  {fmt(fire.salary + raise)}{isCurrent ? ' (current)' : ''}
                </div>
                {!isCurrent && <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 1 }}>+{fmt(extraMonthly)}/mo take-home</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: isCurrent ? AMBER : GREEN }}>{fmtDate(result.date)}</div>
                {!isCurrent && saved > 0 && <div style={{ fontSize: 10, color: GREEN, marginTop: 1 }}>{saved}mo earlier</div>}
              </div>
            </div>
          )
        })}
      </SECTION>
    </div>
  )
}
