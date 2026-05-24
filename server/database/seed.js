require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('./db');

const products = [
  { name: 'Cheese Crackers', description: 'Crunchy cheese-flavored crackers, great for snacking on the go.', price: 1.00, category: 'Snacks', image_url: null, stock: 150 },
  { name: 'Gummy Bears', description: 'Assorted fruit-flavored gummy bears in a resealable bag.', price: 1.00, category: 'Snacks', image_url: null, stock: 200 },
  { name: 'Popcorn Bag', description: 'Light and fluffy butter popcorn, perfect for movie night.', price: 1.00, category: 'Snacks', image_url: null, stock: 120 },
  { name: 'Chocolate Bar', description: 'Rich milk chocolate bar with a smooth creamy texture.', price: 1.00, category: 'Snacks', image_url: null, stock: 180 },
  { name: 'Ballpoint Pen (3pk)', description: 'Smooth-writing blue ballpoint pens, ideal for everyday use.', price: 1.00, category: 'Stationery', image_url: null, stock: 300 },
  { name: 'Sticky Notes', description: '100-sheet pad of yellow sticky notes, 3x3 inches.', price: 1.00, category: 'Stationery', image_url: null, stock: 250 },
  { name: 'Eraser Pack', description: 'White vinyl erasers — clean erase, no smudges.', price: 1.00, category: 'Stationery', image_url: null, stock: 400 },
  { name: 'Highlighter Set', description: 'Set of 4 fluorescent highlighters in assorted colors.', price: 1.00, category: 'Stationery', image_url: null, stock: 200 },
  { name: 'Bouncy Ball', description: 'Super bouncy rubber ball — hours of fun for all ages.', price: 1.00, category: 'Toys', image_url: null, stock: 500 },
  { name: 'Mini Puzzle (48pc)', description: '48-piece mini jigsaw puzzle with colorful animal design.', price: 1.00, category: 'Toys', image_url: null, stock: 100 },
  { name: 'Foam Stickers Sheet', description: '3D foam sticker sheet with stars, hearts and shapes.', price: 1.00, category: 'Toys', image_url: null, stock: 350 },
  { name: 'Spinning Top', description: 'Classic colorful spinning top toy — spin it and watch it go!', price: 1.00, category: 'Toys', image_url: null, stock: 150 },
  { name: 'Sponge (2pk)', description: 'Heavy-duty scrubbing sponges, great for dishes and surfaces.', price: 1.00, category: 'Cleaning', image_url: null, stock: 400 },
  { name: 'Dish Soap Sachet', description: 'Concentrated dish soap sachet — just add water.', price: 1.00, category: 'Cleaning', image_url: null, stock: 300 },
  { name: 'Microfibre Cloth', description: 'Lint-free microfibre cloth, perfect for screens and surfaces.', price: 1.00, category: 'Cleaning', image_url: null, stock: 250 },
  { name: 'Trash Bags (10pk)', description: 'Small bin liner trash bags, 10-pack.', price: 1.00, category: 'Cleaning', image_url: null, stock: 200 },
  { name: 'Hair Ties (10pk)', description: 'Strong elastic hair ties in assorted colors, 10-pack.', price: 1.00, category: 'Beauty', image_url: null, stock: 500 },
  { name: 'Cotton Pads (50pk)', description: 'Soft round cotton pads for makeup removal and skincare.', price: 1.00, category: 'Beauty', image_url: null, stock: 350 },
  { name: 'Nail File', description: 'Double-sided emery nail file for shaping and smoothing.', price: 1.00, category: 'Beauty', image_url: null, stock: 300 },
  { name: 'Lip Balm', description: 'Moisturising vanilla-scented lip balm in a twist-up stick.', price: 1.00, category: 'Beauty', image_url: null, stock: 400 }
];

async function seed() {
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM products');
  if (Number(rows[0].count) > 0) {
    console.log(`Seed skipped — ${rows[0].count} products already exist.`);
    await pool.end();
    return;
  }

  for (const p of products) {
    await pool.query(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6)',
      [p.name, p.description, p.price, p.category, p.image_url, p.stock]
    );
  }

  console.log(`Seeded ${products.length} products successfully.`);
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
