require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('./db');

const products = [
  // Snacks
  { name: 'Cheese Crackers', description: 'Crunchy cheese-flavored crackers, great for snacking on the go.', price: 1.00, category: 'Snacks', image_url: 'https://placehold.co/300x300/FFA500/white?text=Crackers', stock: 150 },
  { name: 'Gummy Bears', description: 'Assorted fruit-flavored gummy bears in a resealable bag.', price: 1.00, category: 'Snacks', image_url: 'https://placehold.co/300x300/FF6B6B/white?text=Gummies', stock: 200 },
  { name: 'Popcorn Bag', description: 'Light and fluffy butter popcorn, perfect for movie night.', price: 1.00, category: 'Snacks', image_url: 'https://placehold.co/300x300/FFD700/white?text=Popcorn', stock: 120 },
  { name: 'Chocolate Bar', description: 'Rich milk chocolate bar with a smooth creamy texture.', price: 1.00, category: 'Snacks', image_url: 'https://placehold.co/300x300/8B4513/white?text=Chocolate', stock: 180 },

  // Stationery
  { name: 'Ballpoint Pen (3pk)', description: 'Smooth-writing blue ballpoint pens, ideal for everyday use.', price: 1.00, category: 'Stationery', image_url: 'https://placehold.co/300x300/4169E1/white?text=Pens', stock: 300 },
  { name: 'Sticky Notes', description: '100-sheet pad of yellow sticky notes, 3x3 inches.', price: 1.00, category: 'Stationery', image_url: 'https://placehold.co/300x300/FFFF00/black?text=Notes', stock: 250 },
  { name: 'Eraser Pack', description: 'White vinyl erasers — clean erase, no smudges.', price: 1.00, category: 'Stationery', image_url: 'https://placehold.co/300x300/FFFFFF/black?text=Eraser', stock: 400 },
  { name: 'Highlighter Set', description: 'Set of 4 fluorescent highlighters in assorted colors.', price: 1.00, category: 'Stationery', image_url: 'https://placehold.co/300x300/00FF7F/black?text=Highlight', stock: 200 },

  // Toys
  { name: 'Bouncy Ball', description: 'Super bouncy rubber ball — hours of fun for all ages.', price: 1.00, category: 'Toys', image_url: 'https://placehold.co/300x300/FF69B4/white?text=Ball', stock: 500 },
  { name: 'Mini Puzzle (48pc)', description: '48-piece mini jigsaw puzzle with colorful animal design.', price: 1.00, category: 'Toys', image_url: 'https://placehold.co/300x300/9370DB/white?text=Puzzle', stock: 100 },
  { name: 'Foam Stickers Sheet', description: '3D foam sticker sheet with stars, hearts and shapes.', price: 1.00, category: 'Toys', image_url: 'https://placehold.co/300x300/FF1493/white?text=Stickers', stock: 350 },
  { name: 'Spinning Top', description: 'Classic colorful spinning top toy — spin it and watch it go!', price: 1.00, category: 'Toys', image_url: 'https://placehold.co/300x300/20B2AA/white?text=Top', stock: 150 },

  // Cleaning
  { name: 'Sponge (2pk)', description: 'Heavy-duty scrubbing sponges, great for dishes and surfaces.', price: 1.00, category: 'Cleaning', image_url: 'https://placehold.co/300x300/32CD32/white?text=Sponge', stock: 400 },
  { name: 'Dish Soap Sachet', description: 'Concentrated dish soap sachet — just add water.', price: 1.00, category: 'Cleaning', image_url: 'https://placehold.co/300x300/00BFFF/white?text=Soap', stock: 300 },
  { name: 'Microfibre Cloth', description: 'Lint-free microfibre cloth, perfect for screens and surfaces.', price: 1.00, category: 'Cleaning', image_url: 'https://placehold.co/300x300/708090/white?text=Cloth', stock: 250 },
  { name: 'Trash Bags (10pk)', description: 'Small bin liner trash bags, 10-pack.', price: 1.00, category: 'Cleaning', image_url: 'https://placehold.co/300x300/2F4F4F/white?text=Bags', stock: 200 },

  // Beauty
  { name: 'Hair Ties (10pk)', description: 'Strong elastic hair ties in assorted colors, 10-pack.', price: 1.00, category: 'Beauty', image_url: 'https://placehold.co/300x300/FF6347/white?text=Hair+Ties', stock: 500 },
  { name: 'Cotton Pads (50pk)', description: 'Soft round cotton pads for makeup removal and skincare.', price: 1.00, category: 'Beauty', image_url: 'https://placehold.co/300x300/FFF5EE/black?text=Cotton', stock: 350 },
  { name: 'Nail File', description: 'Double-sided emery nail file for shaping and smoothing.', price: 1.00, category: 'Beauty', image_url: 'https://placehold.co/300x300/DDA0DD/white?text=Nail+File', stock: 300 },
  { name: 'Lip Balm', description: 'Moisturising vanilla-scented lip balm in a twist-up stick.', price: 1.00, category: 'Beauty', image_url: 'https://placehold.co/300x300/FFB6C1/white?text=Lip+Balm', stock: 400 }
];

const existing = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (existing.count > 0) {
  console.log(`Seed skipped — ${existing.count} products already exist.`);
  process.exit(0);
}

const insert = db.prepare(
  'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)'
);

const insertMany = db.transaction((items) => {
  for (const p of items) {
    insert.run(p.name, p.description, p.price, p.category, p.image_url, p.stock);
  }
});

insertMany(products);
console.log(`Seeded ${products.length} products successfully.`);
