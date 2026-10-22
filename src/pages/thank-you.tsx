import { Link } from 'wouter';

type ThankYouProps = {
  checkout?: boolean;
};

function ThankYou({ checkout = false }: ThankYouProps) {
  return (
    <main className="thank-you page-enter">
      <span className="eyebrow">A small note from the studio</span>
      <h1>Thank you</h1>
      <p>
        {checkout
          ? 'Your order inquiry was saved to your account. No payment was taken, and this is not a completed purchase.'
          : 'This is the demo thank-you screen. No order was placed and no payment was taken.'}
      </p>
      <p>You’re part of this little world, and I’m so grateful.</p>
      <Link href="/artworks" className="outline-button">Continue shopping</Link>
    </main>
  );
}

export default ThankYou;
