import { useLocalization } from '../localization/provider';
import { Link } from 'wouter';

type ThankYouProps = {
  checkout?: boolean;
};

function ThankYou({ checkout = false }: ThankYouProps) {
  const { t } = useLocalization();
  return (
    <main className="thank-you page-enter">
      <span className="eyebrow">{t("A small note from the studio")}</span>
      <h1>{t("Thank you")}</h1>
      <p>
        {checkout
          ? t("Your purchase request was saved to your account. The studio will confirm availability, pricing, and payment details by email. No payment has been taken.")
          : t("This is the demo thank-you screen. No order was placed and no payment was taken.")}
      </p>
      <p>{t("You’re part of this little world, and I’m so grateful.")}</p>
      <Link href="/artworks" className="outline-button">{t("Continue shopping")}</Link>
    </main>
  );
}

export default ThankYou;
