import type { AuctionListing } from '../types/auction';

type AuctionCardProps = {
  auction: AuctionListing;
  now: number;
  onBid: (auction: AuctionListing) => void;
};

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString('en-PH')}`;
}

function formatRemaining(milliseconds: number) {
  if (milliseconds <= 0) return 'Closed';
  const totalMinutes = Math.floor(milliseconds / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function AuctionCard({ auction, now, onBid }: AuctionCardProps) {
  const opensAt = auction.startsAt?.getTime() ?? 0;
  const closesAt = auction.endsAt?.getTime() ?? 0;
  const isUpcoming = !auction.preview && auction.status === 'scheduled' && now < opensAt;
  const isOpen = !auction.preview && auction.status === 'open' && now >= opensAt && now < closesAt;
  const countdown = auction.preview
    ? auction.previewRemaining ?? 'Preview'
    : formatRemaining(Math.max(0, (isUpcoming ? opensAt : closesAt) - now));
  const statusLabel = auction.preview
    ? 'Preview only'
    : isUpcoming
      ? 'Opening soon'
      : isOpen
        ? 'Bidding open'
        : 'Bidding closed';

  return (
    <article className={`auction-card ${auction.preview ? 'is-preview' : ''}`}>
      <div className="auction-card-image">
        <img src={auction.imageUrl} alt={`${auction.title}, original textured artwork`} loading="lazy" />
        <span className={`auction-status ${isOpen ? 'is-open' : ''}`}>
          <span aria-hidden="true" />
          {statusLabel}
        </span>
      </div>
      <div className="auction-card-copy">
        <div className="auction-card-overline">
          <span>LOT {auction.lotNumber}</span>
          <span>{auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'}</span>
        </div>
        <h2>{auction.title}</h2>
        <p className="auction-card-size">{auction.size}</p>
        <div className="auction-card-data">
          <div>
            <span>Current bid</span>
            <strong>{formatCurrency(auction.currentBid)}</strong>
          </div>
          <div className="auction-time">
            <span>{isUpcoming ? 'Opens in' : 'Time left'}</span>
            <strong>{countdown}</strong>
          </div>
        </div>
        <p className="auction-increment">Minimum next bid {formatCurrency(auction.currentBid + auction.minimumIncrement)}</p>
        <button
          className="primary-button auction-bid-button"
          type="button"
          disabled={!isOpen}
          onClick={() => onBid(auction)}
        >
          {auction.preview ? 'PREVIEW ONLY' : isOpen ? 'PLACE A BID' : isUpcoming ? 'NOT OPEN YET' : 'BIDDING CLOSED'}
        </button>
      </div>
    </article>
  );
}

export default AuctionCard;
