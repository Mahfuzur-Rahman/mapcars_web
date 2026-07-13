"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCREEN_COUNT = 6;
const SWITCH_INTERVAL_MS = 3800;
const TRANSITION_MS = 600;

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

export default function PhoneMockup() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const currentRef = useRef(0);
  const lockedRef = useRef(false);

  const goTo = useCallback((next: number) => {
    if (lockedRef.current || next === currentRef.current) return;
    lockedRef.current = true;
    setExiting(currentRef.current);
    setCurrent(next);
    currentRef.current = next;
    window.setTimeout(() => {
      setExiting(null);
      lockedRef.current = false;
    }, TRANSITION_MS);
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => goTo((currentRef.current + 1) % SCREEN_COUNT),
      SWITCH_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [goTo]);

  const screenClass = (i: number) =>
    `pscreen${i === current ? " active" : ""}${i === exiting ? " exiting" : ""}`;

  return (
    <div className="css-phone iphone" id="iphone-phone">
      <div className="phone-notch"></div>
      <div className="phone-screen">
        <div className="screen-status-bar">
          <span>9:41</span>
          <div className="status-icons">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="2" y="6" width="3" height="12" rx="1" />
              <rect x="7" y="4" width="3" height="14" rx="1" />
              <rect x="12" y="8" width="3" height="10" rx="1" />
              <rect x="17" y="2" width="3" height="16" rx="1" />
            </svg>
            <svg width="20" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="1" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
              <rect x="3" y="8" width="10" height="8" rx="1" fill="white" />
              <rect x="20" y="9" width="2" height="6" rx="1" />
            </svg>
          </div>
        </div>

        <div className="phone-screens-container" id="iphone-screens">
          {/* Screen 1: Home / Book a Ride */}
          <div className={screenClass(0)}>
            <div className="screen-app">
              <div className="app-header">
                <div className="app-logo-small">B</div>
                <span className="app-title">MapCars</span>
                <div className="app-avatar"></div>
              </div>
              <div className="app-greeting">Good morning!</div>
              <div className="app-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Where to?</span>
              </div>
              <div className="app-map-preview">
                <div className="map-route-line"></div>
                <div className="map-pin-a"><div className="pin-icon-small">A</div></div>
                <div className="map-pin-b"><div className="pin-icon-small">B</div></div>
                <div className="map-car-icon"><CarIcon /></div>
              </div>
              <div className="app-ride-card">
                <div className="ride-info">
                  <span className="ride-type">MapCars Go</span>
                  <span className="ride-time">4 min away</span>
                </div>
                <div className="ride-price">£12.50</div>
              </div>
              <div className="app-book-btn">Book Ride</div>
            </div>
          </div>

          {/* Screen 2: Ride in Progress */}
          <div className={screenClass(1)}>
            <div className="screen-app">
              <div className="app-header">
                <div className="app-logo-small">B</div>
                <span className="app-title">On the way</span>
                <div className="live-badge">LIVE</div>
              </div>
              <div className="app-map-preview tall-map">
                <div className="map-route-line animated-route"></div>
                <div className="map-pin-a"><div className="pin-icon-small">A</div></div>
                <div className="map-pin-b"><div className="pin-icon-small">B</div></div>
                <div className="map-car-icon moving-car"><CarIcon /></div>
                <div className="eta-bubble">2 min</div>
              </div>
              <div className="inprogress-card">
                <div className="driver-row">
                  <div className="driver-avatar large-av"></div>
                  <div className="driver-info">
                    <span className="driver-name">James M.</span>
                    <span className="driver-rating">★ 4.8 · BMW 5 Series</span>
                  </div>
                  <div className="call-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                    </svg>
                  </div>
                </div>
                <div className="plate-row">
                  <span className="plate-label">Plate</span>
                  <span className="plate-num">LK21 BNB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Screen 3: Rate Your Ride */}
          <div className={screenClass(2)}>
            <div className="screen-app">
              <div className="app-header">
                <div className="app-logo-small">B</div>
                <span className="app-title">Rate your ride</span>
              </div>
              <div className="rate-hero">
                <div className="rate-avatar"></div>
                <div className="rate-name">James M.</div>
                <div className="rate-trip-info">Portsmouth → Brighton</div>
                <div className="rate-price-big">£12.50</div>
              </div>
              <div className="stars-row">
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star">☆</span>
              </div>
              <div className="rate-tags">
                <span className="rate-tag selected">Great driver</span>
                <span className="rate-tag">Clean car</span>
                <span className="rate-tag selected">On time</span>
              </div>
              <div className="app-book-btn rate-btn">Submit Rating</div>
            </div>
          </div>

          {/* Screen 4: My Trips */}
          <div className={screenClass(3)}>
            <div className="screen-app">
              <div className="app-header">
                <div className="app-logo-small">B</div>
                <span className="app-title">My Trips</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="android-trip-card">
                <div className="trip-status active-trip">In Progress</div>
                <div className="trip-route">
                  <div className="trip-dot start"></div>
                  <div className="trip-line-v"></div>
                  <div className="trip-dot end"></div>
                  <div className="trip-locations">
                    <span>Portsmouth</span>
                    <span>Brighton</span>
                  </div>
                </div>
                <div className="trip-driver">
                  <div className="driver-avatar"></div>
                  <div className="driver-info">
                    <span className="driver-name">Ahmed K.</span>
                    <span className="driver-rating">★ 4.9</span>
                  </div>
                  <div className="driver-car">Toyota Prius</div>
                </div>
              </div>
              <div className="android-trip-card past">
                <div className="trip-status">Completed · Yesterday</div>
                <div className="trip-route">
                  <div className="trip-dot start"></div>
                  <div className="trip-line-v"></div>
                  <div className="trip-dot end"></div>
                  <div className="trip-locations">
                    <span>Fareham</span>
                    <span>Southampton</span>
                  </div>
                </div>
                <div className="trip-price-row">
                  <span>£8.40</span>
                  <span className="trip-date">10:15 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Screen 5: Wallet */}
          <div className={screenClass(4)}>
            <div className="screen-app">
              <div className="app-header">
                <div className="app-logo-small">B</div>
                <span className="app-title">Wallet</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="wallet-balance-card">
                <div className="wallet-label">MapCars Credits</div>
                <div className="wallet-amount">£24.00</div>
                <div className="wallet-sub">+£5 bonus this week</div>
              </div>
              <div className="wallet-section-title">Recent Transactions</div>
              <div className="wallet-txn">
                <div className="txn-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div className="txn-info">
                  <span className="txn-name">Ride · Portsmouth</span>
                  <span className="txn-date">Today</span>
                </div>
                <span className="txn-amount minus">-£12.50</span>
              </div>
              <div className="wallet-txn">
                <div className="txn-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="txn-info">
                  <span className="txn-name">Top Up</span>
                  <span className="txn-date">Yesterday</span>
                </div>
                <span className="txn-amount plus">+£20.00</span>
              </div>
              <div className="wallet-txn">
                <div className="txn-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div className="txn-info">
                  <span className="txn-name">Ride · Brighton</span>
                  <span className="txn-date">Mon</span>
                </div>
                <span className="txn-amount minus">-£8.40</span>
              </div>
            </div>
          </div>

          {/* Screen 6: Profile */}
          <div className={screenClass(5)}>
            <div className="screen-app">
              <div className="app-header">
                <div className="app-logo-small">B</div>
                <span className="app-title">Profile</span>
              </div>
              <div className="profile-hero">
                <div className="profile-av"></div>
                <div className="profile-name">Sarah L.</div>
                <div className="profile-rides">127 rides completed</div>
              </div>
              <div className="profile-stat-row">
                <div className="pstat"><span className="pstat-num">4.9</span><span className="pstat-label">Rating</span></div>
                <div className="pstat"><span className="pstat-num">£312</span><span className="pstat-label">Spent</span></div>
                <div className="pstat"><span className="pstat-num">6mo</span><span className="pstat-label">Member</span></div>
              </div>
              <div className="profile-menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Notifications</span>
                <span className="chevron">›</span>
              </div>
              <div className="profile-menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Safety</span>
                <span className="chevron">›</span>
              </div>
              <div className="profile-menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M20 12V22H4V12" />
                  <path d="M22 7H2v5h20V7z" />
                  <path d="M12 22V7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                <span>Referral Rewards</span>
                <span className="chevron">›</span>
              </div>
            </div>
          </div>
        </div>

        <div className="screen-dots" id="iphone-dots">
          {Array.from({ length: SCREEN_COUNT }, (_, i) => (
            <span
              key={i}
              className={`sdot${i === current ? " active" : ""}`}
              onClick={() => goTo(i)}
            ></span>
          ))}
        </div>
      </div>
      <div className="phone-home-bar"></div>
    </div>
  );
}
