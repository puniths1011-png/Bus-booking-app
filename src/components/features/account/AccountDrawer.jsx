import React, { useState, useEffect } from 'react'
import {
  X, User, ChevronRight, Ticket, Wallet, Info, HelpCircle,
  XCircle, RefreshCw, Search, Bell, LogOut, Phone, Mail,
  Edit3, Check, AlertCircle
} from 'lucide-react'

const RED = '#D84E55'
const LOCKED_MSG = 'Please log in to access this feature.'

function AccountDrawer({ user, setUser, onOpenAuth }) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('menu') // 'menu' | 'personal' | 'wallet' | 'about' | 'help' | 'notifications'
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ fullname: '', phone: '', email: '' })
  const [formErr, setFormErr] = useState({})
  const [saved, setSaved] = useState(false)
  const [pnr, setPnr] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [actionErr, setActionErr] = useState('')
  const [actionOk, setActionOk] = useState('')

  useEffect(() => {
    if (user) setForm({ fullname: user.fullname || '', phone: user.phone || '', email: user.email || '' })
  }, [user])

  window.openAccountDrawer = () => { setIsOpen(true); setView('menu'); setPnr(''); setSearchResult(null); setActionErr(''); setActionOk('') }

  const close = () => { setIsOpen(false); setEditMode(false); setFormErr({}); setPnr(''); setSearchResult(null); setActionErr(''); setActionOk('') }
  const back = () => { setView('menu'); setEditMode(false); setFormErr({}); setPnr(''); setSearchResult(null); setActionErr(''); setActionOk('') }

  const guard = (fn) => () => {
    if (!user) { setView('locked'); return }
    fn()
  }

  const openBookings = () => {
    close()
    setTimeout(() => window.dispatchEvent(new Event('open-bookings-drawer')), 200)
  }

  const validateForm = () => {
    const errs = {}
    if (!form.fullname.trim()) errs.fullname = 'Name is required'
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter valid 10-digit mobile'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter valid email'
    setFormErr(errs)
    return Object.keys(errs).length === 0
  }

  const savePersonal = () => {
    if (!validateForm()) return
    const updated = { ...user, ...form }
    setUser(updated)
    sessionStorage.setItem('in_current_user', JSON.stringify(updated))
    // update in users list too
    try {
      const users = JSON.parse(localStorage.getItem('in_users') || '[]')
      const idx = users.findIndex(u => u.email === user.email || u.phone === user.phone)
      if (idx !== -1) { users[idx] = updated; localStorage.setItem('in_users', JSON.stringify(users)) }
    } catch (_) {}
    setEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('in_current_user')
    setUser(null)
    setView('menu')
    close()
  }

  const handlePnrAction = () => {
    setActionErr('')
    setActionOk('')
    setSearchResult(null)
    if (!pnr.trim()) return setActionErr('Please enter PNR number')

    try {
      const bookings = JSON.parse(localStorage.getItem('in_bus_bookings_v2') || '[]')
      const b = bookings.find(x => x.pnr.toLowerCase() === pnr.trim().toLowerCase())
      if (b) {
        setSearchResult(b)
      } else {
        setActionErr('PNR not found. Please check and try again.')
      }
    } catch (e) {
      setActionErr('Error searching for ticket.')
    }
  }

  const cancelBooking = (pnrToCancel) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return
    try {
      const bookings = JSON.parse(localStorage.getItem('in_bus_bookings_v2') || '[]')
      const idx = bookings.findIndex(b => b.pnr === pnrToCancel)
      if (idx !== -1) {
        bookings[idx].status = 'CANCELLED'
        localStorage.setItem('in_bus_bookings_v2', JSON.stringify(bookings))
        setSearchResult({ ...bookings[idx] })
        setActionOk('Ticket cancelled successfully.')
      }
    } catch (e) {
      setActionErr('Failed to cancel ticket.')
    }
  }

  const rescheduleBooking = () => {
    setActionOk('Reschedule request sent. Our team will contact you shortly.')
  }

  const menuSections = [
    {
      label: 'MY DETAILS',
      items: [
        { title: 'Bookings', icon: <Ticket size={19} />, action: guard(openBookings) },
        { title: 'Personal Information', icon: <User size={19} />, action: guard(() => setView('personal')) },
      ]
    },
    {
      label: 'PAYMENTS',
      items: [
        { title: 'Wallet', icon: <Wallet size={19} />, action: guard(() => setView('wallet')) },
      ]
    },
    {
      label: 'MORE',
      items: [
        { title: 'About Us', icon: <Info size={19} />, action: () => setView('about') },
        { title: 'Help', icon: <HelpCircle size={19} />, action: () => setView('help') },
        { title: 'Cancel Ticket', icon: <XCircle size={19} />, action: guard(() => setView('cancel')) },
        { title: 'Reschedule Ticket', icon: <RefreshCw size={19} />, action: guard(() => setView('reschedule')) },
        { title: 'Search Ticket', icon: <Search size={19} />, action: guard(() => setView('searchTicket')) },
        { title: 'Notifications', icon: <Bell size={19} />, action: guard(() => setView('notifications')) },
      ]
    }
  ]

  const drawerStyle = {
    position: 'fixed', top: 0, right: 0, height: '100vh', width: '360px', maxWidth: '100vw',
    background: '#fff', zIndex: 1051, boxShadow: '-4px 0 24px rgba(0,0,0,0.13)',
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.32s cubic-bezier(.4,0,.2,1)',
    display: 'flex', flexDirection: 'column', overflowY: 'auto'
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1050,
    opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
    transition: 'opacity 0.32s'
  }

  const inputCls = (field) =>
    `form-control form-control-sm rounded-3 ${formErr[field] ? 'is-invalid' : ''}`

  return (
    <>
      <div style={overlayStyle} onClick={close} />

      <div style={drawerStyle}>
        {/* ── Header ── */}
        <div style={{ borderBottom: '1px solid #f0f0f0', padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {view !== 'menu' && (
            <button onClick={back} style={{ background: 'none', border: 'none', padding: '4px 8px 4px 0', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
          <span style={{ fontWeight: 700, fontSize: 17, flex: 1, color: '#1a1a1a' }}>
            {view === 'menu' ? 'Account'
              : view === 'personal' ? 'Personal Information'
              : view === 'wallet' ? 'Wallet'
              : view === 'about' ? 'About Us'
              : view === 'help' ? 'Help & Support'
              : view === 'notifications' ? 'Notifications'
              : view === 'cancel' ? 'Cancel Ticket'
              : view === 'reschedule' ? 'Reschedule Ticket'
              : view === 'searchTicket' ? 'Search Ticket'
              : view === 'locked' ? 'Login Required'
              : 'Account'}
          </span>
          <button onClick={close} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#555', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* MENU VIEW */}
          {view === 'menu' && (
            <>
              {/* Profile strip */}
              <div style={{ padding: '20px 20px 16px', background: '#fff9f9', borderBottom: '1px solid #f0f0f0' }}>
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={26} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{user.fullname}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{user.phone} · {user.email}</div>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'none', border: `1px solid #eee`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: RED }}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <User size={30} color="#ccc" />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', margin: '0 0 14px' }}>Log in to manage your bookings</p>
                    <button
                      onClick={() => { close(); onOpenAuth('#loginModal') }}
                      style={{ background: RED, color: '#fff', border: 'none', borderRadius: 50, padding: '11px 0', width: '100%', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10, boxShadow: '0 4px 14px rgba(216,78,85,0.25)' }}
                    >
                      Log in
                    </button>
                    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                      Don't have an account?{' '}
                      <span
                        onClick={() => { close(); onOpenAuth('#signupModal') }}
                        style={{ color: RED, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Signup
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Menu sections */}
              {menuSections.map((section, si) => (
                <div key={si} style={{ padding: '12px 0 4px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.08em', padding: '0 20px 8px' }}>{section.label}</div>
                  {section.items.map((item, ii) => (
                    <button
                      key={ii}
                      onClick={item.action}
                      style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #f5f5f5', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ color: RED, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#222' }}>{item.title}</span>
                      <ChevronRight size={16} color="#ccc" />
                    </button>
                  ))}
                </div>
              ))}
              <div style={{ height: 24 }} />
            </>
          )}

          {/* LOCKED VIEW */}
          {view === 'locked' && (
            <div style={{ padding: 28, textAlign: 'center' }}>
              <AlertCircle size={48} color={RED} style={{ marginBottom: 16 }} />
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 8 }}>Login Required</p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>{LOCKED_MSG}</p>
              <button onClick={() => { close(); onOpenAuth('#loginModal') }}
                style={{ background: RED, color: '#fff', border: 'none', borderRadius: 50, padding: '11px 0', width: '100%', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Log in
              </button>
              <p style={{ fontSize: 13, color: '#888', marginTop: 12 }}>
                New here?{' '}
                <span onClick={() => { close(); onOpenAuth('#signupModal') }} style={{ color: RED, fontWeight: 700, cursor: 'pointer' }}>Signup</span>
              </p>
            </div>
          )}

          {/* PERSONAL INFO VIEW */}
          {view === 'personal' && user && (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={28} color="#fff" />
                </div>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    style={{ background: 'none', border: `1.5px solid ${RED}`, color: RED, borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Edit3 size={14} /> Edit
                  </button>
                ) : (
                  <button onClick={savePersonal}
                    style={{ background: RED, border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} /> Save
                  </button>
                )}
              </div>

              {saved && (
                <div style={{ background: '#eafaf1', border: '1px solid #b7ebcc', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#27ae60', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={15} /> Details saved successfully!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Full Name */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <User size={13} /> FULL NAME
                  </label>
                  {editMode ? (
                    <>
                      <input className={inputCls('fullname')} value={form.fullname}
                        onChange={e => setForm({ ...form, fullname: e.target.value })}
                        placeholder="Enter full name" style={{ borderColor: formErr.fullname ? RED : '#e5e7eb' }} />
                      {formErr.fullname && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{formErr.fullname}</div>}
                    </>
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{form.fullname || '—'}</div>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Phone size={13} /> MOBILE NUMBER
                  </label>
                  {editMode ? (
                    <>
                      <input className={inputCls('phone')} value={form.phone} maxLength={10}
                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="10-digit mobile" style={{ borderColor: formErr.phone ? RED : '#e5e7eb' }} />
                      {formErr.phone && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{formErr.phone}</div>}
                    </>
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{form.phone || '—'}</div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Mail size={13} /> EMAIL ID
                  </label>
                  {editMode ? (
                    <>
                      <input className={inputCls('email')} type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="Enter email" style={{ borderColor: formErr.email ? RED : '#e5e7eb' }} />
                      {formErr.email && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{formErr.email}</div>}
                    </>
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{form.email || '—'}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WALLET VIEW */}
          {view === 'wallet' && (
            <div style={{ padding: 28, textAlign: 'center' }}>
              <Wallet size={48} color={RED} style={{ marginBottom: 16 }} />
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Wallet Balance</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: RED, margin: '0 0 8px' }}>₹0.00</p>
              <p style={{ fontSize: 13, color: '#888' }}>Wallet top-up and cashback features coming soon.</p>
            </div>
          )}

          {/* ABOUT VIEW */}
          {view === 'about' && (
            <div style={{ padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Info size={28} color="#fff" />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>About Abhi Bus</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                Abhi Bus is your trusted travel partner for hassle-free bus ticket booking across India.
                We connect thousands of routes with top operators, offering AC, Non-AC and Sleeper coaches.
              </p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                Our mission is to make bus travel simple, affordable and reliable for every passenger.
              </p>
            </div>
          )}

          {/* HELP VIEW */}
          {view === 'help' && (
            <div style={{ padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <HelpCircle size={28} color="#fff" />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Help & Support</p>
              {[
                { q: 'How do I cancel a ticket?', a: 'Go to More → Cancel Ticket and enter your PNR.' },
                { q: 'How do I reschedule?', a: 'Go to More → Reschedule Ticket to change your travel date.' },
                { q: 'How do I get my e-ticket?', a: 'Open My Bookings and click "Get Ticket (PDF)".' },
                { q: 'Support email', a: 'support@abhibus.in' },
              ].map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', margin: '0 0 4px' }}>{item.q}</p>
                  <p style={{ fontSize: 13, color: '#777', margin: 0 }}>{item.a}</p>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS VIEW */}
          {view === 'notifications' && (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Bell size={22} color={RED} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
              </div>
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb' }}>
                <Bell size={40} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 13 }}>No new notifications</p>
              </div>
            </div>
          )}

          {/* CANCEL / RESCHEDULE / SEARCH TICKET — with actual logic */}
          {(view === 'cancel' || view === 'reschedule' || view === 'searchTicket') && (
            <div style={{ padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {view === 'cancel' && <XCircle size={28} color={RED} />}
                {view === 'reschedule' && <RefreshCw size={28} color={RED} />}
                {view === 'searchTicket' && <Search size={28} color={RED} />}
              </div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                {view === 'cancel' ? 'Cancel Ticket' : view === 'reschedule' ? 'Reschedule Ticket' : 'Search Ticket'}
              </p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Enter your PNR to continue.</p>
              
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-control form-control-sm rounded-3 mb-3" 
                  placeholder="Enter PNR number" 
                  style={{ borderColor: actionErr ? RED : '#e5e7eb', paddingRight: 40 }} 
                  value={pnr}
                  onChange={e => setPnr(e.target.value)}
                />
                {pnr && (
                  <button 
                    onClick={() => { setPnr(''); setSearchResult(null); setActionErr(''); setActionOk('') }}
                    style={{ position: 'absolute', right: 10, top: 7, background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {actionErr && <div style={{ fontSize: 12, color: RED, marginBottom: 15 }}>{actionErr}</div>}
              {actionOk && <div style={{ fontSize: 12, color: '#27ae60', marginBottom: 15 }}>{actionOk}</div>}

              {!searchResult && (
                <button 
                  onClick={handlePnrAction}
                  style={{ background: RED, color: '#fff', border: 'none', borderRadius: 50, padding: '11px 0', width: '100%', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  Search Ticket
                </button>
              )}

              {searchResult && (
                <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 16, border: '1px solid #eee', marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>PNR: {searchResult.pnr}</span>
                    <span style={{ 
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                      background: searchResult.status === 'PAID' ? '#eafaf1' : '#fff0f1',
                      color: searchResult.status === 'PAID' ? '#27ae60' : RED
                    }}>{searchResult.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{searchResult.from} → {searchResult.to}</div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>{searchResult.date} at {searchResult.time}</div>
                  
                  {view === 'searchTicket' && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <div style={{ marginBottom: 4 }}>Bus: <strong>{searchResult.bus}</strong></div>
                      <div>Passenger: <strong>{searchResult.name}</strong></div>
                    </div>
                  )}

                  {view === 'cancel' && searchResult.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => cancelBooking(searchResult.pnr)}
                      style={{ background: RED, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', width: '100%', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 12 }}
                    >
                      Confirm Cancellation
                    </button>
                  )}

                  {view === 'reschedule' && searchResult.status !== 'CANCELLED' && (
                    <button 
                      onClick={rescheduleBooking}
                      style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', width: '100%', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 12 }}
                    >
                      Request Reschedule
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AccountDrawer
