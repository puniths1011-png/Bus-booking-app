import React, { useState } from 'react'
import { X, CreditCard, User, Phone, Mail, QrCode } from 'lucide-react'
import { STORAGE_KEYS, SERVICE_CHARGE_RATE } from '../../../constants'

function BookingSection({ trip, onClose, onConfirm }) {
  const [selectedSeats, setSelectedSeats] = useState(new Set())
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    upi: '',
    paymentMethod: 'UPI'
  })

  const rows = 10
  const cols = ['A', 'B', 'aisle', 'C', 'D']

  const toggleSeat = (code) => {
    const next = new Set(selectedSeats)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    setSelectedSeats(next)
  }

  const subtotal = selectedSeats.size * trip.price
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE)
  const total = subtotal + serviceCharge

  const handlePay = (e) => {
    e.preventDefault()
    if (selectedSeats.size === 0) return alert("Please select at least one seat")
    if (!formData.name || !formData.phone || !formData.email || !formData.upi) return alert("Please fill in all passenger and payment details")

    const bookingObj = {
      pnr: `IN-${Date.now().toString(36).toUpperCase()}`,
      status: 'PAID',
      bus: trip.bus,
      from: trip.from,
      to: trip.to,
      date: trip.date,
      time: trip.depTime,
      seats: [...selectedSeats],
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      upi: formData.upi,
      total: total,
      createdAt: new Date().toISOString()
    }

    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]')
    all.push(bookingObj)
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(all))
    
    alert(`Booking confirmed! PNR: ${bookingObj.pnr}`)
    
    if (window.confirm("Would you like to print your ticket now?")) {
      printTicket(bookingObj)
    }
    
    onConfirm()
  }

  const printTicket = (booking) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${booking.pnr}</title>
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
                  <small class="text-secondary fw-bold uppercase">PNR NUMBER</small>
                  <h4 class="fw-bold text-warning">${booking.pnr}</h4>
                </div>
                <div class="col-6 text-end">
                  <small class="text-secondary fw-bold uppercase">BOOKING DATE</small>
                  <div class="fw-semibold">${new Date(booking.createdAt).toLocaleDateString()}</div>
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
                <div class="col-4">
                  <small class="text-secondary fw-bold">TRAVEL DATE</small>
                  <div class="fw-bold">${booking.date}</div>
                </div>
                <div class="col-4">
                  <small class="text-secondary fw-bold">TIME</small>
                  <div class="fw-bold">${booking.time}</div>
                </div>
                <div class="col-4">
                  <small class="text-secondary fw-bold">SEATS</small>
                  <div class="fw-bold">${booking.seats.join(', ')}</div>
                </div>
              </div>
              <hr>
              <div class="row">
                <div class="col-6">
                  <small class="text-secondary fw-bold">PASSENGER</small>
                  <div class="fw-bold">${booking.name}</div>
                  <small class="text-muted">${booking.email}</small>
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
          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100 border border-warning border-opacity-25">
              <h6 className="fw-bold mb-4 text-secondary uppercase smallest">Select Seats</h6>
              <div className="d-grid gap-2 justify-content-center" style={{ gridTemplateColumns: 'repeat(5, 40px)' }}>
                {Array.from({ length: rows }).map((_, r) => (
                  cols.map(c => {
                    if (c === 'aisle') return <div key={`aisle-${r}`} style={{ width: '20px' }} />
                    const code = `${r + 1}${c}`
                    const isSelected = selectedSeats.has(code)
                    return (
                      <button 
                        key={code}
                        className={`btn btn-sm p-0 d-flex align-items-center justify-content-center rounded-2 fw-bold mono ${
                          isSelected ? 'btn-primary' : 'btn-outline-secondary opacity-50'
                        }`}
                        style={{ width: '40px', height: '40px', fontSize: '11px' }}
                        onClick={() => toggleSeat(code)}
                      >
                        {code}
                      </button>
                    )
                  })
                ))}
              </div>
              <div className="mt-4 d-flex justify-content-center gap-3">
                <div className="small d-flex align-items-center gap-1 text-secondary">
                  <div className="bg-primary rounded-1" style={{ width: '12px', height: '12px' }} /> Selected
                </div>
                <div className="small d-flex align-items-center gap-1 text-secondary">
                  <div className="bg-outline-secondary border rounded-1 opacity-50" style={{ width: '12px', height: '12px' }} /> Available
                </div>
              </div>
            </div>
          </div>

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
                      <input className="form-control bg-light border-0" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label smallest fw-bold text-secondary uppercase">Phone</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><Phone size={16} /></span>
                      <input className="form-control bg-light border-0" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label smallest fw-bold text-secondary uppercase">Email Address</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><Mail size={16} /></span>
                      <input type="email" className="form-control bg-light border-0" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <h6 className="fw-bold text-warning uppercase smallest mb-3">Payment Details (UPI)</h6>
                    <label className="form-label smallest fw-bold text-secondary uppercase">Enter UPI ID</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-0"><QrCode size={16} /></span>
                      <input 
                        className="form-control bg-light border-0" 
                        placeholder="yourname@bank" 
                        value={formData.upi} 
                        onChange={e => setFormData({...formData, upi: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-light p-3 rounded-4 mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary small">Seats Selection ({selectedSeats.size})</span>
                    <span className="fw-bold">₹{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary small">Convenience Fee</span>
                    <span className="fw-bold">₹{serviceCharge}</span>
                  </div>
                  <hr className="my-2 opacity-10" />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total Amount</span>
                    <span className="fw-bold text-primary fs-5">₹{total}</span>
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
