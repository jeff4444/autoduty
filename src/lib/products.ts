/**
 * Shared product data used by both API routes and frontend.
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 40-hour battery life, and studio-quality sound. Perfect for travel and focus work.",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    category: "Audio",
    rating: 4.8,
    reviews: 2341,
    inStock: true,
  },
  {
    id: 2,
    name: "Mechanical Keyboard — Cherry MX",
    description: "Compact 75% layout mechanical keyboard with Cherry MX Brown switches, RGB backlighting, and USB-C connectivity.",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80",
    category: "Peripherals",
    rating: 4.6,
    reviews: 1876,
    inStock: true,
  },
  {
    id: 3,
    name: "Ultra-Wide 34\" Monitor",
    description: "34-inch curved ultrawide QHD monitor with 144Hz refresh rate, HDR support, and USB-C docking. Ideal for productivity and gaming.",
    price: 599.99,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    category: "Displays",
    rating: 4.7,
    reviews: 943,
    inStock: true,
  },
  {
    id: 4,
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with GPS, heart rate monitoring, sleep tracking, and 7-day battery life. Water resistant to 50m.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    category: "Wearables",
    rating: 4.5,
    reviews: 3102,
    inStock: true,
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 360-degree sound, 20-hour battery, and built-in microphone for calls.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
    category: "Audio",
    rating: 4.4,
    reviews: 1567,
    inStock: true,
  },
  {
    id: 6,
    name: "USB-C Hub — 7-in-1",
    description: "Compact aluminum USB-C hub with HDMI 4K, USB 3.0, SD card reader, and 100W power delivery passthrough.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&q=80",
    category: "Accessories",
    rating: 4.3,
    reviews: 2204,
    inStock: true,
  },
  {
    id: 7,
    name: "Ergonomic Office Chair",
    description: "Adjustable ergonomic mesh chair with lumbar support, headrest, and 4D armrests. Built for 8+ hour workdays.",
    price: 449.99,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80",
    category: "Furniture",
    rating: 4.6,
    reviews: 892,
    inStock: true,
  },
  {
    id: 8,
    name: "Webcam 4K Pro",
    description: "Ultra HD 4K webcam with auto-focus, built-in ring light, noise-cancelling mic, and privacy shutter.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500&q=80",
    category: "Peripherals",
    rating: 4.5,
    reviews: 1243,
    inStock: true,
  },
];
