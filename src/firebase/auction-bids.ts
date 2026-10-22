import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    const toDate = (value as Timestamp).toDate;
    if (typeof toDate === 'function') return toDate.call(value);
  }
  return null;
}

export async function placeAuctionBid(
  db: Firestore,
  auctionId: string,
  bidderUid: string,
  amount: number,
) {
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new Error('Enter a whole-number bid in Philippine pesos.');
  }

  const auctionRef = doc(db, 'auctions', auctionId);
  const bidRef = doc(collection(auctionRef, 'bids'));

  await runTransaction(db, async (transaction) => {
    const auctionSnapshot = await transaction.get(auctionRef);
    if (!auctionSnapshot.exists()) throw new Error('This auction is no longer available.');

    const auction = auctionSnapshot.data();
    const startsAt = timestampToDate(auction.startsAt);
    const endsAt = timestampToDate(auction.endsAt);
    const currentBid = auction.currentBid;
    const minimumIncrement = auction.minimumIncrement;
    const bidCount = auction.bidCount;

    if (
      auction.status !== 'open' ||
      !startsAt ||
      !endsAt ||
      Date.now() < startsAt.getTime() ||
      Date.now() >= endsAt.getTime()
    ) {
      throw new Error('This auction is not open for bidding now.');
    }

    if (
      !Number.isSafeInteger(currentBid) ||
      !Number.isSafeInteger(minimumIncrement) ||
      minimumIncrement < 1 ||
      !Number.isSafeInteger(bidCount)
    ) {
      throw new Error('This auction is missing valid bid settings. Please contact the studio.');
    }

    const minimumBid = currentBid + minimumIncrement;
    if (amount < minimumBid) {
      throw new Error(`The minimum next bid is ₱${minimumBid.toLocaleString('en-PH')}.`);
    }

    transaction.set(bidRef, {
      auctionId,
      bidderUid,
      amount,
      createdAt: serverTimestamp(),
    });
    transaction.update(auctionRef, {
      currentBid: amount,
      bidCount: bidCount + 1,
      latestBidId: bidRef.id,
      updatedAt: serverTimestamp(),
    });
  });
}
