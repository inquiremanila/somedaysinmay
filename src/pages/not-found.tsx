import { useLocalization } from '../localization/provider';
import { Link } from 'wouter';

function NotFound() {
  const { t } = useLocalization();
  return (
    <main className="not-found page-enter">
      <span className="eyebrow">{t("A little detour")}</span>
      <h1>{t("This page wandered off.")}</h1>
      <p>{t("Let’s find our way back to the studio.")}</p>
      <Link className="outline-button" href="/">{t("Return home")}</Link>
    </main>
  );
}

export default NotFound;
