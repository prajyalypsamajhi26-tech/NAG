const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Simple JSON-based storage for MVP
const DATA_DIR = process.env.DB_PATH || './data';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, `${filename}.json`);
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading database:', err);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error writing to database:', err);
    }
  }

  add(item) {
    const data = this.read();
    const newItem = {
      id: uuidv4(),
      createdAt: new Date(),
      ...item
    };
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  update(id, updates) {
    const data = this.read();
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date() };
      this.write(data);
      return data[index];
    }
    return null;
  }

  findById(id) {
    const data = this.read();
    return data.find(item => item.id === id);
  }

  findAll() {
    return this.read();
  }

  delete(id) {
    const data = this.read();
    const filtered = data.filter(item => item.id !== id);
    this.write(filtered);
    return true;
  }
}

// Export database instances
module.exports = {
  ordersDb: new Database('orders'),
  deliveryExecutivesDb: new Database('delivery_executives'),
  trackingDb: new Database('tracking_logs'),
  ratingsDb: new Database('ratings'),
  execLinksDb: new Database('exec_links')
};
