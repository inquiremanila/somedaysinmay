import { useLocalization } from '../localization/provider';
import { useEffect, useState, type FormEvent } from 'react';
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore';
import { Link } from 'wouter';
import AuctionCard from '../components/auction-card';
import { auctionPreviewLots } from '../data/auction-preview';
import { useAuth } from '../firebase/use-auth';
import { placeAuctionBid } from '../firebase/auction-bids';
import { firebaseConfigured } from '../firebase/firebase';
import { firestore } from '../firebase/store';
import type { AuctionListing, AuctionStatus } from '../types/auction';

const RETURN_PATH_KEY = 'somedays-firebase-return-path';

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    const toDate = (value as { toDate?: unknown }).toDate;
    if (typeof toDate === 'function') return toDate.call(value) as Date;
  }
  return null;
}

function parseAuction(id: string, data: DocumentData): AuctionListing | null {
  const startsAt = asDate(data.startsAt);
  const endsAt = asDate(data.endsAt);
  const validStatuses: AuctionStatus[] = ['open', 'scheduled', 'closed'];

  if (
    typeof data.title !== 'string' ||
    typeof data.size !== 'string' ||
    typeof data.imageUrl !== 'string' ||
    typeof data.currentBid !== 'number' ||
    !Number.isSafeInteger(data.currentBid) ||
    typeof data.minimumIncrement !== 'number' ||
    !Number.isSafeInteger(data.minimumIncrement) ||
    data.minimumIncrement < 1 ||
    typeof data.bidCount !== 'number' ||
    !Number.isSafeInteger(data.bidCount) ||
    data.bidCount < 0 ||
    !validStatuses.includes(data.status) ||
    !startsAt ||
    !endsAt
  ) {
    return null;
  }

  return {
    id,
    lotNumber: String(data.lotNumber ?? id.slice(0, 6)),
    title: data.title,
    size: data.size,
    imageUrl: data.imageUrl,
    currentBid: data.currentBid,
    minimumIncrement: data.minimumIncrement,
    bidCount: data.bidCount,
    status: data.status,
    startsAt,
    endsAt,
  };
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString('en-PH')}`;
}

function Auctions() {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [isLoading, setIsLoading] = useState(firebaseConfigured);
  const [loadError, setLoadError] = useState('');
  const [invalidCount, setInvalidCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidNotice, setBidNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!firestore) {
      setIsLoading(false);
      return;
    }

    return onSnapshot(
      collection(firestore, 'auctions'),
      (snapshot) => {
        const parsed = snapshot.docs
          .map((auctionDocument) => parseAuction(auctionDocument.id, auctionDocument.data()))
          .filter((auction): auction is AuctionListing => auction !== null);
        setAuctions(parsed);
        setInvalidCount(snapshot.size - parsed.length);
        setLoadError('');
        setIsLoading(false);
      },
      () => {
        setLoadError('Auctions could not be loaded. Check the Firebase project and Firestore rules.');
        setIsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!selectedAuctionId) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedAuctionId(null);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedAuctionId]);

  const displayAuctions = firebaseConfigured
    ? auctions.filter((auction) => auction.status !== 'closed' && (auction.endsAt?.getTime() ?? 0) > now)
    : auctionPreviewLots;
  const selectedAuction = displayAuctions.find((auction) => auction.id === selectedAuctionId) ?? null;

  function openBidDialog(auction: AuctionListing) {
    setSelectedAuctionId(auction.id);
    setBidAmount(String(auction.currentBid + auction.minimumIncrement));
    setBidNotice(null);
  }

  async function handleBidSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firestore || !user || !selectedAuction) return;

    const amount = Number(bidAmount);
    setIsSubmitting(true);
    setBidNotice(null);

    try {
      await placeAuctionBid(firestore, selectedAuction.id, user.uid, amount);
      setBidNotice({
        kind: 'success',
        message: `Your ${formatCurrency(amount)} bid was submitted.`,
      });
      setBidAmount('');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Your bid was not accepted. Please try again.';
      setBidNotice({ kind: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auction-page page-enter">
      <section className="auction-hero">
        <span className="eyebrow">{t("SOMEDAYS IN MAY · ONLINE AUCTIONS")}</span>
        <h1>{t("The Auction Room")}</h1>
        <p>{t("Some pieces are meant to be found. Others are meant to be won.")}</p>
      </section>

      <section className="auction-listing-section" aria-labelledby="auction-list-heading">
        <div className="auction-section-heading">
          <div>
            <span className="eyebrow">{t("A PLACE FOR COLLECTORS")}</span>
            <h2 id="auction-list-heading">{t("Open for bidding")}</h2>
          </div>
          <p>{t("Each bid is placed in Philippine pesos and updates the lot in real time.")}</p>
        </div>

        {!firebaseConfigured && (
          <div className="auction-demo-notice" role="status">
            <strong>{t("Design preview only.")}</strong> {t("These example lots and bid amounts are not live auctions. Connect Firebase and add real auction records to accept bids.")} </div>
        )}

        {loadError && <p className="auction-feedback error" role="alert">{loadError}</p>}
        {invalidCount > 0 && (
          <p className="auction-feedback error" role="status">
            {invalidCount} {t("auction")} {invalidCount === 1 ? t("record needs") : t("records need")} {t("valid lot details and bid settings before display.")} </p>
        )}

        {isLoading ? (
          <p className="auction-empty-state" role="status">{t("Finding the open lots…")}</p>
        ) : displayAuctions.length ? (
          <div className="auction-grid">
            {displayAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} now={now} onBid={openBidDialog} />
            ))}
          </div>
        ) : (
          <div className="auction-empty-state">
            <span className="eyebrow">{t("NO OPEN LOTS")}</span>
            <p>{t("The next pieces will appear here when bidding opens.")}</p>
          </div>
        )}
      </section>

      <section className="auction-how" aria-labelledby="how-bidding-works">
        <div>
          <span className="eyebrow">{t("A SIMPLE PROCESS")}</span>
          <h2 id="how-bidding-works">{t("How bidding works")}</h2>
        </div>
        <ol>
          <li><span>01</span><p>{t("Sign in with your email to place a bid.")}</p></li>
          <li><span>02</span><p>{t("Enter at least the minimum next bid shown on the artwork.")}</p></li>
          <li><span>03</span><p>{t("The highest eligible bid is recorded when the auction closes.")}</p></li>
        </ol>
      </section>

      {selectedAuction && (
        <div
          className="auction-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAuctionId(null);
          }}
        >
          <section className="auction-modal" role="dialog" aria-modal="true" aria-labelledby="bid-dialog-title">
            <button
              className="auction-modal-close"
              type="button"
              aria-label={t("Close bidding dialog")}
              onClick={() => setSelectedAuctionId(null)}
            >
              ×
            </button>
            <span className="eyebrow">{t("LOT")} {selectedAuction.lotNumber}</span>
            <h2 id="bid-dialog-title">{t("Place your bid")}</h2>
            <p className="auction-modal-piece">{selectedAuction.title} · {selectedAuction.size}</p>
            <div className="auction-modal-bid-summary">
              <span>{t("Current bid")}</span>
              <strong>{formatCurrency(selectedAuction.currentBid)}</strong>
              <span>{t("Minimum next bid")}</span>
              <strong>{formatCurrency(selectedAuction.currentBid + selectedAuction.minimumIncrement)}</strong>
            </div>

            {user ? (
              <form className="auction-bid-form" onSubmit={handleBidSubmit}>
                <label htmlFor="bid-amount">{t("Your bid in Philippine pesos")}</label>
                <div className="auction-bid-input">
                  <span aria-hidden="true">₱</span>
                  <input
                    id="bid-amount"
                    type="number"
                    inputMode="numeric"
                    min={selectedAuction.currentBid + selectedAuction.minimumIncrement}
                    step={selectedAuction.minimumIncrement}
                    value={bidAmount}
                    onChange={(event) => setBidAmount(event.target.value)}
                    required
                  />
                </div>
                <p>{t("Minimum increment:")} {formatCurrency(selectedAuction.minimumIncrement)}</p>
                <button className="primary-button auction-bid-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("SUBMITTING…") : t("SUBMIT BID")}
                </button>
              </form>
            ) : (
              <div className="auction-sign-in">
                <p>{t("Sign in or create an account with your email before placing a bid.")}</p>
                <Link
                  className="primary-button auction-bid-button"
                  href="/account"
                  onClick={() => window.localStorage.setItem(RETURN_PATH_KEY, '/auctions')}
                > {t("SIGN IN / CREATE ACCOUNT")} </Link>
              </div>
            )}

            {bidNotice && (
              <p className={`auction-feedback ${bidNotice.kind}`} role="status" aria-live="polite">
                {bidNotice.message}
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default Auctions;
