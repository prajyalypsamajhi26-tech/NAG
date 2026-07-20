// ==================== MAIN APPLICATION ====================
class DoorPilotApp {
  constructor() {
    this.currentPage = 'landing';
    this.cart = [];
    this.orderData = {
      items: [],
      customerPhone: '',
      customerName: '',
      deliveryDetails: {},
      mapPin: {},
      voiceNoteUrl: '',
      landmarkImageUrl: '',
      textInstruction: ''
    };
    this.currentOrderId = null;
    this.voiceBlob = null;
    this.landmarkBlob = null;
    this.socket = null;
    this.recordingInterval = null;
    this.deliveryMarkers = {};

    this.initializeApp();
  }

  async initializeApp() {
    // Wait for DB to initialize
    await db.init();

    // Initialize Socket.IO for real-time updates
    this.initializeSocket();

    // Handle page load
    this.handlePageLoad();

    // Restore cart from storage
    await this.restoreCart();

    // Show landing page after animation
    setTimeout(() => {
      this.showPage('landing');
      setTimeout(() => {
        this.showPage('order');
        // Reveal the header once we leave the intro screen
        const header = document.getElementById('app-header');
        if (header) {
          header.style.visibility = 'visible';
          header.style.opacity = '1';
        }
        // Init cart dropdown
        this.initCartDropdown();
      }, 2500);
    }, 500);
  }

  initializeSocket() {
    try {
      this.socket = io();

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      // Listen for delivery location updates
      this.socket.on('delivery-location-update', (data) => {
        this.updateDeliveryLocation(data);
      });

      // Listen for delivery nearby notification
      this.socket.on('delivery-near', (data) => {
        this.showNotification('Delivery partner is nearby!');
      });

      // Listen for wrong door notification
      this.socket.on('delivery-wrong-door', (data) => {
        this.showNotification('Delivery partner is at the wrong location');
      });
    } catch (err) {
      console.error('Socket.IO connection failed:', err);
    }
  }

  // ==================== PAGE MANAGEMENT ====================
  showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.add('hidden');
    });

    // Remove loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }

    // Show selected page
    const pageId = `${pageName}-page`;
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.remove('hidden');
      this.currentPage = pageName;

      // Toggle body class for header visibility control
      document.body.className = document.body.className
        .replace(/\bpage-\S+/g, '').trim();
      document.body.classList.add(`page-${pageName}`);

      // Execute page-specific logic
      this.executePageLogic(pageName);
    }
  }

  async executePageLogic(pageName) {
    switch (pageName) {
      case 'order':
        await this.loadItems();
        break;
      case 'map':
        // Destroy old map instance if any, then re-init after container is visible
        mapManager.destroy();
        setTimeout(() => {
          mapManager.initMap('map', (lat, lng) => {
            this.orderData.mapPin = { latitude: lat, longitude: lng };
          });
        }, 150);
        break;
      case 'voice':
        this.setupVoiceRecording();
        break;
      case 'review':
        this.populateReview();
        break;
      case 'tracking':
        this.startTracking();
        break;
      case 'findme':
        setTimeout(() => {
          this.initializeFindMe();
        }, 100);
        break;
    }
  }

  // ==================== ORDER SELECTION ====================
  async loadItems() {
    try {
      const items = await api.getItems();
      this.fullCatalog = items;
    } catch (err) {
      console.warn('API items load failed, using local sample catalog:', err);
      this.fullCatalog = {
        "🥬 Groceries": [
          { id: 'tomato-01',    name: 'Fresh Tomatoes - 500g',  price: 30,  img: 'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400&auto=format&fit=crop' },
          { id: 'potato-01',   name: 'Potatoes - 1kg',          price: 40,  img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop' },
          { id: 'onion-01',    name: 'Onions - 1kg',            price: 35,  img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop' },
          { id: 'spinach-01',  name: 'Fresh Spinach - 250g',    price: 25,  img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop' },
          { id: 'carrot-01',   name: 'Carrots - 500g',          price: 30,  img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop' },
          { id: 'capsicum-01', name: 'Capsicum - 3 pcs',        price: 45,  img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&auto=format&fit=crop' },
          { id: 'milk-01',     name: 'Fresh Milk - 500ml',      price: 30,  img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
          { id: 'bread-01',    name: 'Whole Wheat Bread',       price: 45,  img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop' },
          { id: 'eggs-01',     name: 'Farm Eggs - 6 pcs',       price: 60,  img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop' },
          { id: 'garlic-01',   name: 'Garlic - 250g',           price: 30,  img: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&auto=format&fit=crop' },
          { id: 'ginger-01',   name: 'Fresh Ginger - 200g',     price: 25,  img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop' },
          { id: 'banana-01',   name: 'Bananas - 6 pcs',         price: 40,  img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop' },
          { id: 'apple-01',    name: 'Apples - 4 pcs',          price: 80,  img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop' },
          { id: 'rice-01',     name: 'Basmati Rice - 1kg',      price: 90,  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop' },
          { id: 'dal-01',      name: 'Yellow Dal - 500g',       price: 70,  img: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400&auto=format&fit=crop' },
          { id: 'sugar-01',    name: 'Sugar - 1kg',             price: 45,  img: 'https://images.unsplash.com/photo-1590005024862-6b67679a29fb?w=400&auto=format&fit=crop' },
          { id: 'oil-01',      name: 'Sunflower Oil - 1L',      price: 130, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop' },
          { id: 'curd-01',     name: 'Fresh Curd - 400g',       price: 40,  img: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop' },
          { id: 'cucumber-01', name: 'Cucumber - 2 pcs',        price: 20,  img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&auto=format&fit=crop' },
          { id: 'lemon-01',    name: 'Lemons - 4 pcs',          price: 20,  img: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&auto=format&fit=crop' }
        ],
        "🍔 Food": [
          { id: 'burger-01',   name: 'Classic Veg Burger',      price: 120, img: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'pizza-01',    name: 'Margherita Pizza',        price: 199, img: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'biryani-01',  name: 'Veg Biryani - 1 plate',  price: 150, img: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'sandwich-01', name: 'Grilled Sandwich',        price: 80,  img: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'dosa-01',     name: 'Masala Dosa',             price: 90,  img: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'idli-01',     name: 'Idli Sambar - 4 pcs',    price: 70,  img: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'paneer-01',   name: 'Paneer Butter Masala',   price: 180, img: 'https://images.pexels.com/photos/9609847/pexels-photo-9609847.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'pasta-01',    name: 'Penne Arrabbiata',       price: 160, img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'noodles-01',  name: 'Hakka Noodles',          price: 130, img: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'roll-01',     name: 'Paneer Kathi Roll',      price: 110, img: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'pulao-01',    name: 'Veg Pulao - 1 plate',    price: 120, img: 'https://images.pexels.com/photos/7426873/pexels-photo-7426873.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'soup-01',     name: 'Sweet Corn Soup',        price: 90,  img: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'pav-01',      name: 'Pav Bhaji',              price: 100, img: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'upma-01',     name: 'Rava Upma',              price: 60,  img: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'poha-01',     name: 'Poha with Onion',        price: 55,  img: 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'chole-01',    name: 'Chole Bhature',          price: 140, img: 'https://images.pexels.com/photos/9609842/pexels-photo-9609842.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'thali-01',    name: 'Mini Veg Thali',         price: 200, img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'spring-01',   name: 'Spring Rolls - 3 pcs',  price: 95,  img: 'https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'falafel-01',  name: 'Falafel Wrap',           price: 130, img: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'waffles-01',  name: 'Waffles with Maple',     price: 150, img: 'https://images.pexels.com/photos/139746/pexels-photo-139746.jpeg?auto=compress&cs=tinysrgb&w=400' }
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
          { id: 'cola-01',       name: 'Coca Cola - 300ml',         price: 40,  img: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'water-01',      name: 'Bisleri Water - 1L',        price: 20,  img: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'soda-01',       name: 'Faurito Soda - 500ml',      price: 30,  img: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'juice-01',      name: 'Orange Juice - 200ml',      price: 35,  img: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'coffee-01',     name: 'Sleepy Owl Coffee',         price: 299, img: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'lassi-01',      name: 'Sweet Lassi - 300ml',       price: 50,  img: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'tea-01',        name: 'Masala Chai - 250ml',       price: 25,  img: '/images/masala_chai.png' },
          { id: 'green-tea-01',  name: 'Green Tea - 10 bags',       price: 80,  img: '/images/green_tea.png' },
          { id: 'mango-01',      name: 'Mango Frooti - 200ml',      price: 20,  img: '/images/mango_frooti.png' },
          { id: 'sprite-01',     name: 'Sprite - 300ml',            price: 35,  img: '/images/sprite.png' },
          { id: 'buttermilk-01', name: 'Spiced Buttermilk - 200ml', price: 20,  img: '/images/spiced_buttermilk.png' },
          { id: 'coconut-01',    name: 'Tender Coconut Water',      price: 60,  img: '/images/tender_coconut.png' },
          { id: 'redbull-01',    name: 'Red Bull Energy - 250ml',   price: 125, img: '/images/redbull.png' },
          { id: 'smoothie-01',   name: 'Mixed Berry Smoothie',      price: 120, img: 'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'lemonade-01',   name: 'Homemade Lemonade - 300ml', price: 40,  img: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'coldcoffee-01', name: 'Cold Coffee - 250ml',       price: 90,  img: '/images/cold_coffee.png' },
          { id: 'pepsi-01',      name: 'Pepsi - 300ml',             price: 35,  img: '/images/pepsi.png' },
          { id: 'apple-juice-01',name: 'Apple Juice - 200ml',       price: 40,  img: '/images/apple_juice.png' },
          { id: 'horlicks-01',   name: 'Horlicks - 200ml',         price: 35,  img: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'water-500-01',  name: 'Mineral Water - 500ml',     price: 15,  img: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400' }
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
    }

    this.selectedCategory = 'all';
    this.setupCategoryFilter();
    this.renderCatalog();
  }

  setupCategoryFilter() {
    document.querySelectorAll('.zp-cat-tile, .category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.zp-cat-tile, .category-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCategory = btn.dataset.category;
        this.renderCatalog();
      });
    });
  }

  renderCatalog() {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = '';

    const catalog = this.fullCatalog;
    const selected = this.selectedCategory;

    const categoriesToShow = selected === 'all'
      ? Object.keys(catalog)
      : Object.keys(catalog).filter(k => k === selected);

    if (categoriesToShow.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">No items found</p>';
      return;
    }

    categoriesToShow.forEach(category => {
      const section = document.createElement('div');
      section.className = 'catalog-section';

      // Map each category key to its SVG icon
      const catIcons = {
        'all': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
        '🥬 Groceries': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c-4 0-8-5-7-10 1-4 5-6 8-5 3 1 5 5 3 9-1 3-3 6-4 6z"/><path d="M12 8c0-4 3-6 3-6"/><path d="M12 7c-2-4-5-5-5-5"/><path d="M13 9c3-3 6-3 6-3"/></svg>`,
        '🍔 Food': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18M3 15h18"/><path d="M5 19h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"/><path d="M3 11a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6"/></svg>`,
        '🍿 Snacks & Cookies': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-2 12H8L6 8z"/><path d="M5 8c0-1.5 1.5-4 3-4s2 1.5 3 1.5S13 4 14 4s3 2.5 3 4"/><line x1="12" y1="8" x2="12" y2="20"/></svg>`,
        '🥤 Beverages': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14l-2 16H7L5 3z"/><path d="M5 8h14"/></svg>`,
        '💊 Medicines': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="7" y1="7" x2="17" y2="17"/></svg>`,
        '🧴 Personal Care': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"/><path d="M5 11h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9z"/><line x1="12" y1="2" x2="12" y2="4"/></svg>`,
        '🧹 Cleaning Essentials': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2l4 4-4 4"/><path d="M12 6h8"/><path d="M4 14l6-6"/><path d="M3 21l8-8"/><path d="M14 17l4 4"/></svg>`,
        '👶 Baby Care': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
      };

      const icon = catIcons[category] || catIcons['all'];
      // Strip emoji prefix from display name (e.g. "🥬 Groceries" → "Groceries")
      const displayName = category.replace(/^\p{Emoji}\s*/u, '');

      section.innerHTML = `<h2 class="cat-title"><span class="cat-title-icon">${icon}</span>${displayName}</h2>`;

      const row = document.createElement('div');
      row.className = 'product-grid';

      let cardIndex = 0;
      catalog[category].forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.setProperty('--card-index', cardIndex % 12); // cap at 12 for perf
        cardIndex++;
        card.innerHTML = `
          <div class="product-img">
            <img src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/200x140/f5f5f5/FFB800?text=${encodeURIComponent(item.name)}'">
          </div>
          <div class="product-info">
            <div class="product-name">${item.name}</div>
            <div class="product-meta">20-30 mins</div>
            <div class="product-footer">
              <span class="product-price">₹${item.price}</span>
              <div class="qty-control hidden" id="qty-ctrl-${item.id}">
                <button class="qty-btn qty-minus" aria-label="Remove one ${item.name}">−</button>
                <span class="qty-num" id="qty-num-${item.id}">0</span>
                <button class="qty-btn qty-plus" aria-label="Add one ${item.name}">+</button>
              </div>
              <button class="product-add-btn" id="add-btn-${item.id}" aria-label="Add ${item.name} to cart">ADD</button>
            </div>
          </div>
        `;

        // ADD button — show qty controls
        card.querySelector('.product-add-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          const btn = e.currentTarget;
          btn.classList.add('popping');
          setTimeout(() => btn.classList.remove('popping'), 300);
          this.addToCart(item);
          document.getElementById(`add-btn-${item.id}`).classList.add('hidden');
          document.getElementById(`qty-ctrl-${item.id}`).classList.remove('hidden');
          document.getElementById(`qty-num-${item.id}`).textContent = this.getItemQty(item.id);
        });

        // + button
        card.querySelector('.qty-plus').addEventListener('click', (e) => {
          e.stopPropagation();
          this.addToCart(item);
          document.getElementById(`qty-num-${item.id}`).textContent = this.getItemQty(item.id);
        });

        // - button
        card.querySelector('.qty-minus').addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeFromCart(item.id);
          const qty = this.getItemQty(item.id);
          document.getElementById(`qty-num-${item.id}`).textContent = qty;
          if (qty === 0) {
            document.getElementById(`add-btn-${item.id}`).classList.remove('hidden');
            document.getElementById(`qty-ctrl-${item.id}`).classList.add('hidden');
          }
        });

        // Restore qty state if item already in cart
        const existingQty = this.getItemQty(item.id);
        if (existingQty > 0) {
          card.querySelector(`#add-btn-${item.id}`).classList.add('hidden');
          card.querySelector(`#qty-ctrl-${item.id}`).classList.remove('hidden');
          card.querySelector(`#qty-num-${item.id}`).textContent = existingQty;
        }
        row.appendChild(card);
      });

      section.appendChild(row);
      grid.appendChild(section);
    });
  }

  renderItems(catalogItems) {
    this.fullCatalog = catalogItems;
    this.selectedCategory = 'all';
    this.setupCategoryFilter();
    this.renderCatalog();
  }

  addToCart(item) {
    const existing = this.cart.find(i => i.id === item.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }

    this.updateCartUI();
    this.saveCart();
  }

  removeFromCart(itemId) {
    const existing = this.cart.find(i => i.id === itemId);
    if (!existing) return;

    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      this.cart = this.cart.filter(i => i.id !== itemId);
    }

    this.updateCartUI();
    this.saveCart();
  }

  getItemQty(itemId) {
    const item = this.cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  updateCartUI() {
    const countEl   = document.getElementById('cart-count');
    const totalEl   = document.getElementById('cart-total');
    const proceedBtn = document.getElementById('proceed-btn');

    let count = 0;
    let total = 0;

    this.cart.forEach(item => {
      count += item.quantity;
      total += item.price * item.quantity;
    });

    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = `₹${total}`;
    if (proceedBtn) proceedBtn.disabled = count === 0;

    // Header cart count badge
    const headerCount = document.getElementById('header-cart-count');
    if (headerCount) {
      const prev = parseInt(headerCount.textContent) || 0;
      headerCount.textContent = count;
      if (count > prev) {
        headerCount.classList.remove('popping');
        void headerCount.offsetWidth;
        headerCount.classList.add('popping');
        setTimeout(() => headerCount.classList.remove('popping'), 350);
      }
    }

    // Dropdown total
    const ddTotal = document.getElementById('cart-total-dropdown');
    if (ddTotal) ddTotal.textContent = `₹${total}`;

    // Refresh dropdown body if open
    this.renderCartDropdown();

    // Store cart items in order data
    this.orderData.items = this.cart;
  }

  renderCartDropdown() {
    const body      = document.getElementById('cart-dropdown-body');
    const ddTotal   = document.getElementById('cart-total-dropdown');
    const proceedBtn = document.getElementById('proceed-btn');

    if (!body) return;

    let total = 0;
    this.cart.forEach(i => total += i.price * i.quantity);
    if (ddTotal) ddTotal.textContent = `₹${total}`;
    if (proceedBtn) proceedBtn.disabled = this.cart.length === 0;

    if (this.cart.length === 0) {
      body.innerHTML = '<p class="cart-empty-msg">Your cart is empty</p>';
      return;
    }

    body.innerHTML = this.cart.map(item => `
      <div class="cart-dd-item">
        <img class="cart-dd-img" src="${item.img}" alt="${item.name}"
             onerror="this.src='https://placehold.co/44x44/f5f5f5/FFB800?text=?'">
        <div class="cart-dd-info">
          <div class="cart-dd-name">${item.name}</div>
          <div class="cart-dd-qty-price">${item.quantity} × ₹${item.price}</div>
        </div>
        <span class="cart-dd-price">₹${item.price * item.quantity}</span>
      </div>
    `).join('');
  }

  initCartDropdown() {
    const cartBtn = document.getElementById('cart-btn');
    const dropdown = document.getElementById('cart-dropdown');
    const closeBtn = document.getElementById('cart-dropdown-close');

    if (!cartBtn || !dropdown) return;

    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      if (!isOpen) this.renderCartDropdown();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('open');
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== cartBtn) {
        dropdown.classList.remove('open');
      }
    });
  }

  async saveCart() {
    await db.save('cache', { key: 'cart', value: this.cart });
  }

  async restoreCart() {
    const cached = await db.get('cache', 'cart');
    if (cached && cached.value) {
      this.cart = cached.value;
      this.updateCartUI();
    }
  }

  // ==================== DELIVERY DETAILS ====================
  setupDeliveryDetailsForm() {
    const form = document.getElementById('delivery-form');

    // ── Auto-save: save draft on every input change ──────────────────────
    const FIELD_IDS = [
      'apartment-name', 'colony-name', 'flat-number', 'house-number',
      'flat-color', 'gate-number', 'staircase-color',
      'floor-number', 'intercom-code', 'special-identifiers',
      'customer-name', 'customer-phone'
    ];
    const CHECKBOX_IDS = ['has-lift', 'is-left-side'];

    const _collectFormData = () => {
      const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
      const getChk = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
      return {
        apartmentName:     getVal('apartment-name'),
        colonyName:        getVal('colony-name'),
        flatNumber:        getVal('flat-number'),
        houseNumber:       getVal('house-number'),
        flatColor:         getVal('flat-color'),
        gateNumber:        getVal('gate-number'),
        staircaseColor:    getVal('staircase-color'),
        hasLift:           getChk('has-lift'),
        isLeftSide:        getChk('is-left-side'),
        floorNumber:       getVal('floor-number'),
        intercomCode:      getVal('intercom-code'),
        specialIdentifiers:getVal('special-identifiers'),
        customerName:      getVal('customer-name'),
        customerPhone:     getVal('customer-phone'),
      };
    };

    const _autoSave = () => {
      const data = _collectFormData();
      db.save('drafts', { id: 'delivery-form', ...data }).catch(() => {});
      // Show a subtle saved indicator
      const btn = document.getElementById('next-location-btn');
      if (btn) {
        btn.dataset.origText = btn.dataset.origText || btn.textContent;
        btn.textContent = '✓ Draft saved';
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => {
          btn.textContent = btn.dataset.origText;
        }, 1200);
      }
    };

    FIELD_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', _autoSave);
    });
    CHECKBOX_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', _autoSave);
    });

    // ── Auto-restore: fill form from saved draft ─────────────────────────
    db.get('drafts', 'delivery-form').then(saved => {
      if (!saved) return;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
      const chk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
      set('apartment-name',      saved.apartmentName);
      set('colony-name',         saved.colonyName);
      set('flat-number',         saved.flatNumber);
      set('house-number',        saved.houseNumber);
      set('flat-color',          saved.flatColor);
      set('gate-number',         saved.gateNumber);
      set('staircase-color',     saved.staircaseColor);
      set('floor-number',        saved.floorNumber);
      set('intercom-code',       saved.intercomCode);
      set('special-identifiers', saved.specialIdentifiers);
      set('customer-name',       saved.customerName);
      set('customer-phone',      saved.customerPhone);
      chk('has-lift',            saved.hasLift);
      chk('is-left-side',        saved.isLeftSide);
    }).catch(() => {});

    // ── Next button ───────────────────────────────────────────────────────
    document.getElementById('next-location-btn').addEventListener('click', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        alert('Please fill all required fields');
        return;
      }

      const data = _collectFormData();
      this.orderData.deliveryDetails = {
        apartmentName:      data.apartmentName,
        colonyName:         data.colonyName,
        flatNumber:         data.flatNumber,
        houseNumber:        data.houseNumber,
        flatColor:          data.flatColor,
        gateNumber:         data.gateNumber,
        staircaseColor:     data.staircaseColor,
        hasLift:            data.hasLift,
        isLeftSide:         data.isLeftSide,
        floorNumber:        data.floorNumber,
        intercomCode:       data.intercomCode,
        specialIdentifiers: data.specialIdentifiers,
      };
      this.orderData.customerName  = data.customerName;
      this.orderData.customerPhone = data.customerPhone;

      this.saveDraft();
      this.showPage('map');
    });
  }

  // ==================== VOICE & LANDMARKS ====================
  setupVoiceRecording() {
    // Landmark upload
    document.getElementById('landmark-file').addEventListener('change', (e) => {
      this.handleLandmarkUpload(e);
    });

    // Voice recording controls
    document.getElementById('start-recording').addEventListener('click', () => {
      this.startVoiceRecording();
    });

    document.getElementById('stop-recording').addEventListener('click', () => {
      this.stopVoiceRecording();
    });

    document.getElementById('re-record-btn').addEventListener('click', () => {
      this.resetVoiceRecording();
    });

    document.getElementById('next-confirm-btn').addEventListener('click', () => {
      this.orderData.textInstruction = document.getElementById('text-instruction').value;
      this.showPage('review');
    });
  }

  async handleLandmarkUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.landmarkBlob = file;

    // Preview image
    const preview = document.getElementById('landmark-preview');
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    preview.innerHTML = '';
    preview.appendChild(img);
    preview.classList.remove('hidden');
  }

  async startVoiceRecording() {
    const success = await voiceRecorder.startRecording();
    if (!success) return;

    document.getElementById('start-recording').classList.add('hidden');
    document.getElementById('stop-recording').classList.remove('hidden');
    document.getElementById('recording-time').classList.remove('hidden');

    // Update timer
    this.recordingInterval = setInterval(() => {
      const duration = voiceRecorder.getRecordingDuration();
      document.getElementById('timer').textContent = formatTime(duration);
    }, 100);
  }

  async stopVoiceRecording() {
    clearInterval(this.recordingInterval);

    // Wait for all audio data to be collected before building blob
    const blob = await voiceRecorder.stopRecording();
    voiceRecorder.reset(); // safe to reset chunks now, blob is already built

    document.getElementById('start-recording').classList.remove('hidden');
    document.getElementById('stop-recording').classList.add('hidden');
    document.getElementById('recording-time').classList.add('hidden');

    if (!blob || blob.size === 0) {
      alert('Recording was empty — please try again and speak into the mic.');
      return;
    }

    this.voiceBlob = blob;

    // Build object URL and inject a real <audio> element
    const audioUrl = URL.createObjectURL(blob);
    const playback = document.getElementById('voice-playback');

    // Create audio element programmatically so blob URL is set before it tries to load
    const audioEl = document.createElement('audio');
    audioEl.controls  = true;
    audioEl.preload   = 'auto';
    audioEl.style.cssText = 'width:100%;border-radius:10px;margin-bottom:10px;display:block;';
    audioEl.src = audioUrl;

    const reRecordBtn = document.createElement('button');
    reRecordBtn.id        = 're-record-btn';
    reRecordBtn.className = 'btn btn-secondary';
    reRecordBtn.textContent = 'Re-record';
    reRecordBtn.setAttribute('aria-label', 'Re-record voice');
    reRecordBtn.addEventListener('click', () => this.resetVoiceRecording());

    playback.innerHTML = '';
    playback.appendChild(audioEl);
    playback.appendChild(reRecordBtn);
    playback.classList.remove('hidden');

    // Give the browser a tick then try auto-loading
    setTimeout(() => audioEl.load(), 50);
  }

  resetVoiceRecording() {
    this.voiceBlob = null;
    voiceRecorder._cleanup();
    document.getElementById('voice-playback').classList.add('hidden');
    document.getElementById('voice-playback').innerHTML = '';
    document.getElementById('start-recording').classList.remove('hidden');
    document.getElementById('stop-recording').classList.add('hidden');
    document.getElementById('recording-time').classList.add('hidden');
    document.getElementById('timer').textContent = '0:00';
  }

  // ==================== REVIEW & CONFIRM ====================
  populateReview() {
    // Items
    const itemsList = document.getElementById('review-items');
    itemsList.innerHTML = '';
    let total = 0;

    this.orderData.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} x${item.quantity} = ₹${item.price * item.quantity}`;
      itemsList.appendChild(li);
      total += item.price * item.quantity;
    });

    document.getElementById('review-total').textContent = `₹${total}`;

    // Location
    const locationDiv = document.getElementById('review-location');
    const details = this.orderData.deliveryDetails;
    locationDiv.innerHTML = `
      <p><strong>Building:</strong> ${details.apartmentName || '-'}</p>
      <p><strong>Flat #:</strong> ${details.flatNumber || '-'}</p>
      <p><strong>Colony:</strong> ${details.colonyName || '-'}</p>
      <p><strong>Door Color:</strong> ${details.flatColor || '-'}</p>
    `;

    // Guidance
    const guidanceDiv = document.getElementById('review-guidance');
    guidanceDiv.innerHTML = `
      <p><strong>Instructions:</strong></p>
      <p>${this.orderData.textInstruction || 'No text instruction'}</p>
      <p>${this.landmarkBlob ? 'Landmark image included' : ''}</p>
      <p>${this.voiceBlob ? 'Voice note included' : ''}</p>
    `;
  }

  // ==================== LINK GENERATION ====================

  initLinkGen() {
    this._lgOtp = null;
    this._lgExpiry = 2;
    this._lgGhost = false;

    // OTP toggle
    const otpToggle = document.getElementById('otp-toggle');
    const otpDisplay = document.getElementById('otp-display');
    otpToggle.checked = false;
    otpDisplay.classList.add('hidden');

    otpToggle.addEventListener('change', () => {
      if (otpToggle.checked) {
        this._lgOtp = this._genOtp();
        document.getElementById('otp-code').textContent = this._lgOtp;
        otpDisplay.classList.remove('hidden');
      } else {
        this._lgOtp = null;
        otpDisplay.classList.add('hidden');
      }
    });

    document.getElementById('otp-refresh').addEventListener('click', () => {
      this._lgOtp = this._genOtp();
      document.getElementById('otp-code').textContent = this._lgOtp;
    });

    // Expiry pills
    document.querySelectorAll('.lg-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lg-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._lgExpiry = parseInt(btn.dataset.hours);
      });
    });

    // Ghost mode
    document.getElementById('ghost-toggle').addEventListener('change', (e) => {
      this._lgGhost = e.target.checked;
    });

    // Generate button — upload files first, then build link
    document.getElementById('generate-link-btn').addEventListener('click', async () => {
      const btn = document.getElementById('generate-link-btn');
      btn.disabled = true;
      btn.textContent = 'Uploading...';
      try {
        // Upload voice blob if not already uploaded
        if (this.voiceBlob && !this.orderData.voiceNoteUrl) {
          const r = await api.uploadVoice(this.voiceBlob);
          this.orderData.voiceNoteUrl = r.url;
        }
        // Upload landmark blob if not already uploaded
        if (this.landmarkBlob && !this.orderData.landmarkImageUrl) {
          const r = await api.uploadLandmark(this.landmarkBlob);
          this.orderData.landmarkImageUrl = r.url;
        }
      } catch(e) {
        console.warn('Upload failed, continuing without media:', e);
      }
      btn.disabled = false;
      btn.textContent = 'Generate Link';
      await this.generateExecLink();
    });

    // Copy button
    document.getElementById('copy-link-btn').addEventListener('click', () => {
      const link = document.getElementById('generated-link').value;
      navigator.clipboard.writeText(link).then(() => {
        document.getElementById('copy-link-btn').textContent = 'Copied!';
        setTimeout(() => {
          document.getElementById('copy-link-btn').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
        }, 2000);
      });
    });

    // SMS share
    document.getElementById('sms-share-btn').addEventListener('click', () => {
      const link = document.getElementById('generated-link').value;
      const execPhone = document.getElementById('exec-phone')?.value || '';
      const customerPhone = this.orderData.customerPhone || '';
      const phone = execPhone || customerPhone;
      const msg = `DoorPilot Delivery Guide: ${link}${this._lgOtp ? ` | OTP: ${this._lgOtp}` : ''}`;
      if (navigator.share) {
        navigator.share({ title: 'DoorPilot Delivery', text: msg, url: link });
      } else {
        window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`);
      }
    });

    // WhatsApp share
    document.getElementById('whatsapp-share-btn').addEventListener('click', () => {
      const link = document.getElementById('generated-link').value;
      const execPhone = document.getElementById('exec-phone')?.value?.replace(/\D/g,'') || '';
      const msg = `🚚 *DoorPilot Delivery Guide*\nOpen this link for step-by-step navigation:\n${link}${this._lgOtp ? `\n\n🔑 OTP: *${this._lgOtp}*` : ''}`;
      const encoded = encodeURIComponent(msg);
      if (execPhone) {
        // Direct chat to specific number (works on mobile)
        window.open(`https://wa.me/91${execPhone}?text=${encoded}`);
      } else {
        // Share dialog — user picks contact
        window.open(`https://wa.me/?text=${encoded}`);
      }
    });

    // Done — place order
    document.getElementById('done-share-btn').addEventListener('click', () => {
      this.confirmAndPlaceOrder();
    });

    // Hide output initially
    document.getElementById('link-output').classList.add('hidden');
  }

  _genOtp() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  async generateExecLink() {
    const o = this.orderData || {};
    const d = o.deliveryDetails || {};
    const m = o.mapPin || { latitude: 12.9716, longitude: 77.5946 };

    const payload = {
      v: 1,
      otp:       this._lgOtp || null,
      exp:       Date.now() + (this._lgExpiry || 2) * 3600 * 1000,
      ghost:     this._lgGhost || false,
      name:      this._lgGhost ? null : (o.customerName || 'Customer'),
      phone:     o.customerPhone || '',
      flat:      d.flatNumber || '',
      apt:       d.apartmentName || '',
      colony:    d.colonyName || '',
      color:     d.flatColor || '',
      floor:     d.floorNumber || '',
      lift:      d.hasLift ?? true,
      gate:      d.gateNumber || '',
      intercom:  d.intercomCode || '',
      landmarks: d.specialIdentifiers || '',
      lat:       m.latitude || 12.9716,
      lng:       m.longitude || 77.5946,
      instr:     o.textInstruction || '',
      voice:     o.voiceNoteUrl  || null,
      img:       o.landmarkImageUrl || null,
    };

    const execPhone   = document.getElementById('exec-phone')?.value?.trim() || '';
    const smsStatusEl = document.getElementById('sms-status');
    if (smsStatusEl) { smsStatusEl.textContent = '🔗 Creating link…'; smsStatusEl.style.color = '#888'; }

    try {
      const res  = await fetch('/api/exec-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          execPhone:    execPhone || null,
          customerName: this._lgGhost ? null : (o.customerName || null)
        })
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Server error');

      const link = data.link;
      const linkInput = document.getElementById('generated-link');
      if (linkInput) linkInput.value = link;

      const linkOutput = document.getElementById('link-output');
      if (linkOutput) linkOutput.classList.remove('hidden');

      if (smsStatusEl) {
        smsStatusEl.textContent = execPhone
          ? `✅ SMS sent to ${execPhone}`
          : '📋 Copy or share the link below';
        smsStatusEl.style.color = execPhone ? '#22c55e' : '#888';
      }

      const qrEl = document.getElementById('qr-code');
      if (qrEl) {
        qrEl.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrEl, { text: link, width: 180, height: 180, colorDark: '#1a1a1a', colorLight: '#ffffff' });
        }
      }

      setTimeout(() => {
        const out = document.getElementById('link-output');
        if (out) out.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch(err) {
      console.error('generateExecLink error:', err);
      if (smsStatusEl) { smsStatusEl.textContent = '❌ Failed — ' + err.message; smsStatusEl.style.color = '#ef4444'; }
      alert('Could not create link: ' + err.message + '\n\nPlease ensure your server is running on localhost:3000 and try again.');
    }
  }

  async _sendExecLinkSMS(execPhone, execLink, otp, customerName) {
    const smsStatusEl = document.getElementById('sms-status');
    if (smsStatusEl) {
      smsStatusEl.textContent = '📤 Sending SMS...';
      smsStatusEl.style.color = '#888';
    }
    try {
      const res = await fetch('/api/sms/send-exec-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ execPhone, execLink, otp, customerName }),
      });
      const data = await res.json();
      if (smsStatusEl) {
        if (data.success) {
          smsStatusEl.textContent = `✅ SMS sent to ${execPhone}`;
          smsStatusEl.style.color = '#22c55e';
        } else {
          smsStatusEl.textContent = `⚠️ SMS failed — share the link manually`;
          smsStatusEl.style.color = '#ef4444';
        }
      }
    } catch (e) {
      if (smsStatusEl) {
        smsStatusEl.textContent = '⚠️ SMS failed — share manually';
        smsStatusEl.style.color = '#ef4444';
      }
    }
  }

  async confirmAndPlaceOrder() {
    try {
      document.getElementById('confirm-order-btn').disabled = true;

      // Show processing
      this.showPage('processing');

      // Upload voice and landmark
      if (this.voiceBlob) {
        const voiceResult = await api.uploadVoice(this.voiceBlob);
        this.orderData.voiceNoteUrl = voiceResult.url;
      }

      if (this.landmarkBlob) {
        const landmarkResult = await api.uploadLandmark(this.landmarkBlob);
        this.orderData.landmarkImageUrl = landmarkResult.url;
      }

      // Create order
      const result = await api.createOrder(this.orderData);
      this.currentOrderId = result.orderId;

      // Save order locally
      await db.save('orders', { ...result.order, id: this.currentOrderId });

      // Show waiting page
      this.showPage('waiting');
      document.getElementById('order-id-display').textContent = `Order #${this.currentOrderId.substring(0, 8).toUpperCase()}`;

      // Simulate delivery executive assignment
      setTimeout(() => {
        this.simulateDeliveryAssignment();
      }, 2000);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
      document.getElementById('confirm-order-btn').disabled = false;
    }
  }

  async simulateDeliveryAssignment() {
    // Simulate finding a delivery executive
    try {
      // For demonstration, we'll assign the delivery to the phone number the user entered
      const deliveryExecutivePhone = this.orderData.customerPhone || '+919876543210';
      const deliveryExecutiveId = 'exec-' + Math.random().toString(36).substr(2, 9);

      const result = await api.assignDeliveryExecutive(
        this.currentOrderId,
        deliveryExecutivePhone,
        deliveryExecutiveId
      );

      console.log('Delivery assigned, SMS sent with Find Me link:', result.findMeLink);

      // Store delivery executive info
      this.currentDeliveryExecutiveId = deliveryExecutiveId;
      this.currentDeliveryExecutivePhone = deliveryExecutivePhone;

      // Listen for tracking
      if (this.socket) {
        this.socket.emit('track-delivery', this.currentOrderId);
      }

      // Show tracking page
      setTimeout(() => {
        this.showPage('tracking');
      }, 3000);
    } catch (err) {
      console.error('Error assigning delivery executive:', err);
      alert('Failed to assign delivery executive');
    }
  }

  // ==================== TRACKING ====================
  startTracking() {
    const phoneEl = document.getElementById('delivery-phone');
    if (phoneEl) {
      phoneEl.textContent = this.currentDeliveryExecutivePhone || this.orderData.customerPhone || 'Contacting...';
    }

    this.setupExecutivePwaLink();

    // Initialize real map for delivery executive location updates
    this.initializeRealTracking();
  }

  setupExecutivePwaLink() {
    const d = this.orderData.deliveryDetails || {};
    const payload = {
      name: this.orderData.customerName || d.customerName || 'Customer',
      phone: this.orderData.customerPhone || d.customerPhone || '',
      lat: (this.orderData.mapPin && this.orderData.mapPin.latitude) || 13.2916,
      lng: (this.orderData.mapPin && this.orderData.mapPin.longitude) || 77.6768,
      colony: d.colonyName || 'Mudugurki, Devanahalli',
      gate: d.gateNumber || '1',
      apt: d.apartmentName || 'Nagarjuna Campus',
      floor: d.floorNumber || '2',
      lift: d.hasLift !== undefined ? d.hasLift : true,
      flat: d.flatNumber || '204',
      color: d.flatColor || 'Blue Door',
      intercom: d.intercomCode || '204#',
      landmarks: d.specialIdentifiers || this.orderData.textInstruction || 'Near main block entrance',
      voice: this.orderData.voiceNoteUrl || '',
      img: this.orderData.landmarkImageUrl || '',
      exp: Date.now() + 24 * 3600 * 1000 // 24h expiration
    };

    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const execUrl = `${window.location.origin}/exec.html#${b64}`;

    const linkInput = document.getElementById('tracking-pwa-link');
    const openBtn   = document.getElementById('open-exec-view-btn');
    const copyBtn   = document.getElementById('copy-tracking-link-btn');
    const smsBtn    = document.getElementById('tracking-sms-btn');
    const waBtn     = document.getElementById('tracking-whatsapp-btn');

    if (linkInput) linkInput.value = execUrl;
    if (openBtn) openBtn.href = execUrl;

    if (copyBtn) {
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(execUrl);
          this.showNotification('📋 Executive link copied to clipboard!');
        } catch (e) {
          if (linkInput) {
            linkInput.select();
            document.execCommand('copy');
            this.showNotification('📋 Executive link copied!');
          }
        }
      };
    }

    if (smsBtn) {
      smsBtn.onclick = () => {
        const phone = payload.phone || '';
        const body = encodeURIComponent(`Hi! Here is your DoorPilot turn-by-turn door navigation link:\n${execUrl}`);
        window.open(`sms:${phone}?body=${body}`);
      };
    }

    if (waBtn) {
      waBtn.onclick = () => {
        const text = encodeURIComponent(`🛵 *DoorPilot Executive Delivery Link*\n\nHi! Use this link for step-by-step door navigation and voice guidance:\n${execUrl}`);
        window.open(`https://wa.me/?text=${text}`);
      };
    }
  }


  initializeRealTracking() {
    setTimeout(() => {
      if (this.trackingMap) {
        this.trackingMap.remove();
      }
      const mapEl = document.getElementById('tracking-map');
      mapEl.innerHTML = '';
      
      const customerLat = this.orderData.mapPin.latitude || 28.6139;
      const customerLng = this.orderData.mapPin.longitude || 77.2090;

      this.trackingMap = L.map('tracking-map').setView([customerLat, customerLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.trackingMap);
      
      L.marker([customerLat, customerLng], { title: 'Your Location' }).addTo(this.trackingMap);
      
      this.deliveryMarkers = {}; // Reset markers
    }, 500);
  }

  showDeliveryArrivalOptions() {
    const status = document.getElementById('tracking-status');
    status.textContent = 'Delivery partner has arrived!';
    status.style.color = '#2ECE6B';
  }

  updateDeliveryLocation(data) {
    if (data.orderId !== this.currentOrderId) return;
    
    if (!this.trackingMap) return;

    const execLat = parseFloat(data.latitude);
    const execLng = parseFloat(data.longitude);

    if (!this.deliveryMarkers[data.deliveryExecutiveId]) {
      // Create new marker for this executive
      const execMarker = L.marker([execLat, execLng], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40"><path fill="%23FF6B6B" d="M15 0C9 0 4 5 4 12c0 8 11 28 11 28s11-20 11-28c0-7-5-12-11-12z"/></svg>',
          iconSize: [30, 40]
        })
      }).addTo(this.trackingMap);
      
      this.deliveryMarkers[data.deliveryExecutiveId] = execMarker;
      
      // Fit bounds to show both customer and delivery partner
      const customerLat = this.orderData.mapPin.latitude || 28.6139;
      const customerLng = this.orderData.mapPin.longitude || 77.2090;
      this.trackingMap.fitBounds([[customerLat, customerLng], [execLat, execLng]], { padding: [40,40] });
    } else {
      // Update existing marker position
      this.deliveryMarkers[data.deliveryExecutiveId].setLatLng([execLat, execLng]);
    }
    
    // Check arrival distance (roughly 100 meters)
    const customerLat = this.orderData.mapPin.latitude || 28.6139;
    const customerLng = this.orderData.mapPin.longitude || 77.2090;
    const distance = Math.sqrt(Math.pow(customerLat - execLat, 2) + Math.pow(customerLng - execLng, 2));
    if (distance < 0.001) {
      this.showDeliveryArrivalOptions();
    }
  }

  // ==================== FIND ME PAGE (Delivery Executive) ====================
  async initializeFindMe() {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = window.location.pathname.split('/').pop();

    if (!token) {
      alert('Invalid Find Me link');
      return;
    }

    try {
      const order = await api.getOrderByToken(token);

      // Display instruction
      document.getElementById('findme-instruction').textContent = order.textInstruction || 'Follow the voice note for directions';

      // Display landmark image
      if (order.landmarkImageUrl) {
        const img = document.createElement('img');
        img.src = order.landmarkImageUrl;
        document.getElementById('findme-landmark').appendChild(img);
      }

      // Play voice note
      if (order.voiceNoteUrl) {
        const audio = document.getElementById('findme-voice');
        audio.src = order.voiceNoteUrl;
      }

      // Initialize map
      const findmeMap = L.map('findme-map').setView(
        [order.mapPin.latitude, order.mapPin.longitude],
        16
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(findmeMap);

      L.marker([order.mapPin.latitude, order.mapPin.longitude], {
        title: 'Delivery Location'
      }).addTo(findmeMap);

      // Setup Near Me button
      document.getElementById('findme-near-btn').addEventListener('click', async () => {
        try {
          await api.sendNearMeNotification(order.orderId, 'exec-' + Math.random());
          alert('Customer has been notified!');
        } catch (err) {
          console.error('Error sending notification:', err);
        }
      });

      // Setup Wrong Door button
      document.getElementById('findme-wrong-btn').addEventListener('click', async () => {
        try {
          await api.sendWrongDoorNotification(order.orderId, 'exec-' + Math.random());
          alert('Customer has been notified about the wrong location');
        } catch (err) {
          console.error('Error sending notification:', err);
        }
      });

      this.currentOrderId = order.orderId;
    } catch (err) {
      console.error('Error loading Find Me page:', err);
      alert('Failed to load delivery location');
    }
  }

  // ==================== RATING ====================
  setupRatingPage() {
    let selectedRating = 0;

    document.querySelectorAll('.rating-stars .star').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.rating);

        // Update UI
        document.querySelectorAll('.rating-stars .star').forEach((b, i) => {
          if (i < selectedRating) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        const ratingTexts = ['Poor', 'Not Good', 'OK', 'Good', 'Excellent'];
        document.getElementById('rating-text').textContent = ratingTexts[selectedRating - 1];
        document.getElementById('rating-text').classList.remove('hidden');

        document.getElementById('submit-rating-btn').disabled = false;
      });
    });

    document.getElementById('submit-rating-btn').addEventListener('click', async () => {
      const feedback = document.getElementById('feedback-text').value;

      try {
        await api.submitRating(this.currentOrderId, selectedRating, feedback);
        this.showPage('completion');
      } catch (err) {
        console.error('Error submitting rating:', err);
        alert('Failed to submit rating');
      }
    });
  }

  // ==================== UTILITIES ====================
  async saveDraft() {
    await db.save('drafts', { id: 'current', ...this.orderData });
  }

  showNotification(message) {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ECE6B;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9000;
      animation: slideInFromRight 0.3s ease-out;
    `;
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  handlePageLoad() {
    // ── Header 📍 button — show live location in a modal map ──────────────
    document.getElementById('location-btn').addEventListener('click', () => {
      this._openLocationModal();
    });

    // Order page events
    document.getElementById('proceed-btn').addEventListener('click', () => {
      this.showPage('delivery-details');
    });

    // Delivery details form setup — only once
    this.setupDeliveryDetailsForm();

    // Map page events
    document.getElementById('get-current-location').addEventListener('click', () => {
      mapManager.getCurrentLocation((lat, lng) => {
        this.orderData.mapPin = { latitude: lat, longitude: lng };
      });
    });

    document.getElementById('next-voice-btn').addEventListener('click', () => {
      const location = mapManager.getSelectedLocation();
      if (!location.latitude || !location.longitude) {
        alert('Please select a location on the map');
        return;
      }
      this.orderData.mapPin = location;
      this.showPage('voice');
    });

    // Voice page events
    this.setupVoiceRecording();

    // Review page — go to link generation settings
    document.getElementById('confirm-order-btn').addEventListener('click', () => {
      this.showPage('linkgen');
      this.initLinkGen();
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      this.showPage('voice');
    });

    // Rating page events
    this.setupRatingPage();

    // Completion page events
    document.getElementById('new-order-btn').addEventListener('click', () => {
      this.cart = [];
      this.orderData = {
        items: [],
        customerPhone: '',
        customerName: '',
        deliveryDetails: {},
        mapPin: {},
        voiceNoteUrl: '',
        landmarkImageUrl: '',
        textInstruction: ''
      };
      this.currentOrderId = null;
      this.voiceBlob = null;
      this.landmarkBlob = null;
      this.saveCart();
      this.showPage('order');
    });

    // Clear cart button
    document.getElementById('clear-cart-btn').addEventListener('click', () => {
      this.cart = [];
      this.orderData.items = [];
      // Delete entire IndexedDB to fully wipe cart
      indexedDB.deleteDatabase('DoorPilot');
      document.getElementById('cart-count').textContent = '0';
      document.getElementById('cart-total').textContent = '₹0';
      document.getElementById('header-cart-count').textContent = '0';
      document.getElementById('proceed-btn').disabled = true;
      this.renderCatalog();
    });

    // Handle Find Me page if URL contains token
    if (window.location.pathname.includes('/find-me/')) {
      this.showPage('findme');
    }
  }
  // ==================== LOCATION MODAL ====================
  _openLocationModal() {
    const existing = document.getElementById('location-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'location-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:10000;
      background:rgba(10,22,40,0.7);
      display:flex;align-items:flex-end;justify-content:center;
    `;

    modal.innerHTML = `
      <div id="loc-sheet" style="
        width:100%;max-width:600px;
        background:#fff;border-radius:24px 24px 0 0;
        overflow:hidden;
        box-shadow:0 -8px 40px rgba(0,0,0,0.3);
        transform:translateY(100%);
        transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);
      ">
        <!-- Header -->
        <div style="background:#FFB800;padding:14px 18px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">📍</span>
          <span style="font-weight:700;font-size:16px;flex:1;">Your Exact Location</span>
          <button id="close-loc-modal" style="background:rgba(0,0,0,0.12);border:none;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>

        <!-- Search box -->
        <div style="padding:10px 14px 6px;background:#fffbee;border-bottom:1px solid #f0e8c8;position:relative;">
          <div style="display:flex;gap:8px;align-items:center;">
            <input id="loc-search-input" type="text" placeholder="Search your location (e.g. Nagarjuna College...)"
              style="flex:1;padding:10px 14px;border:1.5px solid #FFB800;border-radius:40px;font-size:14px;outline:none;background:#fff;" />
            <button id="loc-search-btn" style="padding:10px 16px;background:#FFB800;border:none;border-radius:40px;font-weight:700;font-size:13px;cursor:pointer;">Search</button>
          </div>
          <div id="loc-search-results" style="
            display:none;position:absolute;left:14px;right:14px;top:54px;
            background:#fff;border:1px solid #e0d8c0;border-radius:12px;
            box-shadow:0 4px 16px rgba(0,0,0,0.12);z-index:100;max-height:200px;overflow-y:auto;
          "></div>
        </div>

        <!-- Map -->
        <div style="position:relative;">
          <div id="loc-modal-map" style="height:240px;width:100%;background:#e8e0d8;"></div>
          <!-- Loading overlay -->
          <div id="loc-map-loading" style="
            position:absolute;inset:0;background:rgba(255,248,225,0.92);
            display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
            font-size:14px;color:#555;
          ">
            <div style="width:36px;height:36px;border:3px solid #FFB800;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            <span>Getting your exact location…</span>
            <span style="font-size:12px;color:#888;">Allow location access if prompted</span>
          </div>
          <!-- Recenter button -->
          <button id="loc-recenter" style="
            position:absolute;bottom:12px;right:12px;
            width:40px;height:40px;border:none;border-radius:50%;
            background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);
            font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
          ">🎯</button>
        </div>

        <!-- Address card -->
        <div style="padding:14px 18px 0;">
          <div id="loc-place-name" style="font-weight:700;font-size:15px;color:#1e1e1e;margin-bottom:4px;">Locating…</div>
          <div id="loc-modal-address" style="font-size:13px;color:#666;line-height:1.5;margin-bottom:12px;min-height:18px;"></div>
          <div id="loc-coords" style="font-size:11px;color:#aaa;margin-bottom:14px;font-family:monospace;"></div>
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:10px;padding:0 18px 20px;">
          <button id="loc-modal-navigate" style="
            flex:1;padding:13px 8px;border:none;border-radius:40px;
            background:#FFB800;color:#1e1e1e;font-weight:700;font-size:14px;cursor:pointer;
          ">🗺️ Navigate Here</button>
          <button id="loc-modal-share" style="
            flex:1;padding:13px 8px;border:none;border-radius:40px;
            background:#0A2647;color:#fff;font-weight:700;font-size:14px;cursor:pointer;
          ">🔗 Share Location</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Slide up
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('loc-sheet').style.transform = 'translateY(0)';
      });
    });

    const closeModal = () => {
      document.getElementById('loc-sheet').style.transform = 'translateY(100%)';
      setTimeout(() => modal.remove(), 350);
    };

    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.getElementById('close-loc-modal').addEventListener('click', closeModal);

    let modalLat = null, modalLng = null, miniMap = null, myMarker = null, myCircle = null;

    // Init map immediately at a sensible default, then fly to GPS
    miniMap = L.map('loc-modal-map', { zoomControl: false, attributionControl: false })
               .setView([20.5937, 78.9629], 5);

    // Use CartoDB Voyager — clean, detailed street map (same style as the reference image)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(miniMap);

    // Zoom controls top-right
    L.control.zoom({ position: 'topright' }).addTo(miniMap);

    setTimeout(() => miniMap.invalidateSize(), 100);

    // Recenter button
    document.getElementById('loc-recenter').addEventListener('click', () => {
      if (modalLat) miniMap.flyTo([modalLat, modalLng], 17, { animate: true, duration: 0.8 });
    });

    // ── Search box ────────────────────────────────────────────────────────
    const searchInput   = document.getElementById('loc-search-input');
    const searchBtn     = document.getElementById('loc-search-btn');
    const searchResults = document.getElementById('loc-search-results');

    const doSearch = async () => {
      const q = searchInput.value.trim();
      if (!q) return;
      searchBtn.textContent = '…';
      searchResults.style.display = 'none';
      searchResults.innerHTML = '';
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const results = await r.json();
        if (!results.length) {
          searchResults.innerHTML = '<div style="padding:12px 16px;color:#888;font-size:13px;">No results found</div>';
          searchResults.style.display = 'block';
        } else {
          results.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'padding:10px 16px;cursor:pointer;border-bottom:1px solid #f0ece0;font-size:13px;';
            const name = item.display_name.split(',').slice(0, 3).join(', ');
            div.textContent = name;
            div.addEventListener('mouseenter', () => div.style.background = '#fffbee');
            div.addEventListener('mouseleave', () => div.style.background = '');
            div.addEventListener('click', () => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              modalLat = lat; modalLng = lng;

              // Update marker
              const youIcon = L.divIcon({
                className: '',
                html: `<div style="position:relative;width:22px;height:22px;">
                  <div style="position:absolute;inset:0;border-radius:50%;background:rgba(66,133,244,0.25);animation:markerPulse 2s infinite;"></div>
                  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#4285F4;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(66,133,244,0.6);"></div>
                </div>`,
                iconSize: [22, 22], iconAnchor: [11, 11]
              });
              if (myMarker) miniMap.removeLayer(myMarker);
              if (myCircle) { miniMap.removeLayer(myCircle); myCircle = null; }
              myMarker = L.marker([lat, lng], { icon: youIcon }).addTo(miniMap);
              miniMap.flyTo([lat, lng], 17, { animate: true, duration: 1 });

              // Update address display
              const addr = item.address || {};
              const finalName = item.display_name.split(',')[0].trim();
              const shortAddr = [
                addr.road || addr.pedestrian,
                addr.neighbourhood || addr.suburb || addr.village,
                addr.city || addr.town || addr.county,
                addr.state
              ].filter(Boolean).join(', ');
              document.getElementById('loc-place-name').textContent = finalName;
              document.getElementById('loc-modal-address').textContent = shortAddr || item.display_name;
              document.getElementById('loc-coords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              myMarker.bindPopup(`<b>${finalName}</b><br><small>${shortAddr}</small>`, {
                offset: [0, -12], closeButton: false
              }).openPopup();

              searchResults.style.display = 'none';
              searchInput.value = '';
            });
            searchResults.appendChild(div);
          });
          searchResults.style.display = 'block';
        }
      } catch {
        searchResults.innerHTML = '<div style="padding:12px 16px;color:#c00;font-size:13px;">Search failed, try again</div>';
        searchResults.style.display = 'block';
      }
      searchBtn.textContent = 'Search';
    };

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) {
        searchResults.style.display = 'none';
      }
    });
    // ─────────────────────────────────────────────────────────────────────

    // GPS — high accuracy
    if (!navigator.geolocation) {
      document.getElementById('loc-place-name').textContent = 'Geolocation not supported';
      document.getElementById('loc-map-loading').style.display = 'none';
      return;
    }

    // ── Known locations: if GPS lands within 1km of these, show the correct name ──
    const KNOWN_PLACES = [
      {
        name: 'Nagarjuna College of Engineering and Technology',
        address: 'Mudugurki, Venkatagirikote Post, Devanahalli, Bengaluru, Karnataka',
        lat: 13.2916, lng: 77.6768, radiusKm: 1.0
      }
    ];

    const haversineKm = (lat1, lng1, lat2, lng2) => {
      const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        modalLat = pos.coords.latitude;
        modalLng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        // Hide loading overlay
        document.getElementById('loc-map-loading').style.display = 'none';

        // Show coords immediately
        document.getElementById('loc-coords').textContent =
          `${modalLat.toFixed(6)}, ${modalLng.toFixed(6)}  ±${Math.round(acc)}m`;

        // Pulsing "you are here" dot
        const youIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:22px;height:22px;">
              <div style="
                position:absolute;inset:0;border-radius:50%;
                background:rgba(66,133,244,0.25);
                animation:markerPulse 2s infinite;
              "></div>
              <div style="
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:14px;height:14px;border-radius:50%;
                background:#4285F4;border:2.5px solid #fff;
                box-shadow:0 2px 6px rgba(66,133,244,0.6);
              "></div>
            </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        myMarker = L.marker([modalLat, modalLng], { icon: youIcon }).addTo(miniMap);

        // Accuracy circle
        myCircle = L.circle([modalLat, modalLng], {
          radius: acc,
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.08,
          weight: 1.5
        }).addTo(miniMap);

        // Fly to exact location at street level
        // Use zoom 17 so the surrounding area (campus etc.) is visible
        miniMap.flyTo([modalLat, modalLng], 17, { animate: true, duration: 1.2 });

        // Reverse geocode — get place name + full address
        document.getElementById('loc-place-name').textContent = 'Fetching address…';
        try {
          // Use Nominatim directly for richer place data
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${modalLat}&lon=${modalLng}&format=json&zoom=16&addressdetails=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'DoorPilot/1.0' } }
          );
          const geo = await res.json();

          if (geo && geo.display_name) {
            const addr = geo.address || {};

            // Priority order: named institution > amenity > building > road > neighbourhood
            const placeName =
              addr.university || addr.college || addr.school || addr.hospital ||
              addr.amenity    || addr.building || addr.office || addr.leisure  ||
              addr.shop       || addr.road     || addr.neighbourhood || addr.suburb ||
              'Your Location';

            // If the place name still looks like a road/highway (e.g. "NH648"),
            // try to find a better name from the full display_name
            let finalName = placeName;
            if (/^(NH|SH|MDR|ODR|VR)\d+$/i.test(placeName)) {
              // Extract first meaningful token from display_name before the road
              const parts = geo.display_name.split(',').map(s => s.trim());
              const better = parts.find(p =>
                p.length > 3 &&
                !/^\d/.test(p) &&
                !/^(NH|SH|MDR)\d+$/i.test(p)
              );
              if (better) finalName = better;
            }

            const shortAddr = [
              addr.road || addr.pedestrian,
              addr.neighbourhood || addr.suburb || addr.village,
              addr.city || addr.town || addr.county,
              addr.state
            ].filter(Boolean).join(', ');

            document.getElementById('loc-place-name').textContent = finalName;
            document.getElementById('loc-modal-address').textContent = shortAddr || geo.display_name;

            // Add a label popup on the marker
            myMarker.bindPopup(`<b>${finalName}</b><br><small>${shortAddr}</small>`, {
              offset: [0, -12], closeButton: false
            }).openPopup();
          }
        } catch {
          // Fallback to our backend
          try {
            const res2 = await fetch(`/api/reverse-geocode?lat=${modalLat}&lng=${modalLng}`);
            const d2   = await res2.json();
            if (d2.success) {
              document.getElementById('loc-place-name').textContent = 'Your Location';
              document.getElementById('loc-modal-address').textContent = d2.address;
            }
          } catch { /* silent */ }
        }

        // ── Override with known place if within radius ──────────────────
        const nearby = KNOWN_PLACES.find(p => haversineKm(modalLat, modalLng, p.lat, p.lng) <= p.radiusKm);
        if (nearby) {
          document.getElementById('loc-place-name').textContent = nearby.name;
          document.getElementById('loc-modal-address').textContent = nearby.address;
          if (myMarker) myMarker.bindPopup(`<b>${nearby.name}</b><br><small>${nearby.address}</small>`, {
            offset: [0, -12], closeButton: false
          }).openPopup();
        }
      },
      (err) => {
        document.getElementById('loc-map-loading').style.display = 'none';
        const msgs = {
          1: 'Location permission denied.\nPlease allow location in browser settings.',
          2: 'Location signal unavailable. Try moving to an open area.',
          3: 'Location request timed out. Try again.'
        };
        document.getElementById('loc-place-name').textContent = '⚠️ Location Error';
        document.getElementById('loc-modal-address').textContent = msgs[err.code] || 'Could not get location';
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Navigate button
    document.getElementById('loc-modal-navigate').addEventListener('click', () => {
      if (!modalLat) return;
      const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      let url;
      if (isIOS)          url = `maps://maps.apple.com/?ll=${modalLat},${modalLng}&q=My+Location`;
      else if (isAndroid) url = `geo:${modalLat},${modalLng}?q=${modalLat},${modalLng}(My+Location)`;
      else                url = `https://www.google.com/maps?q=${modalLat},${modalLng}`;
      window.open(url, '_blank');
    });

    // Share button
    document.getElementById('loc-modal-share').addEventListener('click', async () => {
      if (!modalLat) return;
      const shareUrl = `https://www.google.com/maps?q=${modalLat},${modalLng}`;
      const place    = document.getElementById('loc-place-name').textContent;
      const addr     = document.getElementById('loc-modal-address').textContent;

      if (navigator.share) {
        try {
          await navigator.share({ title: place, text: addr, url: shareUrl });
        } catch { /* cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl);
          this.showNotification('📋 Location link copied!');
        } catch {
          this.showNotification(shareUrl);
        }
      }
    });
  }

}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DoorPilotApp();
});
