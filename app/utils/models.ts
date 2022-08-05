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
