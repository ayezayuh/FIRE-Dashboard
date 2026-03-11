import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { AMBER, GREEN, RED, BORDER, SURFACE2, TEXT, TEXT_DIM, FIRE_TARGET, TODAY, addMonths, fmtDate, fmt, computePayoff, computeFIRE } from '../constants.js'
import { SECTION, STAT } from './UI.jsx'

const FIRE_DATE_TARGET = new Date(2031, 4, 1)

export default function OverviewTab({ debts, fire }) {
  const fireCalc = useMemo(() => computeFIRE(fire.currentPortfolio, fire.monthlyContrib, fire.annualReturn), [fire])
  const onTrack = fireCalc.date <= FIRE_DATE_TARGET

  const totalDebt = debts.reduce((s, d) => s + (['credit', 'loan', 'installment'].includes(d.type) ? d.balance : 0), 0)
  const totalMonthly = debts.reduce((s, d) => s + d.monthly, 0)

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

  const combinedData = useMemo(() => {
    const months = Math.max(fireCalc.months + 6, 72)
    const data = []
    for (let m = 0; m <= months; m += 2) {
      let totalBal = 0
      debts.forEach(debt => {
        if (['credit', 'loan', 'installment'].includes(debt.type) && debt.balance > 0) {
          const monthlyRate = debt.apr / 100 / 12
          let bal = debt.balance
          for (let i = 0; i < m; i++) bal = Math.max(0, bal + bal * monthlyRate - debt.monthly)
          totalBal += bal
        }
      })
      const fp = fireCalc.timeline.find(t => t.month >= m) || fireCalc.timeline[fireCalc.timeline.length - 1]
      const d = addMonths(TODAY, m)
      data.push({ month: m, label: d.getFullYear(), debt: Math.round(totalBal), portfolio: fp ? fp.balance : fire.currentPortfolio })
    }
    return data
  }, [debts, fireCalc, fire])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Revolving Debt', value: fmt(totalDebt), color: totalDebt > 15000 ? RED : totalDebt > 5000 ? AMBER : GREEN },
          { label: 'Monthly Obligations', value: fmt(totalMonthly), color: TEXT },
          { label: 'Portfolio (Est.)', value: fmt(fire.currentPortfolio), color: AMBER },
          { label: 'FIRE Date', value: fmtDate(fireCalc.date), color: onTrack ? GREEN : RED },
        ].map(k => (
          <div key={k.label} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5 }}>{k.label}</div>
            <div style={{ fontSize: 17, fontFamily: "'IBM Plex Mono', monospace", color: k.color, fontWeight: 500 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <SECTION title="Debt vs. Portfolio — The Full Arc" subtitle="Watch them cross">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <XAxis dataKey="label" tick={{ fill: TEXT_DIM, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: TEXT_DIM, fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip
                contentStyle={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11 }}
                formatter={(v, n) => [fmt(v), n === 'debt' ? 'Debt' : 'Portfolio']}
              />
              <ReferenceLine y={FIRE_TARGET} stroke={GREEN} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="debt" stroke={RED} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="portfolio" stroke={AMBER} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
          {[{ color: RED, label: 'Debt' }, { color: AMBER, label: 'Portfolio' }, { color: GREEN, label: `FIRE Target (${fmt(FIRE_TARGET)})` }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: TEXT_DIM }}>
              <div style={{ width: 16, height: 2, background: l.color }} />{l.label}
            </div>
          ))}
        </div>
      </SECTION>

      <SECTION title="Sovereign Status">
        <STAT label="Net Worth Est." value={fmt(fire.currentPortfolio - totalDebt)} color={fire.currentPortfolio - totalDebt > 0 ? GREEN : RED} />
        <STAT label="Months to FIRE" value={`${fireCalc.months}`} sub={`At ${fire.monthlyContrib}/mo contributions`} color={AMBER} />
        <STAT label="Debt-Free Est." value={debtFreeMonth > 0 ? fmtDate(addMonths(TODAY, debtFreeMonth)) : '—'} sub="All revolving cleared" color={TEXT} />
        <STAT label="Blueprint Target" value={fmtDate(FIRE_DATE_TARGET)} sub={onTrack ? '✓ On track' : '⚠ Needs acceleration'} color={onTrack ? GREEN : RED} />
      </SECTION>
    </div>
  )
}
