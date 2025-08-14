export type Tour = {
  id: number;
  name: string;
  duration: number;
  difficulty: "easy" | "medium" | "difficult";
  price: number;
  maxGroupSize: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: string[];
};
