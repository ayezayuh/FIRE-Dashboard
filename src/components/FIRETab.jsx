import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { AMBER, GREEN, RED, BORDER, SURFACE2, TEXT, TEXT_DIM, FIRE_TARGET, TODAY, addMonths, fmtDate, fmt, computeFIRE, computePayoff } from '../constants.js'
import { SECTION, INPUT, STAT } from './UI.jsx'

const FIRE_DATE_TARGET = new Date(2031, 4, 1)

const MILESTONES = [
  { label: 'Blancpain Villeret', value: '$16,500', sub: '→ unlocks Rolex Sprite allocation' },
  { label: 'Max 401k', value: 'Jan 2027', sub: '$23,500 annual target' },
  { label: 'Brokerage $2k/mo', value: 'Jan 2027', sub: 'Post-debt scaling' },
  { label: 'Rolex GMT Sprite', value: 'Via HWL AD', sub: 'Origin story piece' },
  { label: 'A. Lange & Söhne Lange 1', value: 'FIRE Milestone', sub: 'The grail — the reward' },
]

export default function FIRETab({ fire, onUpdate }) {
  const base = useMemo(() => computeFIRE(fire.currentPortfolio, fire.monthlyContrib, fire.annualReturn), [fire])
  const boosted = useMemo(() => computeFIRE(fire.currentPortfolio, fire.monthlyContrib + 800, fire.annualReturn), [fire])
  const onTrack = base.date <= FIRE_DATE_TARGET

  const chartData = base.timeline.filter((_, i) => i % 3 === 0)

  return (
    <div>
      <SECTION title={`Portfolio Growth · Target ${fmt(FIRE_TARGET)}`} subtitle={`Age 40 deadline: ${fmtDate(FIRE_DATE_TARGET)}`}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Projected Date</div>
            <div style={{ fontSize: 20, fontFamily: "'IBM Plex Mono', monospace", color: onTrack ? GREEN : RED }}>{fmtDate(base.date)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Months Out</div>
            <div style={{ fontSize: 20, fontFamily: "'IBM Plex Mono', monospace", color: AMBER }}>{base.months}</div>
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AMBER} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: TEXT_DIM, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: TEXT_DIM, fontSize: 10 }} axisLine={false} tickLine={false} width={46} />
              <Tooltip
                contentStyle={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11 }}
                formatter={v => [fmt(v), 'Portfolio']}
                labelFormatter={(_, p) => p?.[0]?.payload?.date ? fmtDate(p[0].payload.date) : ''}
              />
              <ReferenceLine y={FIRE_TARGET} stroke={GREEN} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="balance" stroke={AMBER} fill="url(#fireGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SECTION>

      <SECTION title="Scenario Comparison">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
          {[
            { label: 'Scenario 3 Base', contrib: fire.monthlyContrib, result: base, color: AMBER },
            { label: '+$800/mo Post-Debt', contrib: fire.monthlyContrib + 800, result: boosted, color: GREEN },
          ].map(s => (
            <div key={s.label} style={{ padding: 14, background: SURFACE2, borderRadius: 8, border: `1px solid ${s.color}33` }}>
              <div style={{ fontSize: 10, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: TEXT_DIM, marginBottom: 6 }}>{fmt(s.contrib)}/mo</div>
              <div style={{ fontSize: 17, fontFamily: "'IBM Plex Mono', monospace", color: s.color, marginBottom: 2 }}>{fmtDate(s.result.date)}</div>
              <div style={{ fontSize: 10, color: TEXT_DIM }}>{s.result.months}mo out</div>
            </div>
          ))}
        </div>
      </SECTION>

      <SECTION title="FIRE Inputs" accent>
        <INPUT label="Current Portfolio Balance" value={fire.currentPortfolio} onChange={v => onUpdate({ ...fire, currentPortfolio: v })} step={1000} />
        <INPUT label="Monthly Contribution" value={fire.monthlyContrib} onChange={v => onUpdate({ ...fire, monthlyContrib: v })} step={100} />
        <INPUT label="Expected Annual Return" value={fire.annualReturn} onChange={v => onUpdate({ ...fire, annualReturn: v })} prefix="%" step={0.5} min={1} max={20} />
        <INPUT label="Annual Salary" value={fire.salary} onChange={v => onUpdate({ ...fire, salary: v })} step={1000} />
      </SECTION>

      <SECTION title="Milestones & Markers">
        {MILESTONES.map(m => (
          <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: TEXT }}>{m.label}</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>{m.sub}</div>
            </div>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: AMBER, flexShrink: 0, marginLeft: 10 }}>{m.value}</div>
          </div>
        ))}
      </SECTION>
    </div>
  )
}
