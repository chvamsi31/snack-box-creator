import { VarietyPack } from "@/types/varietyPack";
import laysSeaSalt from "@/assets/lays-sea-salt.jpg";
import doritosJalapeno from "@/assets/doritos-jalapeno.jpg";
import smartfoodChocolateAlmonds from "@/assets/smartfood-chocolate-almonds.jpg";
import chestersJerky from "@/assets/chesters-jerky.jpg";
import cheetosPuffs from "@/assets/cheetos-puffs.jpg";
import smartfoodCaramelPopcorn from "@/assets/smartfood-caramel-popcorn.jpg";

export const varietyPacks: VarietyPack[] = [
  {
    id: "vp1",
    name: "Classic Favorites Mix",
    description: "A perfect blend of our best-selling chips and snacks for any occasion.",
    price: 24.99,
    image: laysSeaSalt,
    productIds: ["1", "2", "6"],
    itemCount: 18,
    tags: ["bestseller", "family-size"],
    savings: 5.00,
  },
  {
    id: "vp2",
    name: "Spicy Adventure Pack",
    description: "Turn up the heat with our bold and spicy snack selection.",
    price: 29.99,
    image: doritosJalapeno,
    productIds: ["2", "5"],
    itemCount: 15,
    tags: ["spicy", "protein"],
    savings: 4.50,
  },
  {
    id: "vp3",
    name: "Sweet & Savory Collection",
    description: "The best of both worlds - perfect balance of sweet treats and savory snacks.",
    price: 34.99,
    image: smartfoodChocolateAlmonds,
    productIds: ["3", "8", "1"],
    itemCount: 20,
    tags: ["bestseller", "variety"],
    savings: 7.00,
  },
  {
    id: "vp4",
    name: "Protein Power Box",
    description: "Fuel your active lifestyle with high-protein jerky and trail mix.",
    price: 39.99,
    image: chestersJerky,
    productIds: ["5", "4"],
    itemCount: 12,
    tags: ["high-protein", "healthy"],
    savings: 6.00,
  },
  {
    id: "vp5",
    name: "Party Starter Pack",
    description: "Everything you need for game night or parties - crowd pleasers guaranteed!",
    price: 44.99,
    image: cheetosPuffs,
    productIds: ["1", "2", "6", "8"],
    itemCount: 30,
    tags: ["party", "bestseller", "value"],
    savings: 10.00,
  },
  {
    id: "vp6",
    name: "Gourmet Selection",
    description: "Premium snacks for refined tastes - artisan quality in every bite.",
    price: 49.99,
    image: smartfoodCaramelPopcorn,
    productIds: ["3", "4", "8"],
    itemCount: 16,
    tags: ["premium", "organic"],
    savings: 8.00,
  },
];
