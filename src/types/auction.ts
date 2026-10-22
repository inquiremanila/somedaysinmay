export type AuctionStatus = 'open' | 'scheduled' | 'closed';

export type AuctionListing = {
  id: string;
  lotNumber: string;
  title: string;
  size: string;
  imageUrl: string;
  currentBid: number;
  minimumIncrement: number;
  bidCount: number;
  status: AuctionStatus;
  startsAt?: Date;
  endsAt?: Date;
  preview?: boolean;
  previewRemaining?: string;
};
