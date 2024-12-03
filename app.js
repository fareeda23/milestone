// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');

// Initialize the app
const app = express();
app.use(bodyParser.json());

// In-memory data storage for menu items and orders
let menu = [];
let orders = [];

// Helper function to validate menu items
const validateMenuItem = (item) => {
  return (
    item.name && item.price > 0 && ['Main Course', 'Dessert', 'Beverage'].includes(item.category)
  );
};

// Routes for managing the menu
app.post('/menu', (req, res) => {
  const { name, price, category } = req.body;
  if (validateMenuItem(req.body)) {
    const newItem = { id: menu.length + 1, name, price, category };
    menu.push(newItem);
    res.status(201).send('Menu item added!');
  } else {
    res.status(400).send('Invalid menu item data');
  }
});

app.get('/menu', (req, res) => {
  res.json(menu);
});

// Routes for managing orders
app.post('/orders', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.some(itemId => !menu.find(m => m.id === itemId))) {
    return res.status(400).send('Invalid item IDs in order');
  }
  const newOrder = {
    id: orders.length + 1,
    items,
    status: 'Preparing',
  };
  orders.push(newOrder);
  res.status(201).send(`Order placed with ID: ${newOrder.id}`);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).send('Order not found');
  res.json(order);
});

// Automate order status updates using a cron job
cron.schedule('* * * * *', () => {
  orders.forEach(order => {
    if (order.status === 'Preparing') order.status = 'Out for Delivery';
    else if (order.status === 'Out for Delivery') order.status = 'Delivered';
  });
  console.log('Order statuses updated!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
