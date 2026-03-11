export const AMBER = '#C9922A'
export const AMBER_DIM = '#8B6218'
export const AMBER_BRIGHT = '#F0B429'
export const RED = '#C0392B'
export const GREEN = '#27AE60'
export const BG = '#0A0A08'
export const SURFACE = '#111110'
export const SURFACE2 = '#1A1A17'
export const BORDER = '#2A2A24'
export const TEXT = '#E8E4D9'
export const TEXT_DIM = '#7A7668'
export const TEXT_MED = '#B0AA98'

export const FIRE_TARGET = 668000
export const TODAY = new Date()

export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (d) =>
  d instanceof Date && !isNaN(d)
    ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

export const addMonths = (date, months) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export const monthsUntil = (targetDate) => {
  const diff = (new Date(targetDate) - TODAY) / (1000 * 60 * 60 * 24 * 30.44)
  return Math.max(0, Math.round(diff))
}

export function computePayoff(balance, apr, monthlyPayment) {
  if (balance <= 0) return { months: 0, date: TODAY, totalInterest: 0, timeline: [] }
  if (monthlyPayment <= 0) return { months: 999, date: addMonths(TODAY, 999), totalInterest: 0, timeline: [] }
  let bal = balance
  let months = 0
  let totalInterest = 0
  const timeline = [{ month: 0, balance: bal, date: new Date(TODAY) }]
  const monthlyRate = apr / 100 / 12
  while (bal > 0.01 && months < 600) {
    const interest = bal * monthlyRate
    totalInterest += interest
    bal = bal + interest - monthlyPayment
    if (bal < 0) bal = 0
    months++
    timeline.push({ month: months, balance: Math.max(0, bal), date: addMonths(TODAY, months) })
  }
  return { months, date: addMonths(TODAY, months), totalInterest, timeline }
}

export function computeFIRE(currentPortfolio, monthlyContrib, annualReturn) {
  const monthlyRate = annualReturn / 100 / 12
  let bal = currentPortfolio
  const timeline = []
  let months = 0
  while (bal < FIRE_TARGET && months < 360) {
    bal = bal * (1 + monthlyRate) + monthlyContrib
    months++
    const d = addMonths(TODAY, months)
    timeline.push({ month: months, balance: Math.round(bal), date: d, label: d.getFullYear() })
  }
  return { months, date: addMonths(TODAY, months), finalBalance: Math.round(bal), timeline }
}

export const DEFAULT_DEBTS = [
  { id: 'citi-diamond', name: 'Citi Diamond', balance: 4200, monthly: 500, apr: 0, type: 'credit', promoDeadline: new Date(new Date().getFullYear(), 2, 31).toISOString() },
  { id: 'citi-simplicity', name: 'Citi Simplicity', balance: 6800, monthly: 400, apr: 0, type: 'credit', promoDeadline: new Date(new Date().getFullYear(), 10, 1).toISOString() },
  { id: 'amex-platinum', name: 'Amex Platinum', balance: 1800, monthly: 1800, apr: 0, type: 'charge', promoDeadline: null },
  { id: 'iphone', name: 'iPhone Installment', balance: 320, monthly: 80, apr: 0, type: 'installment', promoDeadline: null },
  { id: 'tesla', name: 'Tesla Lease', balance: 14400, monthly: 600, apr: 0, type: 'lease', promoDeadline: null },
  { id: 'student-loan', name: 'Student Loan', balance: 22000, monthly: 280, apr: 6.5, type: 'loan', promoDeadline: null },
  { id: 'mother-support', name: 'Mother Support', balance: 0, monthly: 400, apr: 0, type: 'fixed', promoDeadline: null },
]

export const DEFAULT_FIRE = {
  currentPortfolio: 120000,
  monthlyContrib: 1200,
  annualReturn: 7,
  salary: 190000,
}
