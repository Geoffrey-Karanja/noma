// database.js — sets up SQLite and creates all tables if they don't exist

const Database = require('better-sqlite3');
const path = require('path');

// This creates noma.db file inside backend/db/ folder automatically
const db = new Database(path.join(__dirname, 'noma.db'));

// Enable WAL mode — makes reads/writes faster, especially with concurrent requests
db.pragma('journal_mode = WAL');

// ─── CREATE TABLES ───────────────────────────────────────────

// USERS — stores everyone who signs up
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    points      INTEGER DEFAULT 0,
    streak      INTEGER DEFAULT 0,
    last_order  TEXT,
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

// RESTAURANTS — the businesses on the platform
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    cuisine     TEXT    NOT NULL,
    image_emoji TEXT    DEFAULT '🍽️',
    rating      REAL    DEFAULT 0,
    delivery_time TEXT  DEFAULT '20-30 min',
    min_order   REAL    DEFAULT 0,
    is_open     INTEGER DEFAULT 1
  )
`);

// MENU ITEMS — each dish belonging to a restaurant
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name          TEXT    NOT NULL,
    description   TEXT,
    price         REAL    NOT NULL,
    category      TEXT,
    image_emoji   TEXT    DEFAULT '🍴',
    is_available  INTEGER DEFAULT 1,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  )
`);

// ORDERS — a placed order by a user
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    total         REAL    NOT NULL,
    status        TEXT    DEFAULT 'pending',
    address       TEXT,
    created_at    TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id)       REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  )
`);

// ORDER ITEMS — the individual dishes inside each order
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity    INTEGER DEFAULT 1,
    price       REAL    NOT NULL,
    FOREIGN KEY (order_id)      REFERENCES orders(id),
    FOREIGN KEY (menu_item_id)  REFERENCES menu_items(id)
  )
`);

// CART — stores items a user hasn't ordered yet
db.exec(`
  CREATE TABLE IF NOT EXISTS cart (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    menu_item_id  INTEGER NOT NULL,
    quantity      INTEGER DEFAULT 1,
    FOREIGN KEY (user_id)      REFERENCES users(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    UNIQUE(user_id, menu_item_id)
  )
`);

// ─── SEED DATA ────────────────────────────────────────────────
// Only inserts if the restaurants table is empty — safe to run multiple times

const count = db.prepare('SELECT COUNT(*) as c FROM restaurants').get();

if (count.c === 0) {

  const insertRest = db.prepare(`
    INSERT INTO restaurants
      (name, cuisine, image_emoji, rating, delivery_time, min_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO menu_items
      (restaurant_id, name, description, price, category, image_emoji)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // ── RESTAURANT 1 — Sakura Ramen Co. ───────────────────
  const r1 = insertRest.run(
    'Sakura Ramen Co.', 'Japanese', '🍜', 4.9, '20-25 min', 8
  );
  insertItem.run(r1.lastInsertRowid, 'Tonkotsu Ramen',
    'Rich pork bone broth, chashu pork, soft-boiled egg, nori', 12.99, 'Ramen', '🍜');
  insertItem.run(r1.lastInsertRowid, 'Spicy Miso Ramen',
    'Red miso broth, tofu, bamboo shoots, chili oil', 11.99, 'Ramen', '🌶️');
  insertItem.run(r1.lastInsertRowid, 'Shoyu Ramen',
    'Soy-based clear broth, chicken, menma, spring onion', 10.99, 'Ramen', '🍜');
  insertItem.run(r1.lastInsertRowid, 'Vegetarian Ramen',
    'Kombu dashi, mushrooms, corn, bok choy', 10.49, 'Ramen', '🥦');
  insertItem.run(r1.lastInsertRowid, 'Gyoza (6pcs)',
    'Pan-fried pork and cabbage dumplings, ponzu dipping sauce', 6.99, 'Sides', '🥟');
  insertItem.run(r1.lastInsertRowid, 'Takoyaki (8pcs)',
    'Octopus balls, bonito flakes, mayo, okonomiyaki sauce', 7.99, 'Sides', '🐙');
  insertItem.run(r1.lastInsertRowid, 'Edamame',
    'Steamed salted soybeans', 3.99, 'Sides', '🫘');
  insertItem.run(r1.lastInsertRowid, 'Matcha Ice Cream',
    'Premium Japanese green tea ice cream', 4.99, 'Desserts', '🍵');
  insertItem.run(r1.lastInsertRowid, 'Japanese Cheesecake',
    'Light, fluffy Hokkaido-style cheesecake', 5.99, 'Desserts', '🍰');
  insertItem.run(r1.lastInsertRowid, 'Ramune Soda',
    'Japanese marble soda, various flavours', 2.99, 'Drinks', '🥤');

  // ── RESTAURANT 2 — The Ember & Stone ──────────────────
  const r2 = insertRest.run(
    'The Ember & Stone', 'Steakhouse', '🥩', 4.8, '30-40 min', 20
  );
  insertItem.run(r2.lastInsertRowid, 'Wagyu Ribeye 200g',
    'A5 wagyu, truffle butter, roasted garlic, sea salt', 45.99, 'Steaks', '🥩');
  insertItem.run(r2.lastInsertRowid, 'Sirloin 300g',
    'Prime sirloin, peppercorn sauce, choice of side', 32.99, 'Steaks', '🥩');
  insertItem.run(r2.lastInsertRowid, 'Tomahawk 600g',
    'Bone-in ribeye, chimichurri, roasted bone marrow', 78.99, 'Steaks', '🍖');
  insertItem.run(r2.lastInsertRowid, 'Filet Mignon 200g',
    'Tenderloin medallion, red wine reduction, asparagus', 52.99, 'Steaks', '🥩');
  insertItem.run(r2.lastInsertRowid, 'Smoked Brisket',
    '12hr slow-smoked beef brisket, house BBQ glaze, pickles', 24.99, 'Mains', '🍖');
  insertItem.run(r2.lastInsertRowid, 'BBQ Lamb Ribs',
    'Slow-cooked lamb ribs, harissa glaze, mint yogurt', 28.99, 'Mains', '🍖');
  insertItem.run(r2.lastInsertRowid, 'Loaded Fries',
    'Triple-cooked fries, aged cheddar, bacon, jalapeños', 8.99, 'Sides', '🍟');
  insertItem.run(r2.lastInsertRowid, 'Creamed Spinach',
    'Wilted baby spinach, cream, nutmeg, parmesan', 6.99, 'Sides', '🥬');
  insertItem.run(r2.lastInsertRowid, 'Bone Marrow',
    'Roasted bone marrow, crostini, herb salad', 12.99, 'Starters', '🦴');
  insertItem.run(r2.lastInsertRowid, 'Caesar Salad',
    'Romaine, house caesar dressing, parmesan, croutons', 9.99, 'Starters', '🥗');
  insertItem.run(r2.lastInsertRowid, 'Chocolate Lava Cake',
    'Warm dark chocolate fondant, vanilla ice cream', 9.99, 'Desserts', '🍫');
  insertItem.run(r2.lastInsertRowid, 'Red Wine (Glass)',
    'Curated selection of premium reds', 12.99, 'Drinks', '🍷');

  // ── RESTAURANT 3 — Garden Theory ──────────────────────
  const r3 = insertRest.run(
    'Garden Theory', 'Vegan', '🥗', 4.7, '25-30 min', 6
  );
  insertItem.run(r3.lastInsertRowid, 'Buddha Bowl',
    'Quinoa, roasted chickpeas, avocado, tahini dressing', 13.99, 'Bowls', '🥗');
  insertItem.run(r3.lastInsertRowid, 'Rainbow Bowl',
    'Brown rice, edamame, mango, red cabbage, ginger dressing', 12.99, 'Bowls', '🌈');
  insertItem.run(r3.lastInsertRowid, 'Protein Power Bowl',
    'Lentils, roasted sweet potato, kale, hemp seeds', 13.49, 'Bowls', '💪');
  insertItem.run(r3.lastInsertRowid, 'Avocado Toast',
    'Sourdough, smashed avo, cherry tomatoes, microgreens', 9.99, 'Breakfast', '🥑');
  insertItem.run(r3.lastInsertRowid, 'Açaí Bowl',
    'Açaí blend, granola, banana, fresh berries, coconut', 10.99, 'Breakfast', '🫐');
  insertItem.run(r3.lastInsertRowid, 'Chia Pudding',
    'Coconut milk chia pudding, mango coulis, toasted coconut', 7.99, 'Breakfast', '🌴');
  insertItem.run(r3.lastInsertRowid, 'Jackfruit Tacos',
    'Pulled jackfruit, chipotle, slaw, cashew cream, corn tortillas', 11.99, 'Mains', '🌮');
  insertItem.run(r3.lastInsertRowid, 'Mushroom Burger',
    'Portobello patty, vegan cheese, lettuce, tomato, brioche bun', 12.99, 'Mains', '🍔');
  insertItem.run(r3.lastInsertRowid, 'Cauliflower Wings',
    'Crispy cauliflower, buffalo sauce, celery, vegan ranch', 9.99, 'Snacks', '🔥');
  insertItem.run(r3.lastInsertRowid, 'Green Smoothie',
    'Spinach, banana, mango, almond milk, chia seeds', 5.99, 'Drinks', '🥤');
  insertItem.run(r3.lastInsertRowid, 'Cold Brew Lemonade',
    'Cold brew coffee, fresh lemon, agave, sparkling water', 4.99, 'Drinks', '🍋');
  insertItem.run(r3.lastInsertRowid, 'Raw Brownie',
    'Dates, walnuts, raw cacao — no bake, guilt-free', 5.49, 'Desserts', '🍫');

  // ── RESTAURANT 4 — Napoli House ───────────────────────
  const r4 = insertRest.run(
    'Napoli House', 'Italian', '🍕', 4.6, '20-35 min', 10
  );
  insertItem.run(r4.lastInsertRowid, 'Margherita Pizza',
    'San Marzano tomato, fior di latte mozzarella, fresh basil', 14.99, 'Pizza', '🍕');
  insertItem.run(r4.lastInsertRowid, 'Truffle Mushroom Pizza',
    'Truffle cream, mixed wild mushrooms, parmesan, rocket', 18.99, 'Pizza', '🍄');
  insertItem.run(r4.lastInsertRowid, 'Diavola Pizza',
    'Spicy salami, san marzano, mozzarella, chili flakes', 16.99, 'Pizza', '🌶️');
  insertItem.run(r4.lastInsertRowid, 'Quattro Stagioni',
    'Ham, artichokes, olives, mushrooms, four-season style', 17.99, 'Pizza', '🍕');
  insertItem.run(r4.lastInsertRowid, 'Prosciutto Arugula',
    'Prosciutto crudo, rocket, cherry tomatoes, parmesan shavings', 19.99, 'Pizza', '🥗');
  insertItem.run(r4.lastInsertRowid, 'Spaghetti Carbonara',
    'Guanciale, egg yolk, pecorino romano, black pepper', 15.99, 'Pasta', '🍝');
  insertItem.run(r4.lastInsertRowid, 'Penne Arrabbiata',
    'San marzano, garlic, chili, fresh parsley, extra virgin olive oil', 12.99, 'Pasta', '🍝');
  insertItem.run(r4.lastInsertRowid, 'Lasagne al Forno',
    'Layers of beef ragu, béchamel, fresh pasta, parmesan', 16.99, 'Pasta', '🍝');
  insertItem.run(r4.lastInsertRowid, 'Bruschetta',
    'Grilled sourdough, tomato, basil, garlic, extra virgin olive oil', 7.99, 'Starters', '🍅');
  insertItem.run(r4.lastInsertRowid, 'Burrata',
    'Fresh burrata, heritage tomatoes, basil oil, sea salt', 11.99, 'Starters', '🧀');
  insertItem.run(r4.lastInsertRowid, 'Tiramisu',
    'Classic Italian — mascarpone, espresso, ladyfingers, cocoa', 7.99, 'Desserts', '🍮');
  insertItem.run(r4.lastInsertRowid, 'Panna Cotta',
    'Vanilla bean panna cotta, berry coulis', 6.99, 'Desserts', '🍮');

  // ── RESTAURANT 5 — Seoul Kitchen ──────────────────────
  const r5 = insertRest.run(
    'Seoul Kitchen', 'Korean', '🥘', 4.8, '25-35 min', 10
  );
  insertItem.run(r5.lastInsertRowid, 'Beef Bibimbap',
    'Rice bowl, marinated beef, vegetables, gochujang, fried egg', 13.99, 'Rice Bowls', '🍚');
  insertItem.run(r5.lastInsertRowid, 'Dolsot Bibimbap',
    'Stone pot bibimbap, crispy rice crust, mixed vegetables', 14.99, 'Rice Bowls', '🍚');
  insertItem.run(r5.lastInsertRowid, 'Tofu Sundubu Jjigae',
    'Soft tofu stew, clams, mushrooms, gochugaru, egg', 12.99, 'Stews', '🍲');
  insertItem.run(r5.lastInsertRowid, 'Kimchi Jjigae',
    'Fermented kimchi stew, pork belly, tofu, rice', 11.99, 'Stews', '🍲');
  insertItem.run(r5.lastInsertRowid, 'Korean Fried Chicken',
    'Double-fried chicken, soy garlic or spicy sauce, pickled radish', 14.99, 'Chicken', '🍗');
  insertItem.run(r5.lastInsertRowid, 'Dakgalbi',
    'Spicy stir-fried chicken, rice cakes, cabbage, gochujang', 13.99, 'Chicken', '🍗');
  insertItem.run(r5.lastInsertRowid, 'Japchae',
    'Glass noodles, beef, spinach, carrots, sesame oil', 11.99, 'Noodles', '🍜');
  insertItem.run(r5.lastInsertRowid, 'Tteokbokki',
    'Spicy rice cakes, fish cake, scallions, gochujang broth', 9.99, 'Snacks', '🌶️');
  insertItem.run(r5.lastInsertRowid, 'Pajeon',
    'Korean scallion pancake, dipping sauce', 8.99, 'Snacks', '🥞');
  insertItem.run(r5.lastInsertRowid, 'Kimchi Pancake',
    'Crispy kimchi jeon, gochujang dipping sauce', 8.49, 'Snacks', '🥞');
  insertItem.run(r5.lastInsertRowid, 'Bingsu',
    'Shaved ice, red bean, condensed milk, mochi', 6.99, 'Desserts', '🧊');
  insertItem.run(r5.lastInsertRowid, 'Sikhye',
    'Traditional Korean sweet rice punch, chilled', 2.99, 'Drinks', '🥤');

  // ── RESTAURANT 6 — The Taco Cartel ────────────────────
  const r6 = insertRest.run(
    'The Taco Cartel', 'Mexican', '🌮', 4.7, '15-25 min', 8
  );
  insertItem.run(r6.lastInsertRowid, 'Al Pastor Tacos (3)',
    'Marinated pork, pineapple, white onion, cilantro, salsa verde', 11.99, 'Tacos', '🌮');
  insertItem.run(r6.lastInsertRowid, 'Carne Asada Tacos (3)',
    'Grilled skirt steak, guacamole, pico de gallo, corn tortilla', 12.99, 'Tacos', '🌮');
  insertItem.run(r6.lastInsertRowid, 'Shrimp Tacos (3)',
    'Grilled shrimp, chipotle mayo, slaw, mango salsa', 13.99, 'Tacos', '🦐');
  insertItem.run(r6.lastInsertRowid, 'Mushroom Tacos (3)',
    'Roasted mushrooms, black beans, avocado crema, pickled onion', 10.99, 'Tacos', '🍄');
  insertItem.run(r6.lastInsertRowid, 'Chicken Quesadilla',
    'Grilled chicken, oaxaca cheese, peppers, sour cream, salsa', 11.99, 'Quesadillas', '🫓');
  insertItem.run(r6.lastInsertRowid, 'Beef Quesadilla',
    'Seasoned ground beef, cheese blend, jalapeños, guacamole', 12.99, 'Quesadillas', '🫓');
  insertItem.run(r6.lastInsertRowid, 'Chicken Burrito',
    'Grilled chicken, rice, black beans, cheese, salsa, sour cream', 13.99, 'Burritos', '🌯');
  insertItem.run(r6.lastInsertRowid, 'Carne Asada Burrito',
    'Skirt steak, mexican rice, refried beans, guacamole, pico', 14.99, 'Burritos', '🌯');
  insertItem.run(r6.lastInsertRowid, 'Nachos Grande',
    'Tortilla chips, cheese sauce, jalapeños, guac, sour cream, salsa', 10.99, 'Sides', '🧀');
  insertItem.run(r6.lastInsertRowid, 'Elote',
    'Mexican street corn, cotija cheese, chili, lime, mayo', 5.99, 'Sides', '🌽');
  insertItem.run(r6.lastInsertRowid, 'Churros',
    'Fried dough, cinnamon sugar, chocolate dipping sauce', 6.99, 'Desserts', '🍩');
  insertItem.run(r6.lastInsertRowid, 'Horchata',
    'Rice milk, cinnamon, vanilla — chilled', 3.99, 'Drinks', '🥛');
  insertItem.run(r6.lastInsertRowid, 'Michelada',
    'Beer, lime, hot sauce, chamoy, chili rim', 5.99, 'Drinks', '🍺');

  // ── RESTAURANT 7 — Spice Route ────────────────────────
  const r7 = insertRest.run(
    'Spice Route', 'Indian', '🍛', 4.7, '25-40 min', 10
  );
  insertItem.run(r7.lastInsertRowid, 'Butter Chicken',
    'Tender chicken in rich tomato-cream sauce, served with naan', 14.99, 'Curries', '🍛');
  insertItem.run(r7.lastInsertRowid, 'Lamb Rogan Josh',
    'Slow-braised lamb, Kashmiri spices, aromatic gravy', 16.99, 'Curries', '🍛');
  insertItem.run(r7.lastInsertRowid, 'Palak Paneer',
    'Fresh cottage cheese in spiced spinach gravy', 12.99, 'Curries', '🥬');
  insertItem.run(r7.lastInsertRowid, 'Dal Makhani',
    'Black lentils slow-cooked overnight, cream, butter', 11.99, 'Curries', '🫘');
  insertItem.run(r7.lastInsertRowid, 'Chicken Biryani',
    'Basmati rice, marinated chicken, saffron, crispy onions, raita', 16.99, 'Biryani', '🍚');
  insertItem.run(r7.lastInsertRowid, 'Vegetable Biryani',
    'Aromatic basmati, seasonal vegetables, whole spices, mint', 13.99, 'Biryani', '🍚');
  insertItem.run(r7.lastInsertRowid, 'Garlic Naan',
    'Clay oven flatbread, garlic butter, fresh coriander', 3.49, 'Breads', '🫓');
  insertItem.run(r7.lastInsertRowid, 'Peshwari Naan',
    'Sweet naan stuffed with coconut, almonds, sultanas', 3.99, 'Breads', '🫓');
  insertItem.run(r7.lastInsertRowid, 'Samosa (2pcs)',
    'Crispy pastry, spiced potato and pea filling, mint chutney', 5.99, 'Starters', '🥟');
  insertItem.run(r7.lastInsertRowid, 'Onion Bhaji',
    'Crispy spiced onion fritters, tamarind chutney', 5.49, 'Starters', '🧅');
  insertItem.run(r7.lastInsertRowid, 'Mango Lassi',
    'Chilled yogurt drink with fresh Alphonso mango', 4.49, 'Drinks', '🥭');
  insertItem.run(r7.lastInsertRowid, 'Gulab Jamun',
    'Milk solids dumplings in rose-scented sugar syrup', 4.99, 'Desserts', '🍮');
  insertItem.run(r7.lastInsertRowid, 'Kheer',
    'Rice pudding with cardamom, saffron, pistachios', 4.49, 'Desserts', '🍚');

  // ── RESTAURANT 8 — The Burger Lab ─────────────────────
  const r8 = insertRest.run(
    'The Burger Lab', 'American', '🍔', 4.6, '15-25 min', 8
  );
  insertItem.run(r8.lastInsertRowid, 'Classic Smash Burger',
    'Double smashed patty, american cheese, pickles, special sauce', 12.99, 'Burgers', '🍔');
  insertItem.run(r8.lastInsertRowid, 'Bacon BBQ Burger',
    'Beef patty, crispy bacon, BBQ sauce, cheddar, onion rings', 14.99, 'Burgers', '🍔');
  insertItem.run(r8.lastInsertRowid, 'Mushroom Swiss Burger',
    'Beef patty, sautéed mushrooms, gruyère, truffle aioli', 15.99, 'Burgers', '🍔');
  insertItem.run(r8.lastInsertRowid, 'Spicy Habanero Burger',
    'Beef patty, habanero sauce, pepper jack, jalapeños, slaw', 14.49, 'Burgers', '🌶️');
  insertItem.run(r8.lastInsertRowid, 'Crispy Chicken Burger',
    'Buttermilk fried chicken, pickles, hot honey, brioche bun', 13.99, 'Burgers', '🍗');
  insertItem.run(r8.lastInsertRowid, 'Plant Burger',
    'Beyond beef patty, vegan cheese, lettuce, tomato, vegan mayo', 13.49, 'Burgers', '🌱');
  insertItem.run(r8.lastInsertRowid, 'Truffle Parmesan Fries',
    'Thin-cut fries, truffle oil, grated parmesan, chives', 7.99, 'Sides', '🍟');
  insertItem.run(r8.lastInsertRowid, 'Onion Rings',
    'Beer-battered onion rings, chipotle dipping sauce', 6.99, 'Sides', '🧅');
  insertItem.run(r8.lastInsertRowid, 'Mac & Cheese Bites',
    'Crispy fried mac and cheese, sriracha ranch dip', 7.49, 'Sides', '🧀');
  insertItem.run(r8.lastInsertRowid, 'Coleslaw',
    'Creamy house coleslaw, apple cider vinegar dressing', 3.99, 'Sides', '🥗');
  insertItem.run(r8.lastInsertRowid, 'Vanilla Milkshake',
    'Thick hand-spun vanilla milkshake, whipped cream', 5.99, 'Drinks', '🥤');
  insertItem.run(r8.lastInsertRowid, 'Oreo Milkshake',
    'Crushed Oreo milkshake, extra thick, topped with an Oreo', 6.99, 'Drinks', '🥤');

  // ── RESTAURANT 9 — Dragon Palace ──────────────────────
  const r9 = insertRest.run(
    'Dragon Palace', 'Chinese', '🥡', 4.5, '20-30 min', 9
  );
  insertItem.run(r9.lastInsertRowid, 'Peking Duck (Half)',
    'Crispy duck, pancakes, spring onion, cucumber, hoisin sauce', 28.99, 'Duck', '🦆');
  insertItem.run(r9.lastInsertRowid, 'Kung Pao Chicken',
    'Wok-fried chicken, peanuts, dried chili, Sichuan pepper', 13.99, 'Mains', '🍗');
  insertItem.run(r9.lastInsertRowid, 'Mapo Tofu',
    'Silken tofu, minced pork, doubanjiang, Sichuan pepper oil', 11.99, 'Mains', '🌶️');
  insertItem.run(r9.lastInsertRowid, 'Sweet & Sour Pork',
    'Crispy pork, pineapple, peppers, tangy sweet sour sauce', 13.49, 'Mains', '🍍');
  insertItem.run(r9.lastInsertRowid, 'Beef & Broccoli',
    'Sliced beef, broccoli, oyster sauce, ginger, garlic', 13.99, 'Mains', '🥦');
  insertItem.run(r9.lastInsertRowid, 'Char Siu Roast Pork',
    'Cantonese BBQ pork, honey glaze, steamed rice', 14.99, 'Mains', '🍖');
  insertItem.run(r9.lastInsertRowid, 'Dim Sum Basket (6pcs)',
    'Assorted har gow and siu mai, soy dipping sauce', 9.99, 'Dim Sum', '🥟');
  insertItem.run(r9.lastInsertRowid, 'Xiao Long Bao (6pcs)',
    'Shanghai soup dumplings, pork filling, ginger vinegar', 10.99, 'Dim Sum', '🥟');
  insertItem.run(r9.lastInsertRowid, 'Spring Rolls (4pcs)',
    'Crispy vegetable spring rolls, sweet chili sauce', 6.99, 'Starters', '🥢');
  insertItem.run(r9.lastInsertRowid, 'Egg Fried Rice',
    'Wok-fried rice, egg, spring onion, soy sauce', 7.99, 'Rice', '🍚');
  insertItem.run(r9.lastInsertRowid, 'Yang Chow Fried Rice',
    'Shrimp, char siu, egg, peas, wok-fried jasmine rice', 10.99, 'Rice', '🍚');
  insertItem.run(r9.lastInsertRowid, 'Mango Pudding',
    'Chilled mango pudding, fresh mango, evaporated milk', 4.99, 'Desserts', '🥭');

  // ── RESTAURANT 10 — Beirut Street ─────────────────────
  const r10 = insertRest.run(
    'Beirut Street', 'Lebanese', '🧆', 4.8, '20-30 min', 9
  );
  insertItem.run(r10.lastInsertRowid, 'Mixed Shawarma Plate',
    'Chicken & beef shawarma, garlic sauce, pickles, pita', 14.99, 'Shawarma', '🌯');
  insertItem.run(r10.lastInsertRowid, 'Chicken Shawarma Wrap',
    'Marinated chicken, garlic sauce, lettuce, tomato, pita', 10.99, 'Shawarma', '🌯');
  insertItem.run(r10.lastInsertRowid, 'Beef Shawarma Wrap',
    'Spiced beef, tahini, parsley, tomato, pita bread', 11.99, 'Shawarma', '🌯');
  insertItem.run(r10.lastInsertRowid, 'Mixed Grill Platter',
    'Lamb kofta, chicken shish, beef kebab, grilled vegetables', 22.99, 'Grills', '🍢');
  insertItem.run(r10.lastInsertRowid, 'Lamb Kofta',
    'Minced lamb, parsley, onion, spices, grilled on skewer', 14.99, 'Grills', '🍢');
  insertItem.run(r10.lastInsertRowid, 'Mezze Platter',
    'Hummus, baba ganoush, tabouleh, fattoush, pita bread', 16.99, 'Mezze', '🫙');
  insertItem.run(r10.lastInsertRowid, 'Hummus',
    'Classic creamy hummus, olive oil, paprika, warm pita', 6.99, 'Mezze', '🫙');
  insertItem.run(r10.lastInsertRowid, 'Falafel (6pcs)',
    'Crispy chickpea falafel, tahini sauce, pickled vegetables', 7.99, 'Mezze', '🧆');
  insertItem.run(r10.lastInsertRowid, 'Fattoush Salad',
    'Toasted pita, tomato, cucumber, sumac, pomegranate dressing', 8.99, 'Salads', '🥗');
  insertItem.run(r10.lastInsertRowid, 'Tabouleh',
    'Fine bulgur, parsley, mint, tomato, lemon, olive oil', 7.99, 'Salads', '🥗');
  insertItem.run(r10.lastInsertRowid, 'Baklava (3pcs)',
    'Layered filo pastry, pistachios, rose water honey syrup', 5.99, 'Desserts', '🍯');
  insertItem.run(r10.lastInsertRowid, 'Jallab',
    'Rose water, grape juice, pine nuts, raisins — chilled', 3.99, 'Drinks', '🌹');

  // ── RESTAURANT 11 — Ocean Basket ──────────────────────
  const r11 = insertRest.run(
    'Ocean Basket', 'Seafood', '🦞', 4.7, '25-35 min', 15
  );
  insertItem.run(r11.lastInsertRowid, 'Grilled Lobster',
    'Whole lobster, drawn butter, lemon, garlic, fresh herbs', 54.99, 'Lobster', '🦞');
  insertItem.run(r11.lastInsertRowid, 'Lobster Thermidor',
    'Lobster in creamy mustard-cognac sauce, gruyère crust', 58.99, 'Lobster', '🦞');
  insertItem.run(r11.lastInsertRowid, 'Grilled Sea Bass',
    'Whole sea bass, lemon butter, capers, roasted vegetables', 28.99, 'Fish', '🐟');
  insertItem.run(r11.lastInsertRowid, 'Fish & Chips',
    'Beer-battered cod, triple-cooked chips, mushy peas, tartare', 16.99, 'Fish', '🐟');
  insertItem.run(r11.lastInsertRowid, 'Prawn Peri-Peri',
    'Tiger prawns, peri-peri sauce, garlic butter, crusty bread', 22.99, 'Prawns', '🦐');
  insertItem.run(r11.lastInsertRowid, 'Garlic Butter Prawns',
    'Tiger prawns, garlic, butter, white wine, parsley', 21.99, 'Prawns', '🦐');
  insertItem.run(r11.lastInsertRowid, 'Calamari',
    'Crispy fried calamari, aioli dipping sauce, lemon wedge', 12.99, 'Starters', '🦑');
  insertItem.run(r11.lastInsertRowid, 'Oysters (6pcs)',
    'Fresh oysters, mignonette, lemon, tabasco', 18.99, 'Starters', '🦪');
  insertItem.run(r11.lastInsertRowid, 'Seafood Chowder',
    'Creamy chowder, clams, shrimp, potato, smoked bacon', 11.99, 'Soups', '🍲');
  insertItem.run(r11.lastInsertRowid, 'Seafood Linguine',
    'Prawns, mussels, clams, squid, cherry tomato, white wine', 24.99, 'Pasta', '🍝');
  insertItem.run(r11.lastInsertRowid, 'Lemon Tart',
    'Classic French lemon tart, crème fraîche, candied zest', 7.99, 'Desserts', '🍋');
  insertItem.run(r11.lastInsertRowid, 'White Wine (Glass)',
    'Crisp, chilled white wine — perfect with seafood', 9.99, 'Drinks', '🍷');

  // ── RESTAURANT 12 — Sushiwa ───────────────────────────
  const r12 = insertRest.run(
    'Sushiwa', 'Japanese', '🍣', 4.9, '25-35 min', 15
  );
  insertItem.run(r12.lastInsertRowid, 'Salmon Nigiri (2pcs)',
    'Hand-pressed sushi rice, fresh Atlantic salmon', 6.99, 'Nigiri', '🍣');
  insertItem.run(r12.lastInsertRowid, 'Tuna Nigiri (2pcs)',
    'Hand-pressed sushi rice, bluefin tuna', 7.99, 'Nigiri', '🍣');
  insertItem.run(r12.lastInsertRowid, 'Yellowtail Nigiri (2pcs)',
    'Hand-pressed sushi rice, yellowtail, jalapeño', 7.49, 'Nigiri', '🍣');
  insertItem.run(r12.lastInsertRowid, 'Dragon Roll',
    'Shrimp tempura, cucumber, avocado on top, eel sauce', 16.99, 'Rolls', '🐉');
  insertItem.run(r12.lastInsertRowid, 'Spicy Tuna Roll',
    'Fresh tuna, sriracha mayo, cucumber, sesame seeds', 14.99, 'Rolls', '🌶️');
  insertItem.run(r12.lastInsertRowid, 'Rainbow Roll',
    'California roll topped with assorted sashimi', 17.99, 'Rolls', '🌈');
  insertItem.run(r12.lastInsertRowid, 'Salmon Sashimi (5pcs)',
    'Premium sliced raw salmon, wasabi, pickled ginger, soy', 14.99, 'Sashimi', '🐟');
  insertItem.run(r12.lastInsertRowid, 'Sashimi Deluxe (12pcs)',
    'Chef\'s selection of premium raw fish — tuna, salmon, yellowtail', 28.99, 'Sashimi', '🐟');
  insertItem.run(r12.lastInsertRowid, 'Miso Soup',
    'Dashi broth, white miso, tofu, wakame, spring onion', 3.49, 'Soups', '🍵');
  insertItem.run(r12.lastInsertRowid, 'Edamame',
    'Steamed salted soybeans, sea salt flakes', 3.99, 'Sides', '🫘');
  insertItem.run(r12.lastInsertRowid, 'Mochi Ice Cream (3pcs)',
    'Matcha, mango and strawberry mochi ice cream', 6.99, 'Desserts', '🍡');
  insertItem.run(r12.lastInsertRowid, 'Sake (180ml)',
    'Premium chilled Japanese sake, served in a traditional cup', 8.99, 'Drinks', '🍶');

  console.log('✅ Database seeded — 12 restaurants, 140+ menu items');
}

module.exports = db;