"use client";

import { useEffect, useRef, useState } from "react";

type SubmitState = "idle" | "sending" | "sent";

const CONTACT_ITEMS = [
  {
    label: "Email Us",
    value: "info@mapcars.uk",
    href: "mailto:info@mapcars.uk",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
  },
  {
    label: "Location",
    value: "Chichester, United Kingdom",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "01243 252255",
    href: "tel:01243252255",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
  },
  {
    label: "Mobile",
    value: "+44-73-8907-7004",
    href: "tel:+44-73-8907-7004",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    value: "+44 7389 077004",
    href: "https://wa.me/447389077004",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.87L4 20l4.24-1.11a7.9 7.9 0 0 0 3.8.97h.01a7.94 7.94 0 0 0 5.55-13.54zm-5.55 12.22h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.51.66.67-2.45-.16-.25a6.6 6.6 0 1 1 12.24-3.5 6.55 6.55 0 0 1-6.63 6.6zm3.61-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.15-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34h-.37c-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.62 0 .96.7 1.89.79 2.02.1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23z"></path>
      </svg>
    ),
  },
];

export default function Contact() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitState !== "idle") return;
    setSubmitState("sending");
    timersRef.current.push(
      window.setTimeout(() => {
        setSubmitState("sent");
        timersRef.current.push(
          window.setTimeout(() => {
            setSubmitState("idle");
            formRef.current?.reset();
          }, 3000),
        );
      }, 1500),
    );
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        <div className="contact-grid">
          <div className="contact-info fade-in-left" id="contact-info">
            <span className="section-tag">Get in Touch</span>
            <h2 className="section-title">
              Let&apos;s Start a <span className="gradient-text">Conversation</span>
            </h2>
            <p className="section-desc">
              Have questions about MapCars? Want to become a driver partner?
              We&apos;d love to hear from you. Drop us a message and we&apos;ll
              get back to you shortly.
            </p>

            <div className="contact-details">
              {CONTACT_ITEMS.map((item) => (
                <div className="contact-item" key={item.label}>
                  <div className="contact-icon">{item.icon}</div>
                  <div>
                    <span className="contact-label">{item.label}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="contact-value"
                        {...(item.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="contact-value">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-wrapper fade-in-right" id="contact-form-wrapper">
            <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first-name">First Name</label>
                  <input type="text" id="first-name" name="first-name" placeholder="John" required />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last Name</label>
                  <input type="text" id="last-name" name="last-name" placeholder="Doe" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" required defaultValue="">
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option value="rider">I&apos;m a Rider</option>
                  <option value="driver">I want to Drive</option>
                  <option value="business">Business Inquiry</option>
                  <option value="press">Press &amp; Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="form-submit"
                disabled={submitState !== "idle"}
                style={
                  submitState === "sent"
                    ? { background: "linear-gradient(135deg, #10B981, #059669)" }
                    : submitState === "sending"
                      ? { opacity: 0.7 }
                      : undefined
                }
              >
                {submitState === "idle" && (
                  <>
                    <span>Send Message</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </>
                )}
                {submitState === "sending" && (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24" width="20" height="20">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                    <span>Sending...</span>
                  </>
                )}
                {submitState === "sent" && (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Message Sent!</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
