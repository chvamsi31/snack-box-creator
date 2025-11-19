export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  tags: string[];
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  variants?: {
    id: string;
    name: string;
    price: number;
  }[];
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}
