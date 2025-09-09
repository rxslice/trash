import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import AiConsultingSurvey from './AiConsultingSurvey';
import type { SurveyResponses } from '../types';

// --- Icon Components ---
const Lock = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const Eye = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>;
const AlertTriangle = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>;

// --- Auth Screen Components (Defined outside main wrapper) ---

const AuthCard = ({ children, wide }: { children: React.ReactNode, wide?: boolean }) => (
  <div className="auth-container">
    <div className={`auth-card ${wide ? 'auth-card--wide' : ''}`}>
      {children}
    </div>
  </div>
);

interface RegistrationScreenProps { onRegister: (username: string, password: string) => void; }
const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) { setError('Password fields cannot be empty.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    setError('');
    onRegister('user', password);
  };

  return (
    <AuthCard>
        <h1 className="auth-title">Create Your Secure Vault</h1>
        <p className="auth-subtitle">Create a local password to encrypt and protect your assessment data on this device.</p>
      
      <div className="info-box">
        <AlertTriangle className="info-box__icon" />
        <div>
          <strong >Important:</strong> This password CANNOT be recovered. Please write it down and store it in a safe place, like a password manager.
        </div>
      </div>
      <form onSubmit={handleRegister} className="auth-form">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="Enter Password (min 8 characters)" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="auth-input" placeholder="Confirm Password" />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button">Create & Secure</button>
      </form>
    </AuthCard>
  );
};

interface LoginScreenProps { onLogin: (password: string) => boolean; }
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError('Incorrect password. Please try again.');
    }
  };
  
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear everything? This action is irreversible and will delete your account and all saved progress on this device.")) {
      authService.clearAllData();
    }
  };

  return (
    <AuthCard>
        <Lock />
        <h1 className="auth-title">Unlock Your Session</h1>
        <p className="auth-subtitle">Enter your password to access your secure assessment data.</p>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="Password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button">Unlock</button>
      </form>
      <div className="auth-footer">
        <p>Forgot your password? <button onClick={handleClear} className="subtle-link">Clear vault & start over.</button></p>
      </div>
    </AuthCard>
  );
};


interface LegalAgreementsScreenProps { onAccept: () => void; }
const LegalAgreementsScreen: React.FC<LegalAgreementsScreenProps> = ({ onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);
  const legalText = `<h2>Terms of Service & Mutual Non-Disclosure Agreement</h2><p>Last Updated: ${new Date().toLocaleDateString()}</p><p>By checking the box and clicking "Agree and Continue," you are entering into a binding legal agreement with AIWinLab and its principal, William Russell Wheeler ("The Company").</p><h3>1. Mutual Non-Disclosure (NDA)</h3><p>Both parties agree to treat all information shared through this tool as confidential. The Company will not share your survey responses with any third party. You ("The User") agree not to disclose, copy, or distribute the proprietary frameworks, questions, or generated report structures provided by this tool.</p><h3>2. End User License Agreement (EULA) & Intellectual Property</h3><p>The Company grants you a limited, non-exclusive, non-transferable, revocable license to use the AIWinLab assessment tool for your internal business evaluation purposes only. All content, structures, prompts, branding, and methodologies within this tool are the exclusive intellectual property of The Company. You agree not to reverse-engineer, decompile, create derivative works from, or otherwise attempt to steal the intellectual property of this system. You are expressly forbidden from using this tool to create a competing product or service.</p><h3>3. Disclaimer of Warranties & Limitation of Liability</h3><p>This tool is provided "as is," without any warranties of any kind. The Company does not guarantee any specific business outcome, revenue increase, or result from the use of the generated reports. The recommendations provided are for informational purposes only. The User is solely responsible for the implementation and consequences of any actions taken based on the report. The Company's liability for any claim arising out of this agreement shall not exceed the amount paid for the service.</p><h3>4. Governing Law</h3><p>This agreement shall be governed by the laws of the jurisdiction in which The Company is registered.</p><p><strong>Copyright © ${new Date().getFullYear()} AIWinLab / William Russell Wheeler. All Rights Reserved.</strong></p>`;

  return (
    <AuthCard wide>
      <h1 className="auth-title">Legal Agreements</h1>
      <p className="auth-subtitle">Please read and accept the following terms to continue.</p>
        <div className="legal-text-box" dangerouslySetInnerHTML={{ __html: legalText }} />
        <div className="checkbox-group">
          <input type="checkbox" id="accept-checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="checkbox" />
          <label htmlFor="accept-checkbox" className="checkbox-label">I have read, understood, and agree to all terms, conditions, and agreements listed above.</label>
        </div>
        <button onClick={onAccept} disabled={!isChecked} className="auth-button" style={{ marginTop: '1.5rem' }}>Agree and Continue</button>
    </AuthCard>
  );
};


// --- The Main Wrapper Component ---

type AuthState = 'loading' | 'needs_registration' | 'needs_login' | 'needs_legal' | 'authenticated';

const SecureSurveyWrapper = () => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [initialProgress, setInitialProgress] = useState<SurveyResponses>({});

  useEffect(() => {
    const authData = authService.getAuthData();
    if (!authData) {
      setAuthState('needs_registration');
    } else {
      setAuthState('needs_login');
    }
  }, []);

  const handleRegister = (username: string, password: string) => {
    authService.saveAuthData(username, password);
    setAuthState('needs_legal');
  };

  const handleLogin = (password: string): boolean => {
    if (authService.verifyPassword(password)) {
      setInitialProgress(authService.loadProgress());
      if (authService.hasAcceptedLegal()) {
        setAuthState('authenticated');
      } else {
        setAuthState('needs_legal');
      }
      return true;
    }
    return false;
  };

  const handleAcceptLegal = () => {
    authService.acceptLegal();
    setAuthState('authenticated');
  };

  switch (authState) {
    case 'loading':
      return <div className="loading-container"><div className="loading-message">Loading...</div></div>;
    case 'needs_registration':
      return <RegistrationScreen onRegister={handleRegister} />;
    case 'needs_login':
      return <LoginScreen onLogin={handleLogin} />;
    case 'needs_legal':
      return <LegalAgreementsScreen onAccept={handleAcceptLegal} />;
    case 'authenticated':
      return <AiConsultingSurvey initialData={initialProgress} onDataChange={authService.saveProgress} />;
    default:
      return <div className="error-container"><div className="error-message">An unknown error occurred.</div></div>;
  }
};

export default SecureSurveyWrapper;