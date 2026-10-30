'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { validateRegistration } from '../lib/validation.mjs';
import Icon from './Icon';
export default function RegistrationForm() {
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const success = useRef(null);
  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const validation = validateRegistration(data);
    setErrors(validation.errors);
    setMessage('');
    if (!validation.valid) {
      form.elements[Object.keys(validation.errors)[0]]?.focus();
      return;
    }
    pending.current = true;
    setStatus('loading');
    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...validation.data,
          website: data.website
        }),
        signal: AbortSignal.timeout(20000)
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {});
        throw new Error(result.message || 'We couldn’t complete your registration. Please try again.');
      }
      setStatus('success');
      requestAnimationFrame(() => success.current?.focus());
    } catch (error) {
      setStatus('idle');
      setMessage(error.name === 'TimeoutError' ? 'The request took too long. Please try again.' : error.message === 'Failed to fetch' ? 'Please check your connection and try again.' : error.message);
    } finally {
      pending.current = false;
    }
  }
  if (status === 'success') return <div className="success" tabIndex={-1} ref={success} role="status"><Icon name="check" width="64" height="64" /><h2>You&apos;re on the List!</h2><p>Thank you for registering your interest in The Oasis Abeokuta. We&apos;ll keep you updated on our official launch and booking availability.</p><Link className="button" href="/">Back to Home <span aria-hidden="true">→</span></Link></div>;
  return <form className="registration-form" onSubmit={submit} noValidate aria-busy={status === 'loading'}><div className="form-heading"><h2>Your invitation to exceptional living</h2><p>Leave your details. We&apos;ll be in touch when it&apos;s time.</p></div>{[['fullName', 'Full Name', 'text', 'name', 'Your full name'], ['phone', 'Phone Number', 'tel', 'tel', 'e.g. +234 801 234 5678'], ['email', 'Email Address', 'email', 'email', 'you@example.com']].map(([name, label, type, autoComplete, placeholder]) => <div className="field" key={name}><label htmlFor={name}>{label} <span aria-hidden="true">*</span></label><input id={name} name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} required maxLength={name === 'fullName' ? 120 : name === 'email' ? 254 : 40} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} disabled={status === 'loading'} />{errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}</div>)}<div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this blank</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>{message && <p className="form-error" role="alert">{message}</p>}<button className="button submit-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Registering…' : 'Register for Early Access'} <span aria-hidden="true">{status === 'loading' ? '◌' : '→'}</span></button><p className="privacy-note">Your details will only be used to contact you about The Oasis Abeokuta&apos;s launch and booking availability.</p></form>;
}
