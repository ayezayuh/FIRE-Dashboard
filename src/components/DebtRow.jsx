import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AMBER, BORDER, BG, GREEN, RED, SURFACE2, TEXT, TEXT_DIM } from '../constants.js'
import { computePayoff, fmt, fmtDate, addMonths, monthsUntil, TODAY } from '../constants.js'
import { INPUT, BADGE } from './UI.jsx'

export default function DebtRow({ debt, onUpdate }) {
  const [expanded, setExpanded] = useState(false)

  const promoDeadline = debt.promoDeadline ? new Date(debt.promoDeadline) : null
  const isPromo = debt.apr === 0 && promoDeadline
  const daysLeft = isPromo ? Math.round((promoDeadline - TODAY) / (1000 * 60 * 60 * 24)) : null
  const payoff = computePayoff(debt.balance, debt.apr, debt.monthly)
  const reqMonthly = isPromo && debt.balance > 0 ? Math.ceil(debt.balance / Math.max(1, monthsUntil(promoDeadline))) : null
  const isUrgent = daysLeft !== null && daysLeft < 30
  const isWarning = daysLeft !== null && daysLeft < 60

  const chartData = payoff.timeline.filter((_, i) => i % Math.max(1, Math.floor(payoff.timeline.length / 20)) === 0)

  return (
    <div style={{ marginBottom: 8, border: `1px solid ${isUrgent ? RED + '88' : isWarning ? AMBER + '66' : BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', cursor: 'pointer', background: SURFACE2, gap: 10, WebkitTapHighlightColor: 'transparent' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{debt.name}</span>
            {isPromo && <BADGE text={`0%`} color={isUrgent ? RED : isWarning ? AMBER : GREEN} />}
            {isPromo && daysLeft !== null && <BADGE text={`${daysLeft}d`} color={isUrgent ? RED : isWarning ? AMBER : TEXT_DIM} />}
            {debt.type === 'lease' && <BADGE text="Lease" color={TEXT_DIM} />}
            {debt.type === 'installment' && <BADGE text="Install" color={TEXT_DIM} />}
            {debt.type === 'charge' && <BADGE text="Charge" color={TEXT_DIM} />}
          </div>
          <div style={{ fontSize: 11, color: TEXT_DIM }}>
            {debt.balance > 0 ? fmt(debt.balance) : 'Paid'} · {debt.monthly > 0 ? `${fmt(debt.monthly)}/mo` : '—'}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {payoff.months > 0 && debt.balance > 0 ? (
            <>
              <div style={{ fontSize: 12, color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtDate(payoff.date)}</div>
              <div style={{ fontSize: 10, color: TEXT_DIM }}>payoff</div>
            </>
          ) : debt.balance === 0 ? (
            <div style={{ fontSize: 12, color: GREEN }}>✓ Clear</div>
          ) : null}
        </div>
        <div style={{ color: TEXT_DIM, fontSize: 11, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div style={{ padding: '16px', background: BG, borderTop: `1px solid ${BORDER}` }}>
          <INPUT label="Balance" value={debt.balance} onChange={v => onUpdate({ ...debt, balance: v })} step={50} />
          <INPUT label="Monthly Payment" value={debt.monthly} onChange={v => onUpdate({ ...debt, monthly: v })} step={50} />
          <INPUT label="APR %" value={debt.apr} onChange={v => onUpdate({ ...debt, apr: v })} prefix="%" step={0.1} min={0} />

          {isPromo && reqMonthly && (
            <div style={{ padding: '10px 14px', background: AMBER + '11', border: `1px solid ${AMBER}44`, borderRadius: 6, fontSize: 12, color: AMBER, marginBottom: 12 }}>
              To clear by deadline: <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(reqMonthly)}/mo</strong>
              {debt.monthly < reqMonthly
                ? <span style={{ color: RED }}> — {fmt(reqMonthly - debt.monthly)} short</span>
                : <span style={{ color: GREEN }}> — on track ✓</span>}
            </div>
          )}

          {debt.balance > 0 && chartData.length > 1 && (
            <div style={{ height: 70, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`g-${debt.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 11 }}
                    labelFormatter={m => fmtDate(addMonths(TODAY, m))}
                    formatter={v => [fmt(v), 'Balance']}
                  />
                  <Area type="monotone" dataKey="balance" stroke={AMBER} fill={`url(#g-${debt.id})`} strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
