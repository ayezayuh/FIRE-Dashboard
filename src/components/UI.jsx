import { AMBER, AMBER_DIM, BORDER, GREEN, RED, SURFACE, SURFACE2, TEXT, TEXT_DIM } from '../constants.js'

export const SECTION = ({ title, subtitle, children, accent }) => (
  <div style={{ background: SURFACE, border: `1px solid ${accent ? AMBER_DIM : BORDER}`, borderRadius: 10, padding: '18px 20px', marginBottom: 14 }}>
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent ? AMBER : TEXT_DIM, fontWeight: 700, marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: TEXT_DIM }}>{subtitle}</div>}
    </div>
    {children}
  </div>
)

export const INPUT = ({ label, value, onChange, prefix = '$', suffix, min = 0, step = 100, note, warn }) => (
  <div style={{ marginBottom: 13 }}>
    <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', background: SURFACE2, border: `1px solid ${warn ? RED : BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
      {prefix && <span style={{ padding: '0 10px', color: TEXT_DIM, fontSize: 13, borderRight: `1px solid ${BORDER}`, minWidth: 28, textAlign: 'center' }}>{prefix}</span>}
      <input
        type="number" inputMode="decimal" min={min} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: TEXT, fontSize: 15, padding: '10px 10px', fontFamily: "'IBM Plex Mono', monospace", width: '100%' }}
      />
      {suffix && <span style={{ padding: '0 10px', color: TEXT_DIM, fontSize: 12 }}>{suffix}</span>}
    </div>
    {note && <div style={{ fontSize: 11, color: warn ? RED : TEXT_DIM, marginTop: 3 }}>{note}</div>}
  </div>
)

export const STAT = ({ label, value, sub, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 22, fontFamily: "'IBM Plex Mono', monospace", color: color || TEXT, fontWeight: 500, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>{sub}</div>}
  </div>
)

export const BADGE = ({ text, color }) => (
  <span style={{ fontSize: 9, background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{text}</span>
)

export const TAB = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    style={{
      background: active ? AMBER + '20' : 'transparent',
      border: `1px solid ${active ? AMBER : BORDER}`,
      color: active ? AMBER : TEXT_DIM,
      padding: '8px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
      letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
      fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
      WebkitTapHighlightColor: 'transparent',
    }}
  >{label}</button>
)
