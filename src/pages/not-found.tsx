import { Link } from 'wouter';

function NotFound() {
  return (
    <main className="not-found page-enter">
      <span className="eyebrow">A little detour</span>
      <h1>This page wandered off.</h1>
      <p>Let’s find our way back to the studio.</p>
      <Link className="outline-button" href="/">Return home</Link>
    </main>
  );
}

export default NotFound;
