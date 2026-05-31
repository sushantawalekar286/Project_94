require("../utils/dnsHelper");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const CATEGORY_IDS = {
  NUGGETS: new mongoose.Types.ObjectId("6650be6014022a36b0cfa001"),
  BURGER: new mongoose.Types.ObjectId("6650be6014022a36b0cfa002"),
  MOMOS: new mongoose.Types.ObjectId("6650be6014022a36b0cfa003"),
  FRIES: new mongoose.Types.ObjectId("6650be6014022a36b0cfa004"),
  ROLES: new mongoose.Types.ObjectId("6650be6014022a36b0cfa005"),
  ICE_CREAM: new mongoose.Types.ObjectId("6650be6014022a36b0cfa006"),
  C_MAGIC: new mongoose.Types.ObjectId("6650be6014022a36b0cfa007"),
  HOT_COFFEE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa008"),
  MILK_SHAKE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa009"),
  PANEER_COURSE_RICE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa010"),
  PANEER_COURSE_NOODLE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa011"),
  CHICKEN_SPECIAL: new mongoose.Types.ObjectId("6650be6014022a36b0cfa012"),
  VEG_SOUP: new mongoose.Types.ObjectId("6650be6014022a36b0cfa013"),
  VEG_CHOPSUEY: new mongoose.Types.ObjectId("6650be6014022a36b0cfa014"),
  NON_VEG_SOUP: new mongoose.Types.ObjectId("6650be6014022a36b0cfa015"),
  NON_VEG_CHOPSUEY: new mongoose.Types.ObjectId("6650be6014022a36b0cfa016"),
  NON_VEG_COURSE_RICE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa017"),
  NON_VEG_COURSE_NOODLE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa018"),
  SANDWICH: new mongoose.Types.ObjectId("6650be6014022a36b0cfa019"),
  TOAST: new mongoose.Types.ObjectId("6650be6014022a36b0cfa020"),
  MOCKTAILS: new mongoose.Types.ObjectId("6650be6014022a36b0cfa021"),
  SPECIAL_PIZZA: new mongoose.Types.ObjectId("6650be6014022a36b0cfa022"),
  VEG_PIZZA: new mongoose.Types.ObjectId("6650be6014022a36b0cfa023"),
  MAGGIE: new mongoose.Types.ObjectId("6650be6014022a36b0cfa024"),
};

const CATEGORY_NAMES = {
  NUGGETS: "Nuggets",
  BURGER: "Burgers",
  MOMOS: "Momos",
  FRIES: "Fries",
  ROLES: "Rolls",
  ICE_CREAM: "Ice Cream",
  C_MAGIC: "Cold Coffee",
  HOT_COFFEE: "Hot Coffee",
  MILK_SHAKE: "Milkshakes",
  PANEER_COURSE_RICE: "Paneer Course (Rice)",
  PANEER_COURSE_NOODLE: "Paneer Course (Noodles)",
  CHICKEN_SPECIAL: "Chicken Special",
  VEG_SOUP: "Veg Soups",
  VEG_CHOPSUEY: "Veg Chopsuey",
  NON_VEG_SOUP: "Non-Veg Soups",
  NON_VEG_CHOPSUEY: "Non-Veg Chopsuey",
  NON_VEG_COURSE_RICE: "Non-Veg Course (Rice)",
  NON_VEG_COURSE_NOODLE: "Non-Veg Course (Noodles)",
  SANDWICH: "Sandwiches",
  TOAST: "Toasts",
  MOCKTAILS: "Mocktails",
  SPECIAL_PIZZA: "Special Pizzas",
  VEG_PIZZA: "Veg Pizzas",
  MAGGIE: "Maggie"
};

const menuData = [
  { name: "Cheese Corn Nuggets", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.NUGGETS, vegetarian: true },
  { name: "Potato Balls", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.NUGGETS, vegetarian: true },
  { name: "Cheese Potato Balls", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.NUGGETS, vegetarian: true },
  { name: "Veg. Cheese Nuggets", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.NUGGETS, vegetarian: true },

  { name: "Veg Burger", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.BURGER, vegetarian: true },
  { name: "Veg Cheese Burger", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.BURGER, vegetarian: true },
  { name: "Veg Double Pattee With Cheese", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.BURGER, vegetarian: true },
  { name: "Chicken Burger", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.BURGER, vegetarian: false },
  { name: "Chicken Cheese Burger", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.BURGER, vegetarian: false },
  { name: "Chicken Double Pattee With Cheese", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.BURGER, vegetarian: false },
  { name: "Paneer Burger", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.BURGER, vegetarian: true },
  { name: "Paneer Cheese Burger", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.BURGER, vegetarian: true },
  { name: "Paneer Double Pattee With Cheese", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.BURGER, vegetarian: true },

  { name: "Veg. Momos", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.MOMOS, vegetarian: true },
  { name: "Panner Momos", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.MOMOS, vegetarian: true },
  { name: "Non. Veg Momos", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.MOMOS, vegetarian: false },

  { name: "Plain Fries", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.FRIES, vegetarian: true },
  { name: "Masala Fries", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.FRIES, vegetarian: true },
  { name: "Perry Perry Fries", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.FRIES, vegetarian: true },
  { name: "Mayonnaise Fries", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.FRIES, vegetarian: true },
  { name: "Masala Cheese Fries", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.FRIES, vegetarian: true },

  { name: "Veg Roll", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.ROLES, vegetarian: true },
  { name: "Paneer Roll", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.ROLES, vegetarian: true },
  { name: "Egg Roll", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.ROLES, vegetarian: false },
  { name: "Chicken Roll", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.ROLES, vegetarian: false },
  { name: "Pizza Roll", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.ROLES, vegetarian: true, description: "Extra Cheese 20 rs charge extra" },

  { name: "Vanilla Ice Cream", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.ICE_CREAM, vegetarian: true },
  { name: "Mango Ice Cream", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.ICE_CREAM, vegetarian: true },
  { name: "Chocolate Ice Cream", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.ICE_CREAM, vegetarian: true },

  { name: "Cold Coffee", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "Cold Coffee with Crispy Chocolate", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "Cold Coffee With Chocolate", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "Cold Coffee With Ice Cream", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "Cold Coffee with Chocolate Ice cream", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "CAD - B", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "CAD - V", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },
  { name: "CAD - M", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.C_MAGIC, vegetarian: true },

  { name: "Hot Coffee", pricingType: "single", singlePrice: 30, category: CATEGORY_IDS.HOT_COFFEE, vegetarian: true },
  { name: "Coffee Mococcino", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.HOT_COFFEE, vegetarian: true },

  { name: "Rose Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Mango Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Butterscotch Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Chocolate Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Strawberry Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Blueberry Milk shake", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Oreo Milk shake", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },
  { name: "Kitkat Milk shake", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true },

  { name: "Paneer Thousand Rice", pricingType: "half-full", halfPrice: 130, fullPrice: 250, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Triple Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Manchurian Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Chilli Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Hongkong Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Schezwan Rice", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Garlic Rice", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },
  { name: "Paneer Fried Rice", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true },

  { name: "Paneer Thousand Noodles", pricingType: "half-full", halfPrice: 130, fullPrice: 250, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Triple Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Manchurian Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Chilli Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Hongkong Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Schezwan Noodles", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Garlic Noodles", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },
  { name: "Paneer Hakka Noodles", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true },

  { name: "Chicken Lollipop", pricingType: "half-full", halfPrice: 80, fullPrice: 160, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false },
  { name: "Chicken Lollipop Masala", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false },
  { name: "Chicken Chilli Dry", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false },
  { name: "Chicken Manchurian Dry", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false },
  { name: "Chicken 65 (100 gm)", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false },
  { name: "Pahadi 65 (100 gm)", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false },
  { name: "Gobi Manchurian Dry", pricingType: "half-full", halfPrice: 60, fullPrice: 120, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true },
  { name: "Paneer Manchurian", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true },
  { name: "Paneer Chilli", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true },
  { name: "Paneer 65 (100 gm)", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true },
  { name: "Fry Noodle (Time Pass)", pricingType: "single", singlePrice: 20, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true },

  { name: "Veg. 94 Chinese Sp. Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true },
  { name: "Veg. Manchurian Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true },
  { name: "Veg. Manchow Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true },
  { name: "Tomato Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true },
  { name: "Veg. American Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.VEG_CHOPSUEY, vegetarian: true },
  { name: "Veg. Schezwan Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.VEG_CHOPSUEY, vegetarian: true },

  { name: "Chi. 94 Chinese Sp. Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false },
  { name: "Chi. Manchurian Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false },
  { name: "Chi. Manchow Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false },
  { name: "Chicken Egg Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false },
  { name: "Chi. American Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_CHOPSUEY, vegetarian: false },
  { name: "Chi. Schezwan Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_CHOPSUEY, vegetarian: false },

  { name: "Chi. Thousand Rice", pricingType: "half-full", halfPrice: 120, fullPrice: 230, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Hongkong Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Triple Rice", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Manchurian Rice", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Chilli Rice", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Schezwan Rice", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Garlic Rice", pricingType: "half-full", halfPrice: 70, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },
  { name: "Chi. Fried Rice", pricingType: "half-full", halfPrice: 60, fullPrice: 120, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false },

  { name: "Chi. Thousand Noodles", pricingType: "half-full", halfPrice: 120, fullPrice: 230, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Hongkong Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Triple Noodles", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Manchurian Noodles", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Chilli Noodles", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Schezwan Noodles", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Garlic Noodles", pricingType: "half-full", halfPrice: 70, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Chi. Hakka Noodles", pricingType: "half-full", halfPrice: 60, fullPrice: 120, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false },
  { name: "Fry Noodle (Non-Veg Time Pass)", pricingType: "single", singlePrice: 20, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: true },

  { name: "Chocolate Sandwich", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.SANDWICH, vegetarian: true },
  { name: "Chocolate Cheese Sandwich", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.SANDWICH, vegetarian: true },
  { name: "Veg Sandwich", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.SANDWICH, vegetarian: true },
  { name: "Veg-Cheese Sandwich", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.SANDWICH, vegetarian: true },
  { name: "Paneer Sandwich", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.SANDWICH, vegetarian: true },
  { name: "Paneer - Cheese Sandwich", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.SANDWICH, vegetarian: true },
  { name: "94 Special Sandwich", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.SANDWICH, vegetarian: true },

  { name: "Chilli Cheese Toast", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.TOAST, vegetarian: true },
  { name: "Cheese Garlic Toast", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.TOAST, vegetarian: true },
  { name: "Cheese Corn Toast", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.TOAST, vegetarian: true },
  { name: "Paneer Toast", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.TOAST, vegetarian: true },
  { name: "Mix Veg Toast", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.TOAST, vegetarian: true },

  { name: "Blue Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true },
  { name: "Mint Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true },
  { name: "Orange Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true },
  { name: "Watermelon Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true },
  { name: "Vodaka Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true },

  { name: "94 Special Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "94 Special Pizza (Medium)", pricingType: "single", singlePrice: 160, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "94 Special Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  
  { name: "Plain Cheese Paneer Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Plain Cheese Paneer Pizza (Medium)", pricingType: "single", singlePrice: 160, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Plain Cheese Paneer Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },

  { name: "Veg- Cheese Panner Pizza (Mini)", pricingType: "single", singlePrice: 130, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Veg- Cheese Panner Pizza (Medium)", pricingType: "single", singlePrice: 170, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Veg- Cheese Panner Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },

  { name: "Paneer Tikka Pizza (Mini)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Paneer Tikka Pizza (Medium)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Paneer Tikka Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },

  { name: "Chicken Tikka Pizza (Mini)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: false },
  { name: "Chicken Tikka Pizza (Medium)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: false },
  { name: "Chicken Tikka Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: false },

  { name: "Jalapeno Pizza (Mini)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Jalapeno Pizza (Medium)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },
  { name: "Jalapeno Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true },

  { name: "Plain Cheese Pizza (Mini)", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Plain Cheese Pizza (Medium)", pricingType: "single", singlePrice: 130, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Plain Cheese Pizza (Large)", pricingType: "single", singlePrice: 170, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },

  { name: "Cheese Corn Pizza (Mini)", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Cheese Corn Pizza (Medium)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Cheese Corn Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },

  { name: "Spicy Pizza (Mini)", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Spicy Pizza (Medium)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Spicy Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },

  { name: "Plain Cheese Fries Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Plain Cheese Fries Pizza (Medium)", pricingType: "single", singlePrice: 150, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Plain Cheese Fries Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },

  { name: "Veg. Cheese Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Veg. Cheese Pizza (Medium)", pricingType: "single", singlePrice: 150, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Veg. Cheese Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },

  { name: "Paneer Cheese Pizza (Mini)", pricingType: "single", singlePrice: 130, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Paneer Cheese Pizza (Medium)", pricingType: "single", singlePrice: 170, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },
  { name: "Paneer Cheese Pizza (Large)", pricingType: "single", singlePrice: 190, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true },

  { name: "Plain Maggie", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.MAGGIE, vegetarian: true },
  { name: "Masala Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true },
  { name: "Veg. Mix Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true },
  { name: "Cheese Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true, description: "Extra Cheese 10 rs charge extra" },
  { name: "Panner Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true },
  { name: "Corn Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true },
  { name: "Chicken Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: false }
];

const seedMenu = async () => {
  // First seed categories using stable CATEGORY_IDS
  for (const [key, id] of Object.entries(CATEGORY_IDS)) {
    const name = CATEGORY_NAMES[key];
    await Category.findOneAndUpdate(
      { _id: id },
      { _id: id, name, description: `${name} selections`, isActive: true },
      { upsert: true, new: true }
    );
  }

  // Next seed menu items
  for (const item of menuData) {
    const imageVal = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";
    await MenuItem.findOneAndUpdate(
      { name: item.name },
      {
        name: item.name,
        category: item.category,
        pricingType: item.pricingType || "single",
        price: item.pricingType === "half-full" ? item.fullPrice : item.singlePrice,
        singlePrice: item.singlePrice ?? item.fullPrice ?? null,
        halfPrice: item.halfPrice ?? null,
        fullPrice: item.fullPrice ?? item.singlePrice ?? null,
        description: item.description || "Fresh and delicious",
        imageUrl: imageVal,
        image: imageVal,
        isAvailable: true,
        available: true,
        vegetarian: item.vegetarian ?? true
      },
      { upsert: true, new: true }
    );
  }
  console.log("✅ Categories and menu items seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedMenu())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedMenu;
