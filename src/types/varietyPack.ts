export interface VarietyPack {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  productIds: string[];
  itemCount: number;
  tags: string[];
  savings?: number;
}
