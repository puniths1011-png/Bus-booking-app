import React from 'react'

function Hero() {
  return (
    <div 
      className="position-relative overflow-hidden mb-5"
      style={{
        background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("/HomeBanner.webp") center/cover no-repeat',
        padding: '120px 0',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        imageRendering: '-webkit-optimize-contrast',
        backgroundColor: '#1a1a1a'
      }}
    >
      <div className="container text-center text-white">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h1 className="display-2 fw-bold mb-4 animate-fade" style={{ animationDelay: '0.1s', textShadow: '2px 2px 10px rgba(0,0,0,0.3)' }}>
              Your Journey, <span style={{ color: '#D84E55' }}>Your Way</span>
            </h1>
            <p className="lead fs-3 mb-5 animate-fade mx-auto" style={{ animationDelay: '0.2s', maxWidth: '850px', fontWeight: 500 }}>
              India's No. 1 Online Bus Ticket Booking Platform. Compare prices, check seat availability and book your tickets in just a few clicks.
            </p>
            
            <div className="animate-fade" style={{ animationDelay: '0.3s' }}>
              <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-4 p-3 px-4 border border-white border-opacity-25">
                  <h4 className="fw-bold mb-1">10,000+</h4>
                  <p className="small mb-0 opacity-75">Routes across India</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-4 p-3 px-4 border border-white border-opacity-25">
                  <h4 className="fw-bold mb-1">2,500+</h4>
                  <p className="small mb-0 opacity-75">Bus Operators</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-4 p-3 px-4 border border-white border-opacity-25">
                  <h4 className="fw-bold mb-1">100M+</h4>
                  <p className="small mb-0 opacity-75">Happy Travelers</p>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="badge rounded-pill px-4 py-2" style={{ backgroundColor: 'rgba(216,78,85,0.9)', fontSize: '0.9rem' }}>
                  <i className="bi bi-shield-check me-2"></i>Safe & Secure Booking • Instant Refunds
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
