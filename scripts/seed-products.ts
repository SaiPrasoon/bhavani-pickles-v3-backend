import mongoose from 'mongoose';

const MONGO_URI =
  'mongodb://mongo:xoVrZVyyjpfyZXJImJfJFBaEBppdhbyu@caboose.proxy.rlwy.net:26025/test?authSource=admin';

// ── Existing category IDs in production DB ───────────────────────────────────
const categoryMap: Record<string, mongoose.Types.ObjectId> = {
  'Veg Pickles': new mongoose.Types.ObjectId('69b966b970b35a6cae8d62b2'),
  'Non-Veg Pickles': new mongoose.Types.ObjectId('69b966db70b35a6cae8d62b6'),
  'Powders/Spices': new mongoose.Types.ObjectId('69b9670370b35a6cae8d62bd'),
  Snacks: new mongoose.Types.ObjectId('69b9671970b35a6cae8d62c1'),
};

// ── Schemas ──────────────────────────────────────────────────────────────────

const ProductVariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    leftoverStock: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true },
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' }],
    images: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isOutOfStock: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    ingredients: String,
  },
  { timestamps: true },
);

const Product = mongoose.model('Product', ProductSchema);
const ProductVariant = mongoose.model('ProductVariant', ProductVariantSchema);

// ── Product Data ─────────────────────────────────────────────────────────────

interface ProductData {
  name: string;
  description: string;
  variants: { weight: string; price: number }[];
}

const vegPickles: ProductData[] = [
  {
    name: 'Andhra Avakaya',
    description: 'Traditional Andhra style mango pickle prepared with fresh raw mangoes, pure oil, aromatic spices, and authentic homemade recipe.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Telangana Allam Avakaya',
    description: 'Spicy ginger mango pickle combining fresh ginger, raw mango pieces, premium oil, and traditional Telangana spices.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Tomato Pickle',
    description: 'Tangy homemade tomato pickle slow-cooked with red chilli powder, garlic, mustard seeds, and pure oil for rich flavor.',
    variants: [
      { weight: '250gms', price: 100 },
      { weight: '500gms', price: 200 },
      { weight: '1kg', price: 400 },
    ],
  },
  {
    name: 'Allam Pickle',
    description: 'Flavorful ginger pickle prepared using fresh ginger, traditional spices, mustard seeds, and pure oil for bold taste.',
    variants: [
      { weight: '250gms', price: 100 },
      { weight: '500gms', price: 200 },
      { weight: '1kg', price: 400 },
    ],
  },
  {
    name: 'Osirikaya Pickle',
    description: 'Healthy amla gooseberry pickle rich in natural nutrients, blended with aromatic spices and traditional homemade pickle preparation.',
    variants: [
      { weight: '250gms', price: 115 },
      { weight: '500gms', price: 230 },
      { weight: '1kg', price: 460 },
    ],
  },
  {
    name: 'Gongura Pickle',
    description: 'Authentic Andhra gongura leaves pickle with tangy sorrel leaves, red chilli powder, garlic, and traditional spice blend.',
    variants: [
      { weight: '250gms', price: 115 },
      { weight: '500gms', price: 230 },
      { weight: '1kg', price: 460 },
    ],
  },
  {
    name: 'Pandu Mirchi',
    description: 'Spicy red chilli pickle prepared with fresh red chillies, mustard seeds, garlic, and aromatic traditional Andhra spices.',
    variants: [
      { weight: '250gms', price: 100 },
      { weight: '500gms', price: 200 },
      { weight: '1kg', price: 400 },
    ],
  },
  {
    name: 'Gongura Pandu Mirchi',
    description: 'Tangy gongura leaves combined with spicy red chillies, blended with traditional spices to create bold Andhra pickle flavor.',
    variants: [
      { weight: '250gms', price: 115 },
      { weight: '500gms', price: 230 },
      { weight: '1kg', price: 460 },
    ],
  },
  {
    name: 'Pandu Mirchi Tomato',
    description: 'Spicy red chilli and tomato pickle with tangy flavor, cooked slowly with garlic, mustard seeds, and rich spices.',
    variants: [
      { weight: '250gms', price: 115 },
      { weight: '500gms', price: 230 },
      { weight: '1kg', price: 460 },
    ],
  },
  {
    name: 'Lemon Pickle',
    description: 'Classic homemade lemon pickle prepared with fresh lemons, red chilli powder, mustard seeds, and pure oil.',
    variants: [
      { weight: '500gms', price: 200 },
      { weight: '1kg', price: 400 },
    ],
  },
  {
    name: 'Garlic Pickle',
    description: 'Spicy garlic pickle prepared with fresh garlic cloves, red chilli powder, mustard seeds, aromatic spices, and pure oil.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Kakarakaya Pickle',
    description: 'Traditional bitter gourd pickle made with fresh kakarakaya, red chilli powder, garlic, mustard seeds, and authentic spices.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
];

const nonVegPickles: ProductData[] = [
  {
    name: 'Chicken Bone Pickle',
    description: 'Traditional spicy chicken bone pickle cooked with aromatic spices, garlic, ginger, and pure oil for authentic Andhra flavor.',
    variants: [
      { weight: '250gms', price: 275 },
      { weight: '500gms', price: 550 },
      { weight: '1kg', price: 1100 },
    ],
  },
  {
    name: 'Chicken Boneless Pickle',
    description: 'Tender boneless chicken pieces marinated and cooked with rich spices, garlic, and oil for flavorful homemade pickle.',
    variants: [
      { weight: '250gms', price: 350 },
      { weight: '500gms', price: 700 },
      { weight: '1kg', price: 1400 },
    ],
  },
  {
    name: 'Gongura Chicken Pickle',
    description: 'Spicy chicken pickle blended with tangy gongura leaves, garlic, traditional spices, and pure oil for authentic taste.',
    variants: [
      { weight: '250gms', price: 400 },
      { weight: '500gms', price: 800 },
      { weight: '1kg', price: 1600 },
    ],
  },
  {
    name: 'Mutton Boneless Pickle',
    description: 'Rich boneless mutton pickle prepared with fresh meat, aromatic spices, garlic, and oil using traditional Andhra recipe.',
    variants: [
      { weight: '250gms', price: 575 },
      { weight: '500gms', price: 1150 },
      { weight: '1kg', price: 2300 },
    ],
  },
  {
    name: 'Mutton Gongura Pickle',
    description: 'Flavorful mutton pickle mixed with tangy gongura leaves, garlic, and spices creating a unique traditional Andhra taste.',
    variants: [
      { weight: '250gms', price: 625 },
      { weight: '500gms', price: 1250 },
      { weight: '1kg', price: 2500 },
    ],
  },
  {
    name: 'Prawns Pickle',
    description: 'Fresh prawns cooked with aromatic spices, garlic, ginger, and oil creating delicious coastal style seafood pickle.',
    variants: [
      { weight: '250gms', price: 375 },
      { weight: '500gms', price: 750 },
      { weight: '1kg', price: 1500 },
    ],
  },
  {
    name: 'Prawns Gongura Pickle',
    description: 'Prawns blended with tangy gongura leaves, traditional spices, garlic, and oil for bold coastal Andhra pickle flavor.',
    variants: [
      { weight: '250gms', price: 400 },
      { weight: '500gms', price: 800 },
      { weight: '1kg', price: 1600 },
    ],
  },
];

const powdersSpices: ProductData[] = [
  {
    name: 'Munagaku Karam Podi',
    description: 'Healthy drumstick leaves spice powder blended with roasted lentils, chillies, garlic, and traditional spices for flavorful meals.',
    variants: [
      { weight: '250gms', price: 200 },
      { weight: '500gms', price: 400 },
      { weight: '1kg', price: 800 },
    ],
  },
  {
    name: 'Kandi Podi',
    description: 'Classic Andhra roasted toor dal spice powder prepared with garlic, red chillies, and spices perfect with rice.',
    variants: [
      { weight: '250gms', price: 225 },
      { weight: '500gms', price: 450 },
      { weight: '1kg', price: 900 },
    ],
  },
  {
    name: 'Karvepaku, Avasakinchalu, Munagaku Mixed Powder',
    description: 'Nutritious mix of curry leaves, mustard seeds, drumstick leaves, and spices ground into healthy traditional spice powder.',
    variants: [
      { weight: '250gms', price: 225 },
      { weight: '500gms', price: 450 },
      { weight: '1kg', price: 900 },
    ],
  },
  {
    name: 'Nuvvula Podi',
    description: 'Roasted sesame seeds spice powder blended with garlic, chillies, and spices for rich nutty flavor.',
    variants: [
      { weight: '250gms', price: 250 },
      { weight: '500gms', price: 500 },
      { weight: '1kg', price: 1000 },
    ],
  },
  {
    name: 'Red Chilli Powder',
    description: 'Pure ground red chilli powder made from premium dried chillies providing vibrant color and strong spicy flavor.',
    variants: [
      { weight: '250gms', price: 175 },
      { weight: '500gms', price: 350 },
      { weight: '1kg', price: 700 },
    ],
  },
  {
    name: 'Turmeric Powder',
    description: 'Natural turmeric powder prepared from dried turmeric roots offering bright color, aroma, and traditional health benefits.',
    variants: [
      { weight: '250gms', price: 115 },
      { weight: '500gms', price: 230 },
      { weight: '1kg', price: 460 },
    ],
  },
  {
    name: 'Non-Veg Curries Masala',
    description: 'Special spice blend prepared with aromatic spices perfect for enhancing flavor in chicken, mutton, and seafood curries.',
    variants: [
      { weight: '250gms', price: 200 },
      { weight: '500gms', price: 400 },
      { weight: '1kg', price: 800 },
    ],
  },
];

const snacks: ProductData[] = [
  {
    name: 'All Dry Fruits Laddu',
    description: 'Healthy sweet laddu made with premium almonds, cashews, pistachios, dates, and natural sweeteners for energy.',
    variants: [
      { weight: '250gms', price: 450 },
      { weight: '500gms', price: 900 },
      { weight: '1kg', price: 1800 },
    ],
  },
  {
    name: 'Sunnundalu',
    description: 'Traditional Andhra sweet prepared with roasted urad dal flour, jaggery, and pure ghee creating rich homemade flavor.',
    variants: [
      { weight: '250gms', price: 175 },
      { weight: '500gms', price: 350 },
      { weight: '1kg', price: 700 },
    ],
  },
  {
    name: 'Putharekulu',
    description: 'Famous Andhra paper sweet layered with delicate rice sheets, sugar or jaggery, and generous ghee filling.',
    variants: [
      { weight: '250gms', price: 250 },
      { weight: '500gms', price: 500 },
      { weight: '1kg', price: 1000 },
    ],
  },
  {
    name: 'Motichur Laddu',
    description: 'Soft and delicious motichur laddu made with tiny boondi pearls, sugar syrup, and aromatic ghee.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Boondi Laddu',
    description: 'Classic festive sweet prepared with golden boondi pearls, sugar syrup, and traditional sweet making method.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Ghee Nuvvula Ariselu',
    description: 'Traditional Andhra sweet made with sesame seeds, rice flour, jaggery, and fried in pure ghee.',
    variants: [
      { weight: '250gms', price: 150 },
      { weight: '500gms', price: 300 },
      { weight: '1kg', price: 600 },
    ],
  },
  {
    name: 'Nuvvula Laddu',
    description: 'Healthy sesame seed laddu prepared with roasted sesame seeds and jaggery creating nutritious traditional sweet.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Kara Boondi',
    description: 'Crunchy spicy boondi snack seasoned with chilli powder, curry leaves, peanuts, and traditional South Indian spices.',
    variants: [
      { weight: '250gms', price: 115 },
      { weight: '500gms', price: 230 },
      { weight: '1kg', price: 460 },
    ],
  },
  {
    name: 'KajjiKayalu',
    description: 'Crispy sweet pastry filled with coconut, jaggery, dry fruits, and deep fried for festive traditional treat.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Bellam Gavvalu',
    description: 'Crunchy shell shaped sweet snack coated with melted jaggery syrup creating traditional Andhra dessert delight.',
    variants: [
      { weight: '250gms', price: 125 },
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Karapusa',
    description: 'Crispy traditional South Indian snack made with gram flour, spices, and deep fried to deliver crunchy texture and spicy flavor.',
    variants: [
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Ribbon Pakoda',
    description: 'Crunchy ribbon shaped snack prepared with rice flour, gram flour, butter, and spices, deep fried for delicious crispy taste.',
    variants: [
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
  {
    name: 'Murukkulu',
    description: 'Classic South Indian spiral snack made with rice flour, sesame seeds, butter, and spices, fried until perfectly crispy.',
    variants: [
      { weight: '500gms', price: 250 },
      { weight: '1kg', price: 500 },
    ],
  },
];

// ── Seed Function ────────────────────────────────────────────────────────────

const DEFAULT_STOCK = 100;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing products and variants (keep categories)
  await Product.deleteMany({});
  await ProductVariant.deleteMany({});
  console.log('Cleared existing products and variants (categories kept)');

  const allProducts: { category: string; products: ProductData[] }[] = [
    { category: 'Veg Pickles', products: vegPickles },
    { category: 'Non-Veg Pickles', products: nonVegPickles },
    { category: 'Powders/Spices', products: powdersSpices },
    { category: 'Snacks', products: snacks },
  ];

  let totalProducts = 0;
  let totalVariants = 0;

  for (const group of allProducts) {
    for (const p of group.products) {
      // Create product
      const product = await Product.create({
        name: p.name,
        description: p.description,
        category: categoryMap[group.category],
        variants: [],
        images: [],
        tags: [group.category],
      });

      // Create variants linked to product
      const variantDocs = await ProductVariant.insertMany(
        p.variants.map((v) => ({
          product: product._id,
          weight: v.weight,
          price: v.price,
          stock: DEFAULT_STOCK,
          leftoverStock: DEFAULT_STOCK,
        })),
      );

      // Link variant IDs back to product
      product.variants = variantDocs.map((v) => v._id as mongoose.Types.ObjectId);
      await product.save();

      totalProducts++;
      totalVariants += variantDocs.length;
      console.log(`  ✓ ${p.name} (${variantDocs.length} variants)`);
    }
  }

  console.log(`\nDone! Created ${totalProducts} products with ${totalVariants} variants.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
