import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <div className="not-found__icon">京</div>
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for doesn't exist or has moved.</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn-primary">Go home</Link>
        <Link to="/search" className="btn btn-ghost">Browse anime</Link>
      </div>
    </div>
  );
}
