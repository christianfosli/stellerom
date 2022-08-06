export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface ChangingRoom {
  id: string;
  name: string | undefined | null;
  location: { lat: number; lng: number };
  ratings: {
    availability: StarRating;
    safety: StarRating;
    cleanliness: StarRating;
  } | null;
}

export interface Review {
  roomId: string;
  availabilityRating: StarRating;
  safetyRating: StarRating;
  cleanlinessRating: StarRating;
  review: string | null | undefined;
  reviewedBy: string;
  reviewedAt: Date;
}
