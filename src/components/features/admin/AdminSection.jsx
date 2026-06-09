import React, { useState, useMemo } from 'react'
import { Settings, Trash2 } from 'lucide-react'
import { STORAGE_KEYS } from '../../../constants'

function AdminSection() {
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]')
    } catch {
      return []
    }
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = 
        b.pnr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone?.includes(searchTerm) ||
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bus?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [bookings, searchTerm, statusFilter])

  const handleStatusChange = (pnr, newStatus) => {
    const updated = bookings.map(b => b.pnr === pnr ? { ...b, status: newStatus } : b)
    setBookings(updated)
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated))
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all bookings? This cannot be undone.")) {
      setBookings([])
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS)
    }
  }

  return (
    <div className="container py-5 animate-fade">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <Settings className="text-primary" />
                Admin Dashboard
              </h4>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-2" onClick={handleClearAll}>
                <Trash2 size={16} /> Clear All
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr className="small text-secondary fw-bold text-uppercase">
                  <th>PNR</th>
                  <th>Passenger</th>
                  <th>Bus & Route</th>
                  <th>Date & Time</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.pnr} className="small">
                    <td className="mono fw-bold text-primary">{b.pnr}</td>
                    <td>{b.name}</td>
                    <td>{b.bus}</td>
                    <td>{b.date} {b.time}</td>
                    <td className="fw-bold text-dark">₹{b.total}</td>
                    <td>{b.status}</td>
                    <td className="text-end">
                      <button className="btn btn-light btn-sm" onClick={() => handleStatusChange(b.pnr, 'CANCELLED')}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSection
