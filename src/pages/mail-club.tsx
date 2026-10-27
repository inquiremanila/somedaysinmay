import { useLocalization } from '../localization/provider';
function MailClub() {
  const { t } = useLocalization();
  return (
    <main className="mail-club-coming-soon page-enter" aria-label={t("Mail Club coming soon")}>
      <h1>{t("Coming Soon")}</h1>
    </main>
  );
}

export default MailClub;
