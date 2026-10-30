export function validateRegistration(input) {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const fullName = typeof value.fullName === 'string' ? value.fullName.trim().replace(/\s+/g, ' ') : '';
  const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
  const rawPhone = typeof value.phone === 'string' ? value.phone.trim() : '';
  const phone = rawPhone.replace(/[\s().-]/g, '');
  const errors = {};
  if (fullName.length < 2 || fullName.length > 120 || !/\p{L}/u.test(fullName) || /[\p{Cc}<>]/u.test(fullName)) errors.fullName = 'Please enter your full name (2–120 characters).';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (rawPhone.length > 40 || !/^\+?[0-9]{7,15}$/.test(phone)) errors.phone = 'Enter a valid phone number with 7–15 digits, including your country code if outside Nigeria.';
  return {
    data: {
      fullName,
      email,
      phone
    },
    errors,
    valid: Object.keys(errors).length === 0
  };
}
