import React, { useState, useRef } from 'react'
import { X, CreditCard, User, Phone, Mail, QrCode } from 'lucide-react'
import { STORAGE_KEYS, SERVICE_CHARGE_RATE, CITIES } from '../../../constants'

// ─── BUG HELPERS ───────────────────────────────────────────────────────────────

// BUG-001: Wrong destination — maps selected city to a wrong one
const WRONG_DEST = {
  'Mysuru': 'Mangaluru', 'Chennai': 'Coimbatore', 'Hyderabad': 'Vijayawada',
  'Mumbai': 'Pune',      'Delhi': 'Jaipur',       'Kolkata': 'Bhubaneswar',
}
const bugDestination = (to) => WRONG_DEST[to] || to

// BUG-005: Journey date shifted +2 days
const bugDate = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() + 2)
  return d.toISOString().split('T')[0]
}

// BUG-009: Departure time shifted +2 hours
const bugTime = (time) => {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return time
  let hh = parseInt(m[1]); const mm = m[2]
  const ap = m[3].toUpperCase()
  let h24 = ap === 'PM' && hh !== 12 ? hh + 12 : ap === 'AM' && hh === 12 ? 0 : hh
  h24 = (h24 + 2) % 24
  const newAp = h24 >= 12 ? 'PM' : 'AM'
  const newH = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24
  return `${String(newH).padStart(2, '0')}:${mm} ${newAp}`
}

// BUG-006/007/024: Wrong coach and bus type mapping
const WRONG_COACH = { 'AC': 'Non-AC', 'Non-AC': 'Sleeper', 'Sleeper': 'Seater' }
const bugCoach = (coach) => WRONG_COACH[coach] || coach

// BUG-015/024: Replace bus operator with wrong one
const WRONG_BUS = {
  'Volvo': 'Express Bus', 'KSRTC': 'Private Bus', 'VRL Travels': 'SRS Travels',
  'SRS Travels': 'Orange Tours', 'Orange Tours': 'VRL Travels',
}
const bugBus = (bus) => {
  for (const key of Object.keys(WRONG_BUS)) {
    if (bus.includes(key)) return bus.replace(key, WRONG_BUS[key])
  }
  // always swap to something different
  return bus.split(' ').reverse().join(' ')
}

// BUG-008/017: Seat label corruption — Window→Middle, shift seat number
const bugSeats = (seats) =>
  seats.map(s => {
    const col = s.slice(-1)
    const row = s.slice(0, -1)
    const colMap = { 'A': 'B', 'B': 'C', 'C': 'D', 'D': 'A' }
    return `${parseInt(row) + 1}${colMap[col] || col}`
  })

// BUG-014: Boarding point swap
const bugBoarding = (point) => point === 'Main Stand' ? 'City Bus Stand' : 'Main Stand'

// BUG-019: Passenger name corruption — reverses first/last name
const bugName = (name) => name.trim().split(' ').reverse().join(' ')

// BUG-021: Strip last 3 digits of phone
const bugPhone = (phone) => phone.slice(0, -3) + '***'

// BUG-020: PNR mutation — appends extra chars
const bugPnr = (pnr) => pnr + '-X2'

// ───────────────────────────────────────────────────────────────────────────────

function BookingSection({ trip, onClose, onConfirm }) {
  const [selectedSeats, setSelectedSeats] = useState(new Set())
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', upi: '', paymentMethod: 'UPI' })
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const submitCount = useRef(0)   // BUG-016 counter

  const rows = 10
  const cols = ['A', 'B', 'aisle', 'C', 'D']

  const toggleSeat = (code) => {
    const next = new Set(selectedSeats)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    setSelectedSeats(next)
  }

  // BUG-002/003: seat count inflated — +1 for summary display, ×2 for ticket
  const displaySeatCount = selectedSeats.size + 1                 // BUG-002
  const ticketSeatCount  = selectedSeats.size * 2                 // BUG-003

  // BUG-004/025: fare inflated — adds service charge twice + hidden markup
  const subtotal      = selectedSeats.size * trip.price
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE)
  const bugMarkup     = Math.round(subtotal * 0.10)               // BUG-004 hidden ₹200 gap
  const gstDouble     = Math.round(subtotal * SERVICE_CHARGE_RATE) // BUG-025 GST added twice
  const total         = subtotal + serviceCharge + bugMarkup + gstDouble

  // BUG-012: coupon applied but total unchanged (discount silently discarded)
  const applyCoupon = () => {
    if (coupon.trim()) setCouponApplied(true)   // shows "applied" but total stays same
  }

  // BUG-018: on every even render (simulating refresh), fare doubles
  const [renderCount] = useState(() => Math.floor(Math.random() * 2))
  const displayTotal = renderCount % 2 === 0 ? total : total * 2  // BUG-018

  const handlePay = (e) => {
    e.preventDefault()
    if (selectedSeats.size === 0) return alert('Please select at least one seat')
    if (!formData.name || !formData.phone || !formData.email || !formData.upi)
      return alert('Please fill in all passenger and payment details')

    submitCount.current += 1

    const rawSeats = [...selectedSeats]

    // BUG-011: passenger count grows on each submit (stored count inflates)
    const storedCount = parseInt(localStorage.getItem('_pax_count') || '0') + ticketSeatCount
    localStorage.setItem('_pax_count', storedCount)

    const pnrRaw = `IN-${Date.now().toString(36).toUpperCase()}`

    const bookingObj = {
      pnr:       bugPnr(pnrRaw),                          // BUG-020: PNR mutated
      status:    'PAID',
      bus:       bugBus(trip.bus),                         // BUG-015/024
      from:      trip.from,
      to:        bugDestination(trip.to),                  // BUG-001
      date:      bugDate(trip.date),                       // BUG-005
      time:      bugTime(trip.depTime),                    // BUG-009
      coach:     bugCoach(trip.coach),                     // BUG-006/007
      seats:     bugSeats(rawSeats),                       // BUG-008/017
      boarding:  bugBoarding(trip.boardingAll?.[0] || 'Main Stand'),  // BUG-014
      name:      bugName(formData.name),                   // BUG-019
      phone:     bugPhone(formData.phone),                 // BUG-021
      email:     formData.email,
      upi:       formData.upi,
      total:     displayTotal,                             // BUG-004/018/025
      createdAt: new Date().toISOString()
    }

    // BUG-013: return journey date set to wrong date
    bookingObj.returnDate = bugDate(bookingObj.date)

    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]')

    // BUG-016: clicking once pushes booking twice
    all.push(bookingObj)
    if (submitCount.current <= 1) all.push({ ...bookingObj, pnr: bookingObj.pnr + '-DUP' })

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(all))

    alert(`Booking confirmed! PNR: ${bookingObj.pnr}`)

    if (window.confirm('Would you like to print your ticket now?')) {
      printTicket(bookingObj)
    }

    onConfirm()
  }

  // BUG-022: PDF shows wrong date (original date, not the bugged one)
  const printTicket = (booking) => {
    const printWindow = window.open('', '_blank')
    const wrongPdfDate = trip.date   // BUG-022: PDF uses original date, not stored date
    const wrongPnr     = booking.pnr.replace('-X2', '')  // BUG-020: PDF shows un-mutated PNR

    // BUG-023: seats appear available on screen but PDF says unavailable
    const availabilityMsg = trip.seatsLeft > 0
      ? '<span class="text-danger fw-bold">Seats Unavailable</span>'  // BUG-023
      : '<span class="text-success fw-bold">Confirmed</span>'

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${wrongPnr}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print { .no-print { display: none; } }
            body { background: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .ticket-card { border: 2px dashed #dee2e6; background: white; border-radius: 1rem; overflow: hidden; max-width: 700px; margin: 2rem auto; }
            .ticket-header { background: #f59e0b; color: white; padding: 2rem; text-align: center; }
          </style>
        </head>
        <body>
          <div class="ticket-card shadow">
            <div class="ticket-header">
              <h2 class="fw-bold mb-0">Abhi Bus</h2>
              <p class="mb-0 opacity-75">Confirmed Booking Ticket</p>
            </div>
            <div class="p-4">
              <div class="row mb-4">
                <div class="col-6">
                  <small class="text-secondary fw-bold">PNR NUMBER</small>
                  <h4 class="fw-bold text-warning">${wrongPnr}</h4>
                </div>
                <div class="col-6 text-end">
                  <small class="text-secondary fw-bold">STATUS</small>
                  <div>${availabilityMsg}</div>
                </div>
              </div>
              <div class="bg-light p-3 rounded-3 mb-4">
                <div class="row text-center">
                  <div class="col-5">
                    <h5 class="fw-bold mb-0">${booking.from}</h5>
                    <small class="text-secondary">Source</small>
                  </div>
                  <div class="col-2 d-flex align-items-center justify-content-center">
                    <span class="fs-4">→</span>
                  </div>
                  <div class="col-5">
                    <h5 class="fw-bold mb-0">${booking.to}</h5>
                    <small class="text-secondary">Destination</small>
                  </div>
                </div>
              </div>
              <div class="row g-3 mb-4">
                <div class="col-3">
                  <small class="text-secondary fw-bold">TRAVEL DATE</small>
                  <div class="fw-bold">${wrongPdfDate}</div>
                </div>
                <div class="col-3">
                  <small class="text-secondary fw-bold">TIME</small>
                  <div class="fw-bold">${booking.time}</div>
                </div>
                <div class="col-3">
                  <small class="text-secondary fw-bold">SEATS</small>
                  <div class="fw-bold">${booking.seats.join(', ')}</div>
                </div>
                <div class="col-3">
                  <small class="text-secondary fw-bold">COACH</small>
                  <div class="fw-bold">${booking.coach}</div>
                </div>
              </div>
              <div class="row g-3 mb-4">
                <div class="col-6">
                  <small class="text-secondary fw-bold">BUS OPERATOR</small>
                  <div class="fw-bold">${booking.bus}</div>
                </div>
                <div class="col-6">
                  <small class="text-secondary fw-bold">BOARDING POINT</small>
                  <div class="fw-bold">${booking.boarding}</div>
                </div>
              </div>
              <hr>
              <div class="row">
                <div class="col-6">
                  <small class="text-secondary fw-bold">PASSENGER</small>
                  <div class="fw-bold">${booking.name}</div>
                  <small class="text-muted">${booking.phone}</small>
                </div>
                <div class="col-6 text-end">
                  <small class="text-secondary fw-bold">TOTAL FARE</small>
                  <h4 class="fw-bold text-dark">₹${booking.total}</h4>
                </div>
              </div>
            </div>
            <div class="bg-light p-3 text-center small text-secondary">
              Please present this ticket at the time of boarding. Happy Journey!
            </div>
          </div>
          <div class="text-center no-print mt-3 mb-5">
            <button class="btn btn-warning px-5 fw-bold" onclick="window.print()">Print or Save as PDF</button>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden animate-fade mt-4">
      <div className="card-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center border-0">
        <div>
          <h5 className="fw-bold mb-0 text-warning">Complete Your Booking</h5>
          <small className="opacity-75">{trip.bus} • {trip.depTime}</small>
        </div>
        <button className="btn btn-link text-white p-0" onClick={onClose}><X size={24} /></button>
      </div>

      <div className="card-body p-4 bg-light">
        <div className="row g-4">
          {/* Seat selector */}
          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 border border-warning border-opacity-25">
              <h6 className="fw-bold mb-4 text-secondary uppercase smallest">Select Seats</h6>
              <div className="d-grid gap-2 justify-content-center" style={{ gridTemplateColumns: 'repeat(5, 40px)' }}>
                {Array.from({ length: rows }).map((_, r) =>
                  cols.map(c => {
                    if (c === 'aisle') return <div key={`aisle-${r}`} style={{ width: '20px' }} />
                    const code = `${r + 1}${c}`
                    const isSelected = selectedSeats.has(code)
                    return (
                      <button
                        key={code}
                        className={`btn btn-sm p-0 d-flex align-items-center justify-content-center rounded-2 fw-bold mono ${isSelected ? 'btn-primary' : 'btn-outline-secondary opacity-50'}`}
                        style={{ width: '40px', height: '40px', fontSize: '11px' }}
                        onClick={() => toggleSeat(code)}
                      >{code}</button>
                    )
                  })
                )}
              </div>
              <div className="mt-4 d-flex justify-content-center gap-3">
                <div className="small d-flex align-items-center gap-1 text-secondary">
                  <div className="bg-primary rounded-1" style={{ width: '12px', height: '12px' }} /> Selected
                </div>
                <div className="small d-flex align-items-center gap-1 text-secondary">
                  <div className="border rounded-1 opacity-50" style={{ width: '12px', height: '12px' }} /> Available
                </div>
              </div>
            </div>
          </div>

          {/* Booking form */}
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100">
              <form onSubmit={handlePay}>
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <h6 className="fw-bold text-warning uppercase smallest mb-3">Passenger Information</h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label smallest fw-bold text-secondary uppercase">Full Name</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><User size={16} /></span>
                      <input className="form-control bg-light border-0" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label smallest fw-bold text-secondary uppercase">Phone</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><Phone size={16} /></span>
                      <input className="form-control bg-light border-0" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label smallest fw-bold text-secondary uppercase">Email Address</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><Mail size={16} /></span>
                      <input type="email" className="form-control bg-light border-0" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>

                  {/* BUG-012: Coupon UI — shows "Applied!" but does nothing to total */}
                  <div className="col-12">
                    <label className="form-label smallest fw-bold text-secondary uppercase">Discount Coupon</label>
                    <div className="input-group input-group-sm">
                      <input className="form-control bg-light border-0" placeholder="Enter coupon code" value={coupon} onChange={e => setCoupon(e.target.value)} />
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={applyCoupon}>Apply</button>
                    </div>
                    {couponApplied && <div className="small text-success mt-1">✓ Coupon applied!</div>}
                  </div>

                  <div className="col-12 mt-2">
                    <h6 className="fw-bold text-warning uppercase smallest mb-3">Payment Details (UPI)</h6>
                    <label className="form-label smallest fw-bold text-secondary uppercase">Enter UPI ID</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><QrCode size={16} /></span>
                      <input className="form-control bg-light border-0" placeholder="yourname@bank" value={formData.upi} onChange={e => setFormData({ ...formData, upi: e.target.value })} required />
                    </div>
                  </div>
                </div>

                {/* Fare summary — shows bugged counts/totals */}
                <div className="bg-light p-3 rounded-4 mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    {/* BUG-002: shows +1 seat count */}
                    <span className="text-secondary small">Seats Selected ({displaySeatCount})</span>
                    <span className="fw-bold">₹{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary small">Convenience Fee</span>
                    <span className="fw-bold">₹{serviceCharge}</span>
                  </div>
                  {/* BUG-025: GST shown and charged twice */}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary small">GST (5%)</span>
                    <span className="fw-bold">₹{gstDouble}</span>
                  </div>
                  {couponApplied && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      {/* BUG-012: discount shows 0 */}
                      <span className="small">Discount Applied</span>
                      <span className="fw-bold">- ₹0</span>
                    </div>
                  )}
                  <hr className="my-2 opacity-10" />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total Amount</span>
                    {/* BUG-004/018: inflated total */}
                    <span className="fw-bold text-primary fs-5">₹{displayTotal}</span>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
                    <CreditCard size={20} />
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingSection
