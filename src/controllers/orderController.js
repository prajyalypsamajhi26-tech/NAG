const { ordersDb, ratingsDb } = require('../models/Database');
const smsGateway = require('../models/SMSGateway');
const { v4: uuidv4 } = require('uuid');

// ── Items catalog ────────────────────────────────────────────────────────────
const ITEMS_CATALOG = {
  "🥬 Groceries": [
    { id: 'tomato-01',    name: 'Fresh Tomatoes - 500g',   price: 30,  img: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'potato-01',   name: 'Potatoes - 1kg',           price: 40,  img: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'onion-01',    name: 'Onions - 1kg',             price: 35,  img: 'https://images.pexels.com/photos/175414/pexels-photo-175414.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'spinach-01',  name: 'Fresh Spinach - 250g',     price: 25,  img: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'carrot-01',   name: 'Carrots - 500g',           price: 30,  img: 'https://images.pexels.com/photos/1306559/pexels-photo-1306559.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'capsicum-01', name: 'Capsicum - 3 pcs',         price: 45,  img: 'https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'milk-01',     name: 'Fresh Milk - 500ml',       price: 30,  img: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'bread-01',    name: 'Whole Wheat Bread',        price: 45,  img: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'eggs-01',     name: 'Farm Eggs - 6 pcs',        price: 60,  img: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'babycorn-01',    name: 'Baby Corn - 200g',        price: 35,  img: 'https://images.pexels.com/photos/5529545/pexels-photo-5529545.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'ladyfinger-01',  name: 'Ladyfinger (Bhindi) - 250g', price: 25, img: 'https://images.pexels.com/photos/8605558/pexels-photo-8605558.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cauliflower-01', name: 'Cauliflower - 1 pc',     price: 40,  img: 'https://images.pexels.com/photos/7282997/pexels-photo-7282997.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'greenpeas-01',   name: 'Green Peas - 250g',      price: 30,  img: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'bittergourd-01', name: 'Bitter Gourd (Karela) - 250g', price: 25, img: 'https://images.pexels.com/photos/6544369/pexels-photo-6544369.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'brinjal-01',     name: 'Brinjal (Baingan) - 500g', price: 30, img: 'https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'banana-01',      name: 'Banana - 6 pcs',          price: 40,  img: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'apple-01',       name: 'Apple - 4 pcs',           price: 80,  img: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'mango-01',       name: 'Mango - 2 pcs',           price: 60,  img: 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'grapes-01',      name: 'Green Grapes - 500g',     price: 70,  img: 'https://images.pexels.com/photos/760281/pexels-photo-760281.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'watermelon-01',  name: 'Watermelon - 1 pc',       price: 90,  img: 'https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pomegranate-01', name: 'Pomegranate - 2 pcs',     price: 85,  img: 'https://images.pexels.com/photos/4051470/pexels-photo-4051470.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'papaya-01',      name: 'Papaya - 1 pc',           price: 55,  img: 'https://images.pexels.com/photos/5945561/pexels-photo-5945561.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cucumber-01',    name: 'Cucumber - 4 pcs',        price: 20,  img: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'beetroot-01',    name: 'Beetroot - 3 pcs',        price: 30,  img: 'https://images.pexels.com/photos/3590401/pexels-photo-3590401.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'sweetcorn-01',   name: 'Sweet Corn - 2 pcs',      price: 30,  img: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'drumstick-01',   name: 'Drumstick (Moringa) - 4 pcs', price: 25, img: 'https://images.pexels.com/photos/6823456/pexels-photo-6823456.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'radish-01',      name: 'Radish (Mooli) - 4 pcs',  price: 20,  img: 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'beans-01',       name: 'French Beans - 250g',     price: 30,  img: 'https://images.pexels.com/photos/3997729/pexels-photo-3997729.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cabbage-01',     name: 'Cabbage - 1 pc',          price: 35,  img: 'https://images.pexels.com/photos/9511935/pexels-photo-9511935.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pumpkin-01',     name: 'Pumpkin - 500g',          price: 25,  img: 'https://images.pexels.com/photos/1210525/pexels-photo-1210525.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'mushroom-01',    name: 'Button Mushroom - 200g',  price: 55,  img: 'https://images.pexels.com/photos/1261682/pexels-photo-1261682.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'sweetpotato-01', name: 'Sweet Potato - 500g',     price: 35,  img: 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'garlic-01',      name: 'Garlic - 100g',           price: 20,  img: 'https://images.pexels.com/photos/1392585/pexels-photo-1392585.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'ginger-01',      name: 'Ginger - 100g',           price: 20,  img: 'https://images.pexels.com/photos/1460862/pexels-photo-1460862.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'lemon-01',       name: 'Lemon - 6 pcs',           price: 20,  img: 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'orange-01',      name: 'Orange - 4 pcs',          price: 60,  img: 'https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pineapple-01',   name: 'Pineapple - 1 pc',        price: 70,  img: 'https://images.pexels.com/photos/947879/pexels-photo-947879.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'guava-01',       name: 'Guava - 4 pcs',           price: 40,  img: 'https://images.pexels.com/photos/5945559/pexels-photo-5945559.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'strawberry-01',  name: 'Strawberry - 250g',       price: 90,  img: 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'kiwi-01',        name: 'Kiwi - 4 pcs',            price: 100, img: 'https://images.pexels.com/photos/51312/kiwi-fruit-vitamins-healthy-eating-51312.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pear-01',        name: 'Pear - 4 pcs',            price: 80,  img: 'https://images.pexels.com/photos/568471/pexels-photo-568471.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coconut-01',     name: 'Fresh Coconut - 1 pc',    price: 45,  img: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'paneer-01',      name: 'Fresh Paneer - 200g',     price: 80,  img: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'curd-01',        name: 'Fresh Curd - 400g',       price: 40,  img: 'https://images.pexels.com/photos/373882/pexels-photo-373882.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'butter-01',      name: 'Butter - 100g',           price: 55,  img: 'https://images.pexels.com/photos/531334/pexels-photo-531334.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'rice-01',        name: 'Basmati Rice - 1kg',      price: 90,  img: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'dal-01',         name: 'Toor Dal - 500g',         price: 70,  img: 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "🍔 Food": [
    { id: 'burger-01',      name: 'Classic Veg Burger',            price: 120, img: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'burger-02',      name: 'Paneer Tikka Burger',           price: 140, img: 'https://images.pexels.com/photos/3219547/pexels-photo-3219547.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pizza-01',       name: 'Margherita Pizza - 8"',         price: 199, img: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pizza-02',       name: 'Paneer Tikka Pizza - 8"',       price: 249, img: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pizza-03',       name: 'Veg Supreme Pizza - 8"',        price: 269, img: 'https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'biryani-01',     name: 'Veg Biryani - 1 plate',         price: 150, img: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'biryani-02',     name: 'Chicken Biryani - 1 plate',     price: 200, img: 'https://images.pexels.com/photos/7426873/pexels-photo-7426873.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'sandwich-01',    name: 'Grilled Veg Sandwich',          price: 80,  img: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'sandwich-02',    name: 'Club Sandwich',                 price: 110, img: 'https://images.pexels.com/photos/5900785/pexels-photo-5900785.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'dosa-01',        name: 'Masala Dosa',                   price: 90,  img: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'dosa-02',        name: 'Rava Dosa',                     price: 100, img: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'idli-01',        name: 'Idli Sambar - 4 pcs',           price: 70,  img: 'https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'vada-01',        name: 'Medu Vada - 2 pcs',             price: 60,  img: 'https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'parathas-01',    name: 'Aloo Paratha - 2 pcs',          price: 80,  img: 'https://images.pexels.com/photos/7624996/pexels-photo-7624996.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'parathas-02',    name: 'Paneer Paratha - 2 pcs',        price: 100, img: 'https://images.pexels.com/photos/7624996/pexels-photo-7624996.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'noodles-01',     name: 'Veg Hakka Noodles',             price: 120, img: 'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'friedrice-01',   name: 'Veg Fried Rice',                price: 130, img: 'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pasta-01',       name: 'Penne Arrabbiata Pasta',        price: 150, img: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pasta-02',       name: 'Creamy White Sauce Pasta',      price: 160, img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'rolls-01',       name: 'Paneer Kathi Roll - 2 pcs',     price: 130, img: 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pav-bhaji-01',   name: 'Pav Bhaji - 1 plate',           price: 110, img: 'https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'chole-01',       name: 'Chole Bhature - 1 plate',       price: 120, img: 'https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'samosa-01',      name: 'Samosa - 2 pcs',                price: 30,  img: 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'paneer-dish-01', name: 'Paneer Butter Masala + Rice',   price: 180, img: 'https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'dal-tadka-01',   name: 'Dal Tadka + Rice',              price: 140, img: 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'thali-01',       name: 'Veg Thali - Full Meal',         price: 220, img: 'https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "🍿 Snacks": [
    { id: 'chips-01',      name: "Lay's Classic Salted - 51g",              price: 20,  img: 'https://www.bigbasket.com/media/uploads/p/xxl/40099398_6-lays-potato-chips-classic-salted.jpg' },
    { id: 'chips-02',      name: "Lay's Cream & Onion - 26g",               price: 20,  img: 'https://www.bigbasket.com/media/uploads/p/xxl/40099394_6-lays-potato-chips-american-style-cream-onion.jpg' },
    { id: 'chips-03',      name: "Lay's Sizzling Hot - 52.9g",              price: 20,  img: '/images/lays_sizzling_hot.png' },
    { id: 'chips-04',      name: "Lay's Tomato Tango - 26g",                price: 20,  img: 'https://www.bigbasket.com/media/uploads/p/xxl/40099397_6-lays-potato-chips-tomato-tango.jpg' },
    { id: 'pringles-01',   name: "Pringles Original - 40g",                 price: 51,  img: '/images/pringles_original.svg' },
    { id: 'pringles-02',   name: "Pringles Sour Cream & Onion - 40g",       price: 51,  img: '/images/pringles_sour_cream.svg' },
    { id: 'balaji-01',     name: "Balaji Crunchex Chilli Tadka - 140g",     price: 40,  img: '/images/lays_all_flavors.png' },
    { id: 'balaji-02',     name: "Balaji Rumbles Pudina Twist - 140g",      price: 40,  img: '/images/lays_all_flavors.png' },
    { id: 'crax-01',       name: "Crax Biggies Chilli Cheese - 65g",        price: 24,  img: '/images/cheese_balls.svg' },
    { id: 'crax-02',       name: "Crax Crunchy Pipes Salted - 73g",         price: 33,  img: '/images/all_flavors_pringles.png' },
    { id: 'crax-03',       name: "Crax Fritts Peri Peri Corn - 84g",        price: 30,  img: '/images/lays_all_flavors.png' },
    { id: 'beyond-01',     name: "Beyond Snack Hot Sweet Chilli - 75g",     price: 57,  img: '/images/lays_classic_salted.png' },
    { id: 'mota-01',       name: "Mota's Premium Salted Chips - 100g",      price: 50,  img: '/images/lays_classic_salted.png' },
    { id: 'tapioca-01',    name: "Sweet Karam Kerala Tapioca Chips - 65g",  price: 59,  img: '/images/lays_all_flavors.png' },
    { id: 'chheda-01',     name: "Chheda's Long Masala Banana Chips - 170g",price: 80,  img: '/images/lays_all_flavors.png' },
    { id: 'peppy-01',      name: "Peppy Tomato Discs Crisps - 60g",         price: 43,  img: '/images/lays_tomato_tango.svg' },
    { id: 'superyou-01',   name: "SuperYou Multigrain Masala Chips - 40g",  price: 40,  img: '/images/lays_all_flavors.png' },
    { id: 'troovy-01',     name: "Troovy High Protein Mix Veggie - 70g",    price: 65,  img: '/images/lays_all_flavors.png' },
    { id: 'troovy-02',     name: "Troovy High Protein Potato Chips - 40g",  price: 45,  img: '/images/lays_classic_salted.png' },
    { id: 'pretzels-01',   name: "4700BC Himalayan Salt Pretzels - 50g",    price: 45,  img: '/images/all_flavors_pringles.png' },
    { id: 'brb-01',        name: "BRB Classic Salted Rice Popped - 54g",    price: 38,  img: '/images/lays_classic_salted.png' },
    { id: 'popcorn-01',    name: "Butter Popcorn Bag",                      price: 45,  img: '/images/butter_popcorn.png' },
    { id: 'nachos-01',     name: "Nachos with Salsa",                       price: 55,  img: '/images/nachos_and_salsa.png' },
    { id: 'biscuit-01',    name: "Marie Gold Biscuits",                     price: 20,  img: '/images/marie_gold_biscuits.png' },
    { id: 'cheeseballs-01',name: "Peppy Cheese Balls - 55g",                price: 30,  img: '/images/cheese_balls.svg' },
    { id: 'bingo-01',      name: "Bingo! Mad Angles - 60g",                 price: 30,  img: '/images/bingo_mad_angles.svg' }
  ],
  "🍪 Cookies": [
    { id: 'chocochip-01',     name: 'Choc Chunk Cookies - 150g',         price: 60,  img: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'oreo-01',          name: 'Oreo Original Sandwich - 120g',     price: 40,  img: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'oreo-choc-01',     name: 'Oreo Double Stuff - 120g',          price: 50,  img: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'butter-cookie-01', name: 'Butter Cookies Tin - 400g',         price: 120, img: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'digestive-01',     name: 'McVitie\'s Digestive - 250g',       price: 55,  img: 'https://images.pexels.com/photos/890515/pexels-photo-890515.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'goodday-01',       name: 'Britannia Good Day Cashew - 200g',  price: 30,  img: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'goodday-butter',   name: 'Britannia Good Day Butter - 200g',  price: 30,  img: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'bourbon-01',       name: 'Britannia Bourbon - 150g',          price: 25,  img: 'https://images.pexels.com/photos/3185735/pexels-photo-3185735.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'hide-seek-01',     name: 'Parle Hide & Seek Choco - 100g',    price: 30,  img: 'https://images.pexels.com/photos/3185735/pexels-photo-3185735.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'hideseek-fab',     name: 'Hide & Seek Fab! - 112g',           price: 30,  img: 'https://images.pexels.com/photos/1359330/pexels-photo-1359330.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'parle-g-01',       name: 'Parle-G Original Glucose - 200g',   price: 15,  img: 'https://images.pexels.com/photos/890515/pexels-photo-890515.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'monaco-01',        name: 'Parle Monaco Salted - 200g',        price: 20,  img: 'https://images.pexels.com/photos/5808048/pexels-photo-5808048.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'krackjack-01',     name: 'Parle Krack Jack - 200g',           price: 20,  img: 'https://images.pexels.com/photos/5808048/pexels-photo-5808048.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'milkbikis-01',     name: 'Britannia Milk Bikis - 200g',       price: 25,  img: 'https://images.pexels.com/photos/890515/pexels-photo-890515.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'tiger-01',         name: 'Britannia Tiger Glucose - 150g',    price: 20,  img: 'https://images.pexels.com/photos/890515/pexels-photo-890515.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: '50-50-01',         name: 'Britannia 50-50 Sweet & Salty',     price: 25,  img: 'https://images.pexels.com/photos/5808048/pexels-photo-5808048.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'wafer-choc-01',    name: 'KitKat Wafer - 4 fingers',          price: 45,  img: 'https://images.pexels.com/photos/5778921/pexels-photo-5778921.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'wafer-van-01',     name: 'Vanilla Cream Wafers - 150g',       price: 35,  img: 'https://images.pexels.com/photos/5778921/pexels-photo-5778921.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cookies-mixed',    name: 'Assorted Cookie Box - 300g',        price: 150, img: 'https://images.pexels.com/photos/4686957/pexels-photo-4686957.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'shortbread-01',    name: 'Scottish Shortbread - 200g',        price: 90,  img: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'macaroon-01',      name: 'French Macarons - 6 pcs',           price: 180, img: 'https://images.pexels.com/photos/239581/pexels-photo-239581.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'brownie-01',       name: 'Chocolate Brownie - 2 pcs',         price: 80,  img: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'rusk-01',          name: 'Britannia Toastea Rusk - 300g',     price: 45,  img: 'https://images.pexels.com/photos/7474227/pexels-photo-7474227.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'rusk-elaichi',     name: 'Elaichi Rusk - 250g',               price: 40,  img: 'https://images.pexels.com/photos/7474227/pexels-photo-7474227.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'nutrichoice-01',   name: 'Britannia NutriChoice - 150g',      price: 60,  img: 'https://images.pexels.com/photos/890515/pexels-photo-890515.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cookie-oats',      name: 'Oats & Raisin Cookies - 200g',      price: 75,  img: 'https://images.pexels.com/photos/6133303/pexels-photo-6133303.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cookie-peanut',    name: 'Peanut Butter Cookies - 200g',      price: 80,  img: 'https://images.pexels.com/photos/6133303/pexels-photo-6133303.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cookie-almond',    name: 'Almond Cookies - 150g',             price: 95,  img: 'https://images.pexels.com/photos/1359330/pexels-photo-1359330.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cookie-coconut',   name: 'Coconut Cookies - 200g',            price: 55,  img: 'https://images.pexels.com/photos/1359330/pexels-photo-1359330.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cream-cracker',    name: 'Cream Crackers - 200g',             price: 35,  img: 'https://images.pexels.com/photos/5808048/pexels-photo-5808048.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "🥤 Beverages": [
    { id: 'cola-01',   name: 'Coca Cola - 300ml',         price: 40,  img: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'water-01',  name: 'Bisleri Water - 1L',        price: 20,  img: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'soda-01',   name: 'Faurito Soda - 500ml',      price: 30,  img: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'juice-01',  name: 'Orange Juice - 200ml',      price: 35,  img: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coffee-01', name: 'Sleepy Owl Coffee',         price: 299, img: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'lassi-01',  name: 'Sweet Lassi - 300ml',       price: 50,  img: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "💊 Medicines": [
    { id: 'paracetamol-01', name: 'Paracetamol 650mg',    price: 25,  img: 'https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'bandaid-01',     name: 'Band-Aid Flex 100pcs', price: 35,  img: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'cough-01',       name: 'Benadryl Cough Syrup', price: 85,  img: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'sanitizer-01',   name: 'Hand Sanitizer 100ml', price: 60,  img: 'https://images.pexels.com/photos/3873193/pexels-photo-3873193.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'vitaminc-01',    name: 'Vitamin C 500mg',      price: 50,  img: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "📄 Documents": [
    { id: 'print-01',    name: 'Document Printing - A4', price: 5,   img: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'envelope-01', name: 'Courier Envelope - A4',  price: 15,  img: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'stamp-01',    name: 'Postage Stamp',          price: 10,  img: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'folder-01',   name: 'Document Folder',        price: 30,  img: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ]
};

// GET /api/orders/items
exports.getItems = (_req, res) => {
  res.json(ITEMS_CATALOG);
};

// POST /api/orders/create
exports.createOrder = async (req, res) => {
  try {
    const {
      items, customerPhone, customerName,
      deliveryDetails, mapPin,
      voiceNoteUrl, landmarkImageUrl, textInstruction
    } = req.body;

    if (!mapPin || !mapPin.latitude || !mapPin.longitude) {
      return res.status(400).json({ error: 'mapPin with latitude/longitude is required' });
    }

    const totalAmount = (items || []).reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);

    const order = ordersDb.add({
      customerPhone,
      customerName,
      items:           items || [],
      deliveryDetails: deliveryDetails || {},
      mapPin,                   // { latitude, longitude }
      voiceNoteUrl:    voiceNoteUrl    || null,
      landmarkImageUrl:landmarkImageUrl|| null,
      textInstruction: textInstruction || '',
      status:          'pending',
      totalAmount,
      findMeToken:     null,
      findMeLink:      null,
      deliveryExecutiveId:    null,
      deliveryExecutivePhone: null,
      assignedAt:      null,
      completedAt:     null,
      rating:          null
    });

    res.json({ success: true, orderId: order.id, order });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// GET /api/orders/:orderId
exports.getOrder = (req, res) => {
  const order = ordersDb.findById(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

// GET /api/orders/token/:token  — used by delivery.html
exports.getOrderByToken = (req, res) => {
  const { token } = req.params;
  const order = ordersDb.findAll().find(o => o.findMeToken === token);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Return only what the delivery executive needs
  res.json({
    success:          true,
    orderId:          order.id,
    customerName:     order.customerName,
    deliveryDetails:  order.deliveryDetails,
    mapPin:           order.mapPin,
    voiceNoteUrl:     order.voiceNoteUrl,
    landmarkImageUrl: order.landmarkImageUrl,
    textInstruction:  order.textInstruction,
    status:           order.status,
    createdAt:        order.createdAt
  });
};

// POST /api/orders/assign-delivery
// Assigns a delivery executive, generates Find Me link, sends SMS
exports.assignDeliveryExecutive = async (req, res) => {
  try {
    let { orderId, deliveryExecutivePhone, deliveryExecutiveId } = req.body;

    if (process.env.DELIVERY_PHONE) {
      deliveryExecutivePhone = process.env.DELIVERY_PHONE;
    }

    const order = ordersDb.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Generate unique token for this delivery
    const findMeToken = uuidv4();

    // Use the runtime BASE_URL (auto-set to LAN IP in server.js)
    const baseUrl  = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    // ✅ Find Me link → delivery.html (correct page for delivery executive)
    const findMeLink = `${baseUrl}/delivery/${orderId}?token=${findMeToken}`;

    // Update order
    const updated = ordersDb.update(orderId, {
      deliveryExecutiveId,
      deliveryExecutivePhone,
      findMeToken,
      findMeLink,
      status:     'assigned',
      assignedAt: new Date()
    });

    // Send SMS to delivery executive
    const smsMessage =
      `DoorPilot Delivery 🛵\n` +
      `Customer: ${order.customerName || 'Customer'}\n` +
      `Open this link to navigate to their door:\n${findMeLink}`;

    try {
      await smsGateway.sendSMS(deliveryExecutivePhone, smsMessage);
    } catch (smsErr) {
      console.error('SMS failed (non-fatal):', smsErr.message);
    }

    // Emit via Socket.IO if available
    if (req.io) {
      req.io.to(`order-${orderId}`).emit('delivery-assigned', {
        orderId, findMeLink, deliveryExecutivePhone
      });
    }

    res.json({ success: true, orderId, findMeLink, order: updated });
  } catch (err) {
    console.error('assignDeliveryExecutive error:', err);
    res.status(500).json({ error: 'Failed to assign delivery executive' });
  }
};

// PUT /api/orders/:orderId/status
exports.updateOrderStatus = (req, res) => {
  const updated = ordersDb.update(req.params.orderId, { status: req.body.status });
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, order: updated });
};

// GET /api/orders/
exports.getAllOrders = (_req, res) => {
  res.json(ordersDb.findAll());
};

// POST /api/orders/rate
exports.submitRating = (req, res) => {
  try {
    const { orderId, rating, feedback } = req.body;
    const order = ordersDb.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const ratingRecord = ratingsDb.add({ orderId, rating, feedback, submittedAt: new Date() });
    ordersDb.update(orderId, { rating, status: 'completed', completedAt: new Date() });

    res.json({ success: true, ratingRecord });
  } catch (err) {
    console.error('submitRating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};
