export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Listing {
  id: string;
  tornItemId: number;
  itemName: string;
  itemQuality: string | null;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  description: string | null;
  status: ListingStatus;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
  seller?: {
    id: string;
    username: string;
    tornPlayerName: string | null;
  };
}

export interface CreateListingRequest {
  tornItemId: number;
  itemName: string;
  itemQuality?: string;
  quantity: number;
  pricePerUnit: number;
  description?: string;
  expiresAt?: Date;
}

export interface UpdateListingRequest {
  quantity?: number;
  pricePerUnit?: number;
  description?: string;
  status?: ListingStatus;
}

export interface TornItem {
  id: number;
  name: string;
  description: string;
  type: string;
  buy_price: number;
  sell_price: number;
  market_value: number;
  circulation: number;
  image: string;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalAmount: number;
  status: TransactionStatus;
  sellerConfirmedAt: Date | null;
  buyerConfirmedAt: Date | null;
  buyerNotes: string | null;
  sellerNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  listing?: Listing;
  buyer?: {
    id: string;
    username: string;
    tornPlayerName: string | null;
    tornPlayerId: number | null;
  };
  seller?: {
    id: string;
    username: string;
    tornPlayerName: string | null;
    tornPlayerId: number | null;
  };
}

export interface BuyListingRequest {
  quantity: number;
}

export interface ConfirmTransactionRequest {
  notes?: string;
}
