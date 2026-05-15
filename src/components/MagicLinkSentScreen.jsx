export default function MagicLinkSentScreen({ email, onBack }) {
  return (
    <div className="auth-screen">
      <div className="auth-card auth-card--centered">
        <div className="auth-logo">📬</div>
        <h2 className="auth-title">Check Your Email!</h2>
        <p className="auth-subtitle-small">
          We sent a magic link to <strong>{email}</strong>.
          <br />Click the link in your email to log in instantly.
        </p>
        <p className="auth-hint-small">
          Link expires in 24 hours. Don't see it? Check your spam folder.
        </p>
        <button className="btn-secondary" onClick={onBack}>
          ← Try a Different Email
        </button>
      </div>
    </div>
  );
}
