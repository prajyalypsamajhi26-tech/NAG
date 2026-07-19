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
  "🍿 Snacks": [
    { id: 'chips-01',      name: "Lay's Classic Salted - 51g",              price: 20,  img: '/images/lays_classic_salted.png' },
    { id: 'chips-02',      name: "Lay's Cream & Onion - 26g",               price: 20,  img: '/images/lays_cream_onion.svg' },
    { id: 'chips-03',      name: "Lay's Sizzling Hot - 52.9g",              price: 20,  img: '/images/lays_sizzling_hot.png' },
    { id: 'chips-04',      name: "Lay's Tomato Tango - 26g",                price: 20,  img: '/images/lays_tomato_tango.svg' },
    { id: 'pringles-01',   name: "Pringles Original - 40g",                 price: 51,  img: '/images/pringles_original.svg' },
    { id: 'pringles-02',   name: "Pringles Sour Cream & Onion - 40g",       price: 51,  img: '/images/pringles_sour_cream.svg' },
    { id: 'balaji-01',     name: "Balaji Crunchex Chilli Tadka - 140g",     price: 40,  img: '/images/lays_all_flavors.png' },
    { id: 'balaji-02',     name: "Balaji Rumbles Pudina Twist - 140g",      price: 40,  img: '/images/lays_all_flavors.png' },
    { id: 'crax-01',       name: "Crax Biggies Chilli Cheese - 65g",        price: 24,  img: '/images/all_flavors_pringles.png' },
    { id: 'crax-02',       name: "Crax Crunchy Pipes Salted - 73g",         price: 33,  img: '/images/all_flavors_pringles.png' },
    { id: 'crax-03',       name: "Crax Fritts Peri Peri Corn - 84g",        price: 30,  img: '/images/all_flavors_pringles.png' },
    { id: 'beyond-01',     name: "Beyond Snack Hot Sweet Chilli - 75g",     price: 57,  img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=400&auto=format&fit=crop' },
    { id: 'mota-01',       name: "Mota's Premium Salted Chips - 100g",      price: 50,  img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop' },
    { id: 'tapioca-01',    name: "Sweet Karam Kerala Tapioca Chips - 65g", price: 59,  img: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&auto=format&fit=crop' },
    { id: 'chheda-01',     name: "Chheda's Long Masala Banana Chips - 170g",price: 80,  img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=400&auto=format&fit=crop' },
    { id: 'peppy-01',      name: "Peppy Tomato Discs Crisps - 60g",         price: 43,  img: '/images/cheese_balls.svg' },
    { id: 'superyou-01',   name: "SuperYou Multigrain Masala Chips - 40g",  price: 40,  img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop' },
    { id: 'troovy-01',     name: "Troovy High Protein Mix Veggie - 70g",    price: 65,  img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop' },
    { id: 'troovy-02',     name: "Troovy High Protein Potato Chips - 40g",  price: 45,  img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop' },
    { id: 'pretzels-01',   name: "4700BC Himalayan Salt Pretzels - 50g",    price: 45,  img: 'https://images.pexels.com/photos/4518644/pexels-photo-4518644.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'brb-01',        name: "BRB Classic Salted Rice Popped - 54g",    price: 38,  img: 'https://images.pexels.com/photos/6804079/pexels-photo-6804079.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'popcorn-01',    name: "Butter Popcorn Bag",                      price: 45,  img: '/images/butter_popcorn.png' },
    { id: 'nachos-01',     name: "Nachos with Salsa",                       price: 55,  img: '/images/nachos_and_salsa.png' },
    { id: 'biscuit-01',    name: "Marie Gold Biscuits",                     price: 20,  img: '/images/marie_gold_biscuits.png' },
    { id: 'cheeseballs-01',name: "Peppy Cheese Balls - 55g",                price: 30,  img: '/images/cheese_balls.svg' },
    { id: 'bingo-01',      name: "Bingo! Mad Angles - 60g",                 price: 30,  img: '/images/bingo_mad_angles.svg' }
  ],
  "🍪 Cookies": [
    { id: 'chocochip-01',     name: 'Choc Chunk Cookies',         price: 60,  img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop' },
    { id: 'oreo-01',          name: 'Oreo Sandwich',              price: 40,  img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop' },
    { id: 'butter-cookie-01', name: 'Butter Cookies - 200g',      price: 120, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'digestive-01',     name: 'Digestive Biscuit',          price: 55,  img: '/images/marie_gold_biscuits.png' },
    { id: 'goodday-01',       name: 'Good Day Cashew',            price: 30,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'oatmeal-01',       name: 'Oatmeal Raisin Cookies',     price: 75,  img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop' },
    { id: 'peanutbutter-01',  name: 'Peanut Butter Cookies',      price: 80,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'sugar-cookie-01',  name: 'Frosted Sugar Cookies',      price: 90,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'almond-cookie-01', name: 'Almond Biscotti',            price: 110, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'milano-01',        name: 'Milano Double Choc',         price: 130, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop' },
    { id: 'shortbread-01',    name: 'Scottish Shortbread - 150g', price: 95,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'coconut-cookie-01',name: 'Coconut Crunch Cookies',     price: 65,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'gingersnap-01',    name: 'Ginger Snap Cookies',        price: 70,  img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop' },
    { id: 'hazelnut-01',      name: 'Hazelnut Cream Cookies',     price: 140, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop' },
    { id: 'cornflake-01',     name: 'Cornflake Crunch Cookies',   price: 60,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'cinnamon-01',      name: 'Cinnamon Snickerdoodles',    price: 85,  img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop' },
    { id: 'lemon-cookie-01',  name: 'Lemon Zest Cookies',         price: 75,  img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'walnut-01',        name: 'Walnut Brownie Cookies',     price: 120, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop' },
    { id: 'milano-white-01',  name: 'White Choc Macadamia',       price: 130, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' },
    { id: 'lotus-01',         name: 'Lotus Biscoff Cookies',      price: 150, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop' }
  ],
  "🥤 Beverages": [
    { id: 'cola-01',       name: 'Coca Cola - 300ml',          price: 40,  img: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'water-01',      name: 'Bisleri Water - 1L',         price: 20,  img: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'soda-01',       name: 'Faurito Soda - 500ml',       price: 30,  img: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'juice-01',      name: 'Orange Juice - 200ml',       price: 35,  img: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coffee-01',     name: 'Sleepy Owl Coffee',          price: 299, img: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'lassi-01',      name: 'Sweet Lassi - 300ml',        price: 50,  img: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'tea-01',        name: 'Masala Chai - 250ml',        price: 25,  img: 'https://images.pexels.com/photos/1556688/pexels-photo-1556688.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'green-tea-01',  name: 'Green Tea - 10 bags',        price: 80,  img: 'https://images.pexels.com/photos/1123258/pexels-photo-1123258.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'mango-01',      name: 'Mango Frooti - 200ml',       price: 20,  img: 'https://images.pexels.com/photos/2894196/pexels-photo-2894196.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'sprite-01',     name: 'Sprite - 300ml',             price: 35,  img: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'buttermilk-01', name: 'Spiced Buttermilk - 200ml',  price: 20,  img: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coconut-01',    name: 'Tender Coconut Water',       price: 60,  img: 'https://images.pexels.com/photos/1650031/pexels-photo-1650031.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'redbull-01',    name: 'Red Bull Energy - 250ml',    price: 125, img: 'https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'smoothie-01',   name: 'Mixed Berry Smoothie',       price: 120, img: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'lemonade-01',   name: 'Homemade Lemonade - 300ml',  price: 40,  img: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'coldcoffee-01', name: 'Cold Coffee - 250ml',        price: 90,  img: 'https://images.pexels.com/photos/1199390/pexels-photo-1199390.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'pepsi-01',      name: 'Pepsi - 300ml',              price: 35,  img: 'https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'apple-juice-01',name: 'Apple Juice - 200ml',        price: 40,  img: 'https://images.pexels.com/photos/1236701/pexels-photo-1236701.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 'water-500-01',  name: 'Mineral Water - 500ml',      price: 15,  img: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ],
  "💊 Medicines": [
    { id: 'bandaid-01',      name: 'Band-Aid Flex 100pcs',      price: 35,  img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop' },
    { id: 'cough-01',        name: 'Benadryl Cough Syrup',      price: 85,  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop' },
    { id: 'sanitizer-01',    name: 'Hand Sanitizer 100ml',      price: 60,  img: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&auto=format&fit=crop' },
    { id: 'vitaminc-01',     name: 'Vitamin C 500mg',           price: 50,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'antacid-01',      name: 'Antacid Syrup 200ml',       price: 75,  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop' },
    { id: 'ibuprofen-01',    name: 'Ibuprofen 400mg - 10 tabs', price: 30,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'thermometer-01',  name: 'Digital Thermometer',       price: 250, img: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&auto=format&fit=crop' },
    { id: 'mask-01',         name: 'N95 Face Mask - 5 pcs',     price: 120, img: 'https://images.unsplash.com/photo-1586942593568-29364ef8858b?w=400&auto=format&fit=crop' },
    { id: 'eyedrops-01',     name: 'Lubricant Eye Drops',       price: 90,  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop' },
    { id: 'ors-01',          name: 'ORS Sachets - 5 pcs',       price: 40,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'antifungal-01',   name: 'Antifungal Cream 15g',      price: 65,  img: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&auto=format&fit=crop' },
    { id: 'bp-tablet-01',    name: 'Aspirin 75mg - 14 tabs',    price: 45,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'nasal-01',        name: 'Nasal Drops 10ml',          price: 55,  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop' },
    { id: 'glucon-01',       name: 'Glucon-D Energy Drink',     price: 70,  img: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&auto=format&fit=crop' },
    { id: 'cotton-01',       name: 'Surgical Cotton - 50g',     price: 30,  img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop' },
    { id: 'vicks-01',        name: 'Vicks VapoRub 25g',         price: 55,  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop' },
    { id: 'multivit-01',     name: 'Multivitamin Tablets - 30', price: 180, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'zinc-01',         name: 'Zinc Supplement 25 tabs',   price: 90,  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
    { id: 'glucose-strip-01',name: 'Glucose Test Strips 25pcs', price: 220, img: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&auto=format&fit=crop' }
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
