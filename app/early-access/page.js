import RegistrationForm from '../../components/RegistrationForm';
export const metadata = {
  title: 'Early Access'
};
export default function EarlyAccess() {
  return <main id="main" className="registration-page"><div className="registration-photo" /><section className="registration-panel"><div className="registration-intro"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h1>Be among the first to experience <span>Oasis Apartments.</span></h1><p>Discover a new standard of comfort, luxury, and exceptional living.</p><strong>Get early access today!</strong></div><RegistrationForm /></section></main>;
}
