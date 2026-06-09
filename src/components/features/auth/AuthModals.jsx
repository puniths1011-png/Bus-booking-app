import React, { useState } from 'react'
import { User, Mail, Smartphone, Lock, UserPlus, LogIn, Eye, EyeOff, Bus, X } from 'lucide-react'
import { STORAGE_KEYS } from '../../../constants'

const RED = '#D84E55'

/* ── All helpers defined at MODULE level — never remount on state change ── */

function Field({ icon, type, placeholder, value, onChange, required, showToggle, visible, onToggle }) {
  const [focused, setFocused] = useState(false)
  const inputType = showToggle ? (visible ? 'text' : 'password') : (type || 'text')

  return (
    <div className="auth-field" style={{
      display: 'flex', alignItems: 'center', borderRadius: 10,
      border: `1.5px solid ${focused ? RED : '#e0e0e0'}`,
      background: '#fff',
      boxShadow: focused ? `0 0 0 3px rgba(216,78,85,0.12)` : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <span style={{ padding: '0 10px 0 13px', display: 'flex', alignItems: 'center', color: focused ? RED : '#c0c0c0', flexShrink: 0, transition: 'color 0.2s' }}>
        {icon}
      </span>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none',
          background: 'transparent', fontSize: 14, color: '#1a1a1a',
          padding: '12px 8px 12px 0', fontFamily: 'inherit',
        }}
      />
      {showToggle && (
        <button type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={onToggle}
          style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', color: '#c0c0c0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  )
}

const Lbl = ({ t }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#aaa', marginBottom: 7 }}>{t}</div>
)

const ErrBox = ({ msg }) => !msg ? null : (
  <div style={{ background: '#fff0f0', border: '1px solid rgba(216,78,85,0.25)', borderRadius: 8, padding: '9px 13px', fontSize: 13, color: RED, marginBottom: 14 }}>
    ⚠ {msg}
  </div>
)

const OkBox = ({ msg }) => !msg ? null : (
  <div style={{ background: '#edfcf2', border: '1px solid #86efac', borderRadius: 8, padding: '9px 13px', fontSize: 13, color: '#15803d', marginBottom: 14 }}>
    ✓ {msg}
  </div>
)

/* ── AuthModals ── */
function AuthModals({ setUser }) {
  const [sd, setSd] = useState({ fullname: '', email: '', phone: '', password: '' })
  const [ld, setLd] = useState({ id: '', password: '' })
  const [eye, setEye] = useState({ sp: false, lp: false })
  const [sErr, setSErr] = useState('')
  const [sOk,  setSOk]  = useState('')
  const [lErr, setLErr] = useState('')

  const getBsModal = (id) => {
    const el = document.getElementById(id)
    if (!el) return null
    return window.bootstrap?.Modal?.getInstance(el) || null
  }

  const closeModal = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    import('bootstrap').then(bs => {
      const m = bs.Modal.getInstance(el)
      if (m) m.hide()
    })
  }

  const openModal = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    import('bootstrap').then(bs => {
      let m = bs.Modal.getInstance(el)
      if (!m) m = new bs.Modal(el, { backdrop: true, keyboard: true })
      m.show()
    })
  }

  const switchToLogin  = (e) => { if (e) e.stopPropagation(); closeModal('signupModal'); setTimeout(() => openModal('loginModal'), 350) }
  const switchToSignup = (e) => { if (e) e.stopPropagation(); closeModal('loginModal');  setTimeout(() => openModal('signupModal'), 350) }

  const handleSignup = (e) => {
    e.preventDefault()
    setSErr('')
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    if (users.find(u => u.email === sd.email || u.phone === sd.phone))
      return setSErr('Account with this email or phone already exists.')
    users.push({ fullname: sd.fullname, email: sd.email, phone: sd.phone, password: sd.password })
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    setSOk('Account created! Taking you to login…')
    setSd({ fullname: '', email: '', phone: '', password: '' })
    setTimeout(() => { setSOk(''); switchToLogin() }, 1500)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLErr('')
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const user = users.find(u =>
      (u.email === ld.id || u.phone === ld.id) && u.password === ld.password
    )
    if (user) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
      setUser(user)
      setLd({ id: '', password: '' })
      closeModal('loginModal')
    } else {
      setLErr('Invalid email / phone or password.')
    }
  }

  const stopProp = (e) => e.stopPropagation()

  return (
    <>
      {/* ═══════════════ SIGNUP MODAL ═══════════════ */}
      <div className="modal fade" id="signupModal" tabIndex="-1" onClick={stopProp}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 460 }} onClick={stopProp}>
          <div className="modal-content" onClick={stopProp} style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,1)',
            borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
            overflow: 'visible',
          }}>
            {/* accent bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg,${RED},#f97316)`, borderRadius: '20px 20px 0 0' }} />

            <div style={{ padding: '24px 28px 28px', position: 'relative' }}>
              {/* orbs */}
              <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: RED, opacity: 0.05, top: -50, right: -40, pointerEvents: 'none' }} />

              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: `linear-gradient(135deg,${RED},#f97316)`, borderRadius: 10, padding: 9, display: 'flex', boxShadow: '0 4px 12px rgba(216,78,85,0.3)' }}>
                    <UserPlus size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a1a' }}>Create Account</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Join Abhi Bus — it's free</div>
                  </div>
                </div>
                <button type="button" data-bs-dismiss="modal"
                  style={{ background: '#f2f2f2', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777', flexShrink: 0 }}>
                  <X size={15} />
                </button>
              </div>

              {/* brand strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff5f5', border: '1px solid rgba(216,78,85,0.12)', borderRadius: 8, padding: '8px 12px', marginBottom: 18 }}>
                <Bus size={14} color={RED} />
                <span style={{ fontSize: 12, color: RED, fontWeight: 600 }}>Abhi Bus — Easy Ticketing From Home</span>
              </div>

              <OkBox  msg={sOk} />
              <ErrBox msg={sErr} />

              <form onSubmit={handleSignup}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  <div>
                    <Lbl t="FULL NAME" />
                    <Field icon={<User size={15} />} placeholder="Your full name"
                      value={sd.fullname} onChange={e => setSd(p => ({ ...p, fullname: e.target.value }))} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Lbl t="EMAIL" />
                      <Field icon={<Mail size={15} />} type="email" placeholder="you@email.com"
                        value={sd.email} onChange={e => setSd(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <div>
                      <Lbl t="PHONE" />
                      <Field icon={<Smartphone size={15} />} placeholder="10-digit mobile"
                        value={sd.phone} onChange={e => setSd(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))} required />
                    </div>
                  </div>

                  <div>
                    <Lbl t="PASSWORD" />
                    <Field icon={<Lock size={15} />} placeholder="Min 6 chars"
                      value={sd.password} onChange={e => setSd(p => ({ ...p, password: e.target.value }))}
                      showToggle visible={eye.sp} onToggle={() => setEye(p => ({ ...p, sp: !p.sp }))} required />
                  </div>

                  <button type="submit" style={{
                    marginTop: 2, padding: '13px 0', borderRadius: 10, border: 'none', width: '100%',
                    background: `linear-gradient(135deg,${RED},#f97316)`, color: '#fff',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer', letterSpacing: '0.02em',
                    boxShadow: '0 6px 20px rgba(216,78,85,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(216,78,85,0.42)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 6px 20px rgba(216,78,85,0.3)' }}>
                    Create Account →
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', margin: 0 }}>
                    Already have an account?{' '}
                    <span onClick={switchToLogin} style={{ color: RED, fontWeight: 700, cursor: 'pointer' }}>Log in</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ LOGIN MODAL ═══════════════ */}
      <div className="modal fade" id="loginModal" tabIndex="-1" onClick={stopProp}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }} onClick={stopProp}>
          <div className="modal-content" onClick={stopProp} style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,1)',
            borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
            overflow: 'visible',
          }}>
            {/* accent bar */}
            <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1,#D84E55)', borderRadius: '20px 20px 0 0' }} />

            <div style={{ padding: '24px 28px 28px', position: 'relative' }}>
              {/* orbs */}
              <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: '#6366f1', opacity: 0.05, top: -40, right: -30, pointerEvents: 'none' }} />

              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: 'linear-gradient(135deg,#6366f1,#D84E55)', borderRadius: 10, padding: 9, display: 'flex', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    <LogIn size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a1a' }}>Welcome Back</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Log in to your account</div>
                  </div>
                </div>
                <button type="button" data-bs-dismiss="modal"
                  style={{ background: '#f2f2f2', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777', flexShrink: 0 }}>
                  <X size={15} />
                </button>
              </div>

              {/* brand strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f5f5ff', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8, padding: '8px 12px', marginBottom: 18 }}>
                <Bus size={14} color="#6366f1" />
                <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Abhi Bus — Your journey, our priority</span>
              </div>

              <ErrBox msg={lErr} />

              <form onSubmit={handleLogin}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  <div>
                    <Lbl t="EMAIL OR PHONE" />
                    <Field icon={<User size={15} />} placeholder="Enter email or mobile"
                      value={ld.id} onChange={e => setLd(p => ({ ...p, id: e.target.value }))} required />
                  </div>

                  <div>
                    <Lbl t="PASSWORD" />
                    <Field icon={<Lock size={15} />} placeholder="Enter your password"
                      value={ld.password} onChange={e => setLd(p => ({ ...p, password: e.target.value }))}
                      showToggle visible={eye.lp} onToggle={() => setEye(p => ({ ...p, lp: !p.lp }))} required />
                  </div>

                  <button type="submit" style={{
                    marginTop: 2, padding: '13px 0', borderRadius: 10, border: 'none', width: '100%',
                    background: 'linear-gradient(135deg,#6366f1,#D84E55)', color: '#fff',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer', letterSpacing: '0.02em',
                    boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.45)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.3)' }}>
                    Log in →
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', margin: 0 }}>
                    New to Abhi Bus?{' '}
                    <span onClick={switchToSignup} style={{ color: RED, fontWeight: 700, cursor: 'pointer' }}>Create account</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthModals
