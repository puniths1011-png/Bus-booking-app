import React, { useState, useEffect } from 'react'
import { Info, Ticket, Printer } from 'lucide-react'
import { STORAGE_KEYS } from '../../../constants'

function MyBookingsDrawer({ user }) {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!user) {
      setBookings([])
      return
    }

    const handleStorageChange = () => {
      try {
        setBookings(JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]').reverse())
      } catch {
        setBookings([])
      }
    }

    handleStorageChange()
    window.addEventListener('storage', handleStorageChange)

    const openHandler = () => {
      import('bootstrap').then(bs => {
        const el = document.getElementById('offcanvasBookings')
        if (el) new bs.Offcanvas(el).show()
      })
    }
    window.addEventListener('open-bookings-drawer', openHandler)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('open-bookings-drawer', openHandler)
    }
  }, [user])

  const printTicket = (booking) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${booking.pnr}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print { .no-print { display: none; } }
            body { background: #f8f9fa; font-family: sans-serif; padding: 20px; }
            .ticket-card { border: 2px dashed #dee2e6; background: white; border-radius: 1rem; max-width: 600px; margin: auto; }
            .header { background: #f59e0b; color: white; padding: 20px; border-radius: 1rem 1rem 0 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">
              <h3 class="mb-0">Abhi Bus Ticket</h3>
              <small>PNR: ${booking.pnr}</small>
            </div>
            <div class="p-4">
              <div class="row mb-3 text-center bg-light p-2 rounded">
                <div class="col-5 fw-bold">${booking.from}</div>
                <div class="col-2">→</div>
                <div class="col-5 fw-bold">${booking.to}</div>
              </div>
              <div class="mb-2"><strong>Bus:</strong> ${booking.bus}</div>
              <div class="mb-2"><strong>Travel Date:</strong> ${booking.date} at ${booking.time}</div>
              <div class="mb-2"><strong>Seats:</strong> ${booking.seats.join(', ')}</div>
              <div class="mb-4"><strong>Passenger:</strong> ${booking.name} (${booking.phone})</div>
              <div class="text-end border-top pt-2">
                <h4 class="fw-bold">Total Paid: ₹${booking.total}</h4>
              </div>
            </div>
          </div>
          <div class="text-center mt-3 no-print">
            <button class="btn btn-warning" onclick="window.print()">Print Ticket</button>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="offcanvas offcanvas-end border-0 shadow" tabIndex="-1" id="offcanvasBookings" aria-labelledby="offcanvasBookingsLabel">
      <div className="offcanvas-header bg-white border-bottom py-3">
        <h5 className="offcanvas-title fw-bold d-flex align-items-center gap-2" id="offcanvasBookingsLabel">
          <Ticket className="text-primary" />
          My Bookings History
        </h5>
        <button type="button" className="btn-close shadow-none" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body bg-light p-3">
        {!user ? (
          <div className="text-center py-5">
            <Info size={40} className="text-secondary opacity-25 mb-3" />
            <p className="text-secondary small fw-semibold">Please log in to view your bookings.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <Info size={40} className="text-secondary opacity-25 mb-3" />
            <p className="text-secondary small fw-semibold">No bookings found.</p>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {bookings.map(b => (
              <div key={b.pnr} className="card border-0 shadow-sm rounded-4 overflow-hidden animate-fade">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold text-primary small mb-1">{b.bus}</div>
                      <div className="fw-bold fs-6">{b.from} → {b.to}</div>
                    </div>
                    <span className="badge bg-success-subtle text-success rounded-pill smallest">PAID</span>
                  </div>
                  
                  <div className="row g-2 mb-3 border-bottom pb-2">
                    <div className="col-6">
                      <div className="smallest text-secondary fw-bold uppercase">DATE</div>
                      <div className="small fw-semibold">{b.date}</div>
                    </div>
                    <div className="col-6">
                      <div className="smallest text-secondary fw-bold uppercase">TIME</div>
                      <div className="small fw-semibold mono">{b.time}</div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="smallest text-secondary fw-bold uppercase">PNR</div>
                      <div className="small fw-bold text-warning mono">{b.pnr}</div>
                    </div>
                    <div className="text-end">
                      <div className="smallest text-secondary fw-bold uppercase">TOTAL</div>
                      <div className="small fw-bold text-dark">₹{b.total}</div>
                    </div>
                  </div>

                  <div className="d-grid">
                    <button 
                      className="btn btn-primary btn-sm rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                      onClick={() => printTicket(b)}
                    >
                      <Printer size={14} /> Get Ticket (PDF)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookingsDrawer
