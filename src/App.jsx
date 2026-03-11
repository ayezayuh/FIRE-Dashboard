import { useMemo, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import {
  AMBER, AMBER_DIM, BG, BORDER, GREEN, RED, SURFACE, TEXT, TEXT_DIM,
  FIRE_TARGET, TODAY, addMonths, fmtDate, fmt, computePayoff, computeFIRE,
  DEFAULT_DEBTS, DEFAULT_FIRE
} from './constants.js'
import { TAB, BADGE } from './components/UI.jsx'
import DebtTab from './components/DebtTab.jsx'
import FIRETab from './components/FIRETab.jsx'
import ScenarioTab from './components/ScenarioTab.jsx'
import OverviewTab from './components/OverviewTab.jsx'

const FIRE_DATE_TARGET = new Date(2031, 4, 1)

export default function App() {
  const [debts, setDebts] = useLocalStorage('sovereign-debts-v1', DEFAULT_DEBTS)
  const [fire, setFire] = useLocalStorage('sovereign-fire-v1', DEFAULT_FIRE)
  const [activeTab, setActiveTab] = useLocalStorage('sovereign-tab-v1', 'debt')

  const updateDebt = useCallback((updated) => {
    setDebts(prev => prev.map(d => d.id === updated.id ? updated : d))
  }, [setDebts])

  const totalDebt = useMemo(() =>
    debts.reduce((s, d) => s + (['credit', 'loan', 'installment'].includes(d.type) ? d.balance : 0), 0), [debts])

  const fireCalc = useMemo(() => computeFIRE(fire.currentPortfolio, fire.monthlyContrib, fire.annualReturn), [fire])
  const onTrack = fireCalc.date <= FIRE_DATE_TARGET

  const promoDebts = debts.filter(d => {
    if (!d.promoDeadline || d.balance <= 0) return false
    const deadline = new Date(d.promoDeadline)
    return deadline > TODAY
  })

  return (
    <div style={{
      background: BG, minHeight: '100vh', color: TEXT,
      fontFamily: "'DM Sans', sans-serif",
      backgroundImage: 'radial-gradient(ellipse at 20% 0%, #1a1500 0%, transparent 50%)',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: `1px solid ${BORDER}`,
        background: BG + 'ee',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMBER_DIM, marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>Sovereign FIRE · 2026</div>
            <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 500, lineHeight: 1.1 }}>Command Center</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>FIRE Target</div>
            <div style={{ fontSize: 18, fontFamily: "'IBM Plex Mono', monospace", color: AMBER }}>{fmt(FIRE_TARGET)}</div>
            <div style={{ marginTop: 4 }}>
              <BADGE text={onTrack ? '✓ On Track' : '⚠ Behind'} color={onTrack ? GREEN : RED} />
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[
            { label: 'Debt', value: fmt(totalDebt), color: totalDebt > 15000 ? RED : AMBER },
            { label: 'Portfolio', value: fmt(fire.currentPortfolio), color: AMBER },
            { label: 'FIRE', value: fmtDate(fireCalc.date), color: onTrack ? GREEN : RED },
          ].map(k => (
            <div key={k.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '8px 12px', flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Alerts */}
      {promoDebts.length > 0 && (
        <div style={{ padding: '10px 18px 0' }}>
          {promoDebts.map(d => {
            const deadline = new Date(d.promoDeadline)
            const days = Math.round((deadline - TODAY) / (1000 * 60 * 60 * 24))
            const req = Math.ceil(d.balance / Math.max(1, Math.round((deadline - TODAY) / (1000 * 60 * 60 * 24 * 30.44))))
            const urgent = days < 30
            return (
              <div key={d.id} style={{ padding: '10px 14px', background: urgent ? RED + '11' : AMBER + '0a', border: `1px solid ${urgent ? RED + '55' : AMBER + '33'}`, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: urgent ? RED : AMBER, fontWeight: 700, marginBottom: 2 }}>
                  {urgent ? '🚨' : '⚡'} {d.name} · 0% expires in {days} days
                </div>
                <div style={{ fontSize: 11, color: TEXT_DIM }}>
                  {fmt(d.balance)} remaining · Need {fmt(req)}/mo to clear
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: '12px 18px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <TAB id="debt" label="Debt" active={activeTab === 'debt'} onClick={setActiveTab} />
        <TAB id="fire" label="FIRE" active={activeTab === 'fire'} onClick={setActiveTab} />
        <TAB id="scenario" label="Scenarios" active={activeTab === 'scenario'} onClick={setActiveTab} />
        <TAB id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
      </div>

      {/* Tab content */}
      <div style={{ padding: '0 18px' }}>
        {activeTab === 'debt' && <DebtTab debts={debts} onUpdateDebt={updateDebt} />}
        {activeTab === 'fire' && <FIRETab fire={fire} onUpdate={setFire} />}
        {activeTab === 'scenario' && <ScenarioTab debts={debts} fire={fire} />}
        {activeTab === 'overview' && <OverviewTab debts={debts} fire={fire} />}
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: TEXT_DIM, marginTop: 20, padding: '0 18px' }}>
        Sovereign Blueprint · Projections are estimates · {fire.annualReturn}% assumed return
      </div>
    </div>
  )
}
