const { ordersDb, ratingsDb } = require('../models/Database');
const smsGateway = require('../models/SMSGateway');
const { v4: uuidv4 } = require('uuid');

// ── Items catalog ────────────────────────────────────────────────────────────
const ITEMS_CATALOG = {
  "🥬 Groceries": [
    { id: 'tomato-01',    name: 'Fresh Tomatoes - 500g',   price: 30,  img: 'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400&auto=format&fit=crop' },
    { id: 'potato-01',   name: 'Potatoes - 1kg',           price: 40,  img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop' },
    { id: 'onion-01',    name: 'Onions - 1kg',             price: 35,  img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop' },
    { id: 'spinach-01',  name: 'Fresh Spinach - 250g',     price: 25,  img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop' },
    { id: 'carrot-01',   name: 'Carrots - 500g',           price: 30,  img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop' },
    { id: 'capsicum-01', name: 'Capsicum - 3 pcs',         price: 45,  img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop' },
    { id: 'milk-01',     name: 'Fresh Milk - 500ml',       price: 30,  img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
    { id: 'bread-01',    name: 'Whole Wheat Bread',        price: 45,  img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop' },
    { id: 'eggs-01',     name: 'Farm Eggs - 6 pcs',        price: 60,  img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop' },
    { id: 'garlic-01',   name: 'Garlic - 250g',            price: 30,  img: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop' },
    { id: 'ginger-01',   name: 'Fresh Ginger - 200g',      price: 25,  img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop' },
    { id: 'banana-01',   name: 'Bananas - 6 pcs',          price: 40,  img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop' },
    { id: 'apple-01',    name: 'Apples - 4 pcs',           price: 80,  img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop' },
    { id: 'rice-01',     name: 'Basmati Rice - 1kg',       price: 90,  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop' },
    { id: 'dal-01',      name: 'Yellow Dal - 500g',        price: 70,  img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop' },
    { id: 'sugar-01',    name: 'Sugar - 1kg',              price: 45,  img: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400&auto=format&fit=crop' },
    { id: 'oil-01',      name: 'Sunflower Oil - 1L',       price: 130, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop' },
    { id: 'curd-01',     name: 'Fresh Curd - 400g',        price: 40,  img: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop' },
    { id: 'cucumber-01', name: 'Cucumber - 2 pcs',         price: 20,  img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&auto=format&fit=crop' },
    { id: 'lemon-01',    name: 'Lemons - 4 pcs',           price: 20,  img: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&auto=format&fit=crop' }
  ],
  "🍔 Food": [
    { id: 'burger-01',   name: 'Classic Veg Burger',       price: 120, img: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pizza-01',    name: 'Margherita Pizza',         price: 199, img: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'biryani-01',  name: 'Veg Biryani - 1 plate',   price: 150, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop' },
    { id: 'sandwich-01', name: 'Grilled Sandwich',         price: 80,  img: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'dosa-01',     name: 'Masala Dosa',              price: 90,  img: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'idli-01',     name: 'Idli Sambar - 4 pcs',     price: 70,  img: 'https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'paneer-01',   name: 'Paneer Butter Masala',    price: 180, img: 'https://images.pexels.com/photos/9609847/pexels-photo-9609847.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pasta-01',    name: 'Penne Arrabbiata',        price: 160, img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'noodles-01',  name: 'Hakka Noodles',           price: 130, img: 'https://images.pexels.com/photos/3186654/pexels-photo-3186654.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'roll-01',     name: 'Paneer Kathi Roll',       price: 110, img: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pulao-01',    name: 'Veg Pulao - 1 plate',     price: 120, img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'soup-01',     name: 'Sweet Corn Soup',         price: 90,  img: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pav-01',      name: 'Pav Bhaji',               price: 100, img: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'upma-01',     name: 'Rava Upma',               price: 60,  img: 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'poha-01',     name: 'Poha with Onion',         price: 55,  img: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'chole-01',    name: 'Chole Bhature',           price: 140, img: 'https://images.pexels.com/photos/9609842/pexels-photo-9609842.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'thali-01',    name: 'Mini Veg Thali',          price: 200, img: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop' },
    { id: 'spring-01',   name: 'Spring Rolls - 3 pcs',   price: 95,  img: 'https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'falafel-01',  name: 'Falafel Wrap',            price: 130, img: 'https://images.pexels.com/photos/5175537/pexels-photo-5175537.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'waffles-01',  name: 'Waffles with Maple',      price: 150, img: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "🍿 Snacks & Cookies": [
    { id: 'chips-01',      name: "Lay's Classic Salted - 51g",              price: 20,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'chips-02',      name: "Lay's Cream & Onion - 26g",               price: 20,  img: '/images/lays_cream_onion_real.svg' },
    { id: 'chips-03',      name: "Lay's Sizzling Hot - 52.9g",              price: 20,  img: '/images/lays_sizzling_hot_real.svg' },
    { id: 'chips-04',      name: "Lay's Tomato Tango - 26g",                price: 20,  img: '/images/lays_tomato_tango_real.svg' },
    { id: 'pringles-01',   name: "Pringles Original - 40g",                 price: 51,  img: '/images/pringles_original.svg' },
    { id: 'pringles-02',   name: "Pringles Sour Cream & Onion - 40g",       price: 51,  img: '/images/pringles_sour_cream.svg' },
    { id: 'balaji-01',     name: "Balaji Crunchex Chilli Tadka - 140g",     price: 40,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'balaji-02',     name: "Balaji Rumbles Pudina Twist - 140g",      price: 40,  img: '/images/lays_cream_onion_real.svg' },
    { id: 'crax-01',       name: "Crax Biggies Chilli Cheese - 65g",        price: 24,  img: '/images/cheese_balls.svg' },
    { id: 'crax-02',       name: "Crax Crunchy Pipes Salted - 73g",         price: 33,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'crax-03',       name: "Crax Fritts Peri Peri Corn - 84g",        price: 30,  img: '/images/lays_sizzling_hot_real.svg' },
    { id: 'beyond-01',     name: "Beyond Snack Hot Sweet Chilli - 75g",     price: 57,  img: '/images/banana_chips_real.svg' },
    { id: 'mota-01',       name: "Mota's Premium Salted Chips - 100g",      price: 50,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'tapioca-01',    name: "Sweet Karam Kerala Tapioca Chips - 65g",  price: 59,  img: '/images/tapioca_chips_real.svg' },
    { id: 'chheda-01',     name: "Chheda's Long Masala Banana Chips - 170g",price: 80,  img: '/images/banana_chips_real.svg' },
    { id: 'peppy-01',      name: "Peppy Tomato Discs Crisps - 60g",         price: 43,  img: '/images/tapioca_chips_real.svg' },
    { id: 'superyou-01',   name: "SuperYou Multigrain Masala Chips - 40g",  price: 40,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'troovy-01',     name: "Troovy High Protein Mix Veggie - 70g",    price: 65,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'troovy-02',     name: "Troovy High Protein Potato Chips - 40g",  price: 45,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'pretzels-01',   name: "4700BC Himalayan Salt Pretzels - 50g",    price: 45,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'brb-01',        name: "BRB Classic Salted Rice Popped - 54g",    price: 38,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'popcorn-01',    name: "Butter Popcorn Bag",                      price: 45,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'nachos-01',     name: "Nachos with Salsa",                       price: 55,  img: '/images/lays_classic_salted_real.svg' },
    { id: 'biscuit-01',    name: "Marie Gold Biscuits",                     price: 20,  img: '/images/marie_gold_real.svg' },
    { id: 'cheeseballs-01',name: "Peppy Cheese Balls - 55g",                price: 30,  img: '/images/cheese_balls.svg' },
    { id: 'bingo-01',      name: "Bingo! Mad Angles - 60g",                 price: 30,  img: '/images/bingo_mad_angles.svg' },
    { id: 'chocochip-01',     name: 'Choc Chunk Cookies',         price: 60,  img: '/images/cookies_real.svg' },
    { id: 'oreo-01',          name: 'Oreo Sandwich Cookies',      price: 40,  img: '/images/oreo_real.svg' },
    { id: 'butter-cookie-01', name: 'Butter Cookies - 200g',      price: 120, img: '/images/cookies_real.svg' },
    { id: 'digestive-01',     name: 'Digestive Biscuits',         price: 55,  img: '/images/marie_gold_real.svg' },
    { id: 'goodday-01',       name: 'Good Day Cashew Cookies',    price: 30,  img: '/images/cookies_real.svg' },
    { id: 'oatmeal-01',       name: 'Oatmeal Raisin Cookies',     price: 75,  img: '/images/cookies_real.svg' },
    { id: 'peanutbutter-01',  name: 'Peanut Butter Cookies',      price: 80,  img: '/images/cookies_real.svg' },
    { id: 'sugar-cookie-01',  name: 'Frosted Sugar Cookies',      price: 90,  img: '/images/cookies_real.svg' },
    { id: 'almond-cookie-01', name: 'Almond Biscotti',            price: 110, img: '/images/cookies_real.svg' },
    { id: 'milano-01',        name: 'Milano Double Choc Cookies', price: 130, img: '/images/cookies_real.svg' },
    { id: 'lotus-01',         name: 'Lotus Biscoff Cookies',      price: 150, img: '/images/cookies_real.svg' }
  ],
  "🥤 Beverages": [
    { id: 'cola-01',       name: 'Coca Cola - 300ml',          price: 40,  img: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'water-01',      name: 'Bisleri Water - 1L',         price: 20,  img: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'soda-01',       name: 'Faurito Soda - 500ml',       price: 30,  img: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'juice-01',      name: 'Orange Juice - 200ml',       price: 35,  img: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coffee-01',     name: 'Sleepy Owl Coffee',          price: 299, img: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'lassi-01',      name: 'Sweet Lassi - 300ml',        price: 50,  img: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'tea-01',        name: 'Masala Chai - 250ml',        price: 25,  img: '/images/masala_chai.png' },
    { id: 'green-tea-01',  name: 'Green Tea - 10 bags',        price: 80,  img: '/images/green_tea.png' },
    { id: 'mango-01',      name: 'Mango Frooti - 200ml',       price: 20,  img: '/images/mango_frooti.png' },
    { id: 'sprite-01',     name: 'Sprite - 300ml',             price: 35,  img: '/images/sprite.png' },
    { id: 'buttermilk-01', name: 'Spiced Buttermilk - 200ml',  price: 20,  img: '/images/spiced_buttermilk.png' },
    { id: 'coconut-01',    name: 'Tender Coconut Water',       price: 60,  img: '/images/tender_coconut.png' },
    { id: 'redbull-01',    name: 'Red Bull Energy - 250ml',    price: 125, img: '/images/redbull.png' },
    { id: 'smoothie-01',   name: 'Mixed Berry Smoothie',       price: 120, img: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'lemonade-01',   name: 'Homemade Lemonade - 300ml',  price: 40,  img: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coldcoffee-01', name: 'Cold Coffee - 250ml',        price: 90,  img: '/images/cold_coffee.png' },
    { id: 'pepsi-01',      name: 'Pepsi - 300ml',              price: 35,  img: '/images/pepsi.png' },
    { id: 'apple-juice-01',name: 'Apple Juice - 200ml',        price: 40,  img: '/images/apple_juice.png' },
    { id: 'water-500-01',  name: 'Mineral Water - 500ml',      price: 15,  img: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "💊 Medicines": [
    { id: 'paracetamol-01',  name: 'Paracetamol 650mg',         price: 25,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'bandaid-01',      name: 'Band-Aid Flex 100pcs',      price: 35,  img: '/images/bandaid_flex.svg' },
    { id: 'cough-01',        name: 'Benadryl Cough Syrup',      price: 85,  img: '/images/cough_syrup.png' },
    { id: 'sanitizer-01',    name: 'Hand Sanitizer 100ml',      price: 60,  img: '/images/hand_sanitizer.png' },
    { id: 'vitaminc-01',     name: 'Vitamin C 500mg',           price: 50,  img: '/images/vitamin_c.svg' },
    { id: 'antacid-01',      name: 'Antacid Syrup 200ml',       price: 75,  img: '/images/antacid_syrup.svg' },
    { id: 'ibuprofen-01',    name: 'Ibuprofen 400mg - 10 tabs', price: 30,  img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&auto=format&fit=crop' },
    { id: 'thermometer-01',  name: 'Digital Thermometer',       price: 250, img: '/images/digital_thermometer.png' },
    { id: 'mask-01',         name: 'N95 Face Mask - 5 pcs',     price: 120, img: '/images/n95_mask.png' },
    { id: 'eyedrops-01',     name: 'Lubricant Eye Drops',       price: 90,  img: '/images/eye_drops.png' },
    { id: 'ors-01',          name: 'ORS Sachets - 5 pcs',       price: 40,  img: '/images/ors_sachet.png' },
    { id: 'antifungal-01',   name: 'Antifungal Cream 15g',      price: 65,  img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop' },
    { id: 'bp-tablet-01',    name: 'Aspirin 75mg - 14 tabs',    price: 45,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'nasal-01',        name: 'Nasal Drops 10ml',          price: 55,  img: '/images/nasal_drops.png' },
    { id: 'glucon-01',       name: 'Glucon-D Energy Drink',     price: 70,  img: '/images/glucon_d.svg' },
    { id: 'cotton-01',       name: 'Surgical Cotton - 50g',     price: 30,  img: '/images/surgical_cotton.svg' },
    { id: 'vicks-01',        name: 'Vicks VapoRub 25g',         price: 55,  img: '/images/vicks_vaporub.svg' },
    { id: 'multivit-01',     name: 'Multivitamin Tablets - 30', price: 180, img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop' },
    { id: 'zinc-01',         name: 'Zinc Supplement 25 tabs',   price: 90,  img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop' },
    { id: 'glucose-strip-01',name: 'Glucose Test Strips 25pcs', price: 220, img: '/images/glucose_strips.svg' }
  ],
  "🧴 Personal Care": [
    { id: 'dove-01',        name: 'Dove Beauty Bathing Bar - 100g', price: 65,  img: '/images/dove_soap_real.svg' },
    { id: 'nivea-01',       name: 'Nivea Soft Cream - 100ml',       price: 199, img: '/images/nivea_cream_real.svg' },
    { id: 'head-01',        name: 'Head & Shoulders Shampoo - 180ml',price: 175,img: '/images/head_shoulders_real.svg' },
    { id: 'colgate-01',     name: 'Colgate MaxFresh Toothpaste - 150g',price: 95,img: '/images/colgate_real.svg' },
    { id: 'dettol-hw-01',   name: 'Dettol Handwash Liquid - 200ml', price: 99,  img: '/images/dettol_handwash_real.svg' },
    { id: 'gillette-01',    name: 'Gillette Mach3 Razor',           price: 249, img: '/images/gillette_real.svg' },
    { id: 'vaseline-01',    name: 'Vaseline Jelly Balm - 50g',      price: 75,  img: '/images/vaseline_real.svg' },
    { id: 'himalaya-fw-01', name: 'Himalaya Neem Face Wash - 100ml',price: 140, img: '/images/himalaya_facewash_real.svg' },
    { id: 'nivea-deo-01',   name: 'Nivea Men Deo Spray - 150ml',    price: 210, img: '/images/nivea_cream_real.svg' },
    { id: 'toothbrush-01',  name: 'Oral-B Soft Toothbrush - 3 pcs',   price: 85,  img: '/images/oral_b_real.svg' },
    { id: 'pepsodent-01',   name: 'Pepsodent Germicheck Toothpaste', price: 75,  img: '/images/colgate_real.svg' },
    { id: 'loreal-01',      name: "L'Oreal Paris Total Repair 180ml", price: 215, img: '/images/head_shoulders_real.svg' },
    { id: 'biotique-01',    name: 'Biotique Honey Gel Face Wash 120ml',price: 160,img: '/images/himalaya_facewash_real.svg' },
    { id: 'dettol-soap-01', name: 'Dettol Original Soap Bar 100g x 3',price: 135, img: '/images/dove_soap_real.svg' },
    { id: 'sensodyne-01',   name: 'Sensodyne Rapid Relief 80g',      price: 195, img: '/images/colgate_real.svg' },
    { id: 'wildstone-01',   name: 'Wild Stone Edge Body Spray 150ml', price: 220, img: '/images/nivea_cream_real.svg' },
    { id: 'pantene-01',     name: 'Pantene Hair Fall Conditioner',   price: 180, img: '/images/head_shoulders_real.svg' },
    { id: 'parachute-01',   name: 'Parachute Pure Coconut Oil 200ml',price: 110, img: '/images/head_shoulders_real.svg' },
    { id: 'body-lotion-01', name: 'Nivea Body Milk Lotion 200ml',    price: 245, img: '/images/nivea_cream_real.svg' },
    { id: 'lip-balm-01',    name: 'Himalaya Herbals Lip Balm 10g',   price: 45,  img: '/images/vaseline_real.svg' }
  ],
  "🧹 Cleaning Essentials": [
    { id: 'surf-01',        name: 'Surf Excel Wash Powder - 1kg',     price: 140, img: '/images/surf_excel_real.svg' },
    { id: 'vim-01',         name: 'Vim Dishwash Gel Lemon - 500ml',   price: 115, img: '/images/vim_gel_real.svg' },
    { id: 'lizol-01',       name: 'Lizol Floor Cleaner Citrus - 500ml',price: 110,img: '/images/lizol_real.svg' },
    { id: 'harpic-01',      name: 'Harpic Toilet Cleaner - 500ml',    price: 105, img: '/images/harpic_real.svg' },
    { id: 'colin-01',       name: 'Colin Glass Cleaner Spray - 500ml',price: 100, img: '/images/colin_real.svg' },
    { id: 'goodknight-01',  name: 'Good Knight Gold Liquid Refill',  price: 85,  img: '/images/goodknight_real.svg' },
    { id: 'rin-01',         name: 'Rin Detergent Bar - 250g x 4',     price: 60,  img: '/images/rin_bar_real.svg' },
    { id: 'comfort-01',     name: 'Comfort Fabric Liquid - 860ml',    price: 235, img: '/images/comfort_real.svg' },
    { id: 'scrub-01',       name: 'Scotch-Brite Scrub Pad - 3 pcs',   price: 45,  img: '/images/scrub_real.svg' },
    { id: 'garbage-01',     name: 'Garbage Bags Medium - 30 pcs',     price: 120, img: '/images/garbage_real.svg' },
    { id: 'ariel-01',       name: 'Ariel Matic Powder - 1kg',         price: 220, img: '/images/ariel_real.svg' },
    { id: 'pril-01',        name: 'Pril Kraft Liquid - 425ml',        price: 110, img: '/images/pril_real.svg' },
    { id: 'domex-01',       name: 'Domex Guard Toilet Cleaner 500ml', price: 99,  img: '/images/domex_real.svg' },
    { id: 'hit-01',         name: 'Godrej HIT Insect Spray - 400ml',  price: 195, img: '/images/hit_real.svg' },
    { id: 'dettol-dis-01',  name: 'Dettol Surface Cleaner Spray',     price: 185, img: '/images/dettol_spray_real.svg' },
    { id: 'mop-01',         name: 'Gala Super Spin Cotton Mop',       price: 799, img: '/images/mop_real.svg' },
    { id: 'broom-01',       name: 'Gala No Dust Floor Broom',         price: 160, img: '/images/broom_real.svg' },
    { id: 'wiper-01',       name: 'Gala Kitchen Sink Squeegee Wiper', price: 95,  img: '/images/wiper_real.svg' },
    { id: 'tissue-01',      name: 'Origami Kitchen Towel Rolls (2)',  price: 130, img: '/images/wipes_real.svg' },
    { id: 'odonil-01',      name: 'Odonil Air Freshener Blocks (4)',  price: 145, img: '/images/goodknight_real.svg' },
    { id: 'naphthalene-01', name: 'Bengal Naphthalene Balls - 200g',   price: 50,  img: '/images/goodknight_real.svg' },
    { id: 'vanish-01',      name: 'Vanish Stain Remover - 400g',      price: 215, img: '/images/surf_excel_real.svg' },
    { id: 'colin-refill-01',name: 'Colin Cleaner Refill - 500ml',    price: 75,  img: '/images/colin_real.svg' },
    { id: 'gloves-01',      name: 'Rubber Cleaning Gloves - 1 Pair',  price: 120, img: '/images/scrub_real.svg' },
    { id: 'steel-scrub-01', name: 'Scotch-Brite Steel Scrubber (2)', price: 55,  img: '/images/scrub_real.svg' }
  ],
  "👶 Baby Care": [
    { id: 'pampers-01',   name: 'Pampers Diapers Medium - 20 pcs', price: 399, img: '/images/pampers_real.svg' },
    { id: 'huggies-01',   name: 'Huggies Wonder Pants - 22 pcs',    price: 349, img: '/images/huggies_real.svg' },
    { id: 'wipes-01',     name: "Johnson's Baby Wipes - 72 pcs",   price: 185, img: '/images/wipes_real.svg' },
    { id: 'lotion-01',    name: 'Himalaya Baby Lotion - 200ml',     price: 165, img: '/images/lotion_real.svg' },
    { id: 'cerelac-01',   name: 'Nestle Cerelac Wheat Apple - 300g',price: 265, img: '/images/cerelac_real.svg' },
    { id: 'powder-01',    name: "Johnson's Baby Powder - 200g",     price: 195, img: '/images/baby_powder.svg' },
    { id: 'oil-01',       name: 'Dabur Lal Tail Massage Oil - 100ml',price: 125,img: '/images/baby_oil.svg' },
    { id: 'shampoo-b-01', name: 'Himalaya Baby Shampoo - 200ml',  price: 160, img: '/images/lotion_real.svg' },
    { id: 'bottle-01',    name: 'Philips Avent Feeding Bottle 260ml',price: 450,img: '/images/bottle_real.svg' },
    { id: 'soap-b-01',    name: "Johnson's Baby Soap - 75g x 3",    price: 140, img: '/images/baby_powder.svg' },
    { id: 'rash-cream-01',name: 'Himalaya Diaper Rash Cream 50g',   price: 110, img: '/images/lotion_real.svg' },
    { id: 'teether-01',   name: 'Silicone Baby Teether Ring Toy',    price: 175, img: '/images/baby_teether.svg' },
    { id: 'pacifier-01',  name: 'Silicone Baby Pacifier Soother',   price: 199, img: '/images/baby_pacifier.svg' },
    { id: 'sipper-01',    name: 'Pigeon Non-Spill Baby Sipper Cup',  price: 245, img: '/images/baby_sipper.svg' },
    { id: 'baby-food-01', name: 'Organic Apple Puree Jar - 120g',   price: 135, img: '/images/cerelac_real.svg' },
    { id: 'baby-towel-01',name: 'Cotton Hooded Baby Towel',         price: 320, img: '/images/wipes_real.svg' },
    { id: 'baby-wash-01', name: 'Chicco Gentle Body Wash 200ml',    price: 285, img: '/images/lotion_real.svg' },
    { id: 'diaper-bag-01',name: 'Multi-Pocket Baby Diaper Backpack', price: 899, img: '/images/diaper_bag.svg' },
    { id: 'baby-nappy-01',name: 'Cotton Washable Cloth Nappies 5pcs',price:220, img: '/images/pampers_real.svg' },
    { id: 'baby-comb-01', name: 'Mee Mee Soft Hair Brush & Comb Set',price: 155, img: '/images/baby_teether.svg' }
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
