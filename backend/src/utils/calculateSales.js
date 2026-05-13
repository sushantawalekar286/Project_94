const calculateSales = (items = []) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

module.exports = calculateSales;
