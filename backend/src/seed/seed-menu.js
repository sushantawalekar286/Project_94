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
  { name: "Cheese Corn Nuggets", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.NUGGETS, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgv5zDHusxuzCg1-xSS1IF-X6yv1o1qyd5kg&s" },
  { name: "Potato Balls", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.NUGGETS, vegetarian: true, imageUrl: "https://foodyschmoodyblog.com/mashed-potato-balls/" },
  { name: "Cheese Potato Balls", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.NUGGETS, vegetarian: true, imageUrl: "https://www.chilitochoc.com/potato-cheese-balls/" },
  { name: "Veg. Cheese Nuggets", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.NUGGETS, vegetarian: true, imageUrl: "https://recipes.timesofindia.com/recipes/veg-nuggets/rs84291091.cms" },

  { name: "Veg Burger", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.BURGER, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4w-ynXOW215H6Fq9JgODoL7hmfruy7NeAjg&s" },
  { name: "Veg Cheese Burger", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.BURGER, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgT2mh6gXWKq1Qs637JZ7IyfDYxa9FWq8gRQ&s" },
  { name: "Veg Double Pattee With Cheese", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.BURGER, vegetarian: true, imageUrl: "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2023/2/3/FNM_030123-Double-Patty-Veggie-Burgers_s4x3.jpg.rend.hgtvcom.1280.960.suffix/1675435333436.webp" },
  { name: "Chicken Burger", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.BURGER, vegetarian: false, imageUrl: "https://images.immediate.co.uk/production/volatile/sites/30/2025/04/Crispiest-buttermilk-fried-chicken-burgers-90854e5.jpg" },
  { name: "Chicken Cheese Burger", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.BURGER, vegetarian: false, imageUrl: "https://www.sargento.com/assets/Uploads/Recipe/Image/Burger-v2.jpg" },
  { name: "Chicken Double Pattee With Cheese", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.BURGER, vegetarian: false, imageUrl: "https://img.freepik.com/premium-photo/big-double-cheddar-cheeseburger-with-chicken-cutlet_147620-1306.jpg" },
  { name: "Paneer Burger", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.BURGER, vegetarian: true, imageUrl: "https://mcdonaldsblog.in/wp-content/uploads/2016/06/mcspicy-paneer-1-1.jpg" },
  { name: "Paneer Cheese Burger", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.BURGER, vegetarian: true, imageUrl: "https://cdn.uengage.io/uploads/18085/image-233973-1717587021.jpeg" },
  { name: "Paneer Double Pattee With Cheese", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.BURGER, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRou5IgkDjNAcQLxer5XeD82lWqTF9qZLP1BQ&s" },

  { name: "Veg. Momos", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.MOMOS, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkpon2-OM4lE9Q1kyJ59N0AKW7UqPVKHKHKQ&s" },
  { name: "Panner Momos", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.MOMOS, vegetarian: true, imageUrl: "https://5.imimg.com/data5/SELLER/Default/2024/6/430612403/LC/NH/XZ/67620679/momo-blog.jpg" },
  { name: "Non. Veg Momos", pricingType: "single", singlePrice: 110, category: CATEGORY_IDS.MOMOS, vegetarian: false, imageUrl: "https://meatington.com/cdn/shop/files/ChickenMomos.jpg?v=1709983319" },

  { name: "Plain Fries", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.FRIES, vegetarian: true, imageUrl: "https://www.sariyas.com/appadmin/uploads/crispy-french-fries-with-ketchup-mayonnaise.jpg" },
  { name: "Masala Fries", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.FRIES, vegetarian: true, imageUrl: "https://ministryofcurry.com/wp-content/uploads/2021/01/air-fryer-spicy-french-fries_-2.jpg" },
  { name: "Perry Perry Fries", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.FRIES, vegetarian: true, imageUrl: "https://images.jdmagicbox.com/quickquotes/images_main/wheat-flour-veg-garlic-noodles-ga1mq24c.jpg" },
  { name: "Mayonnaise Fries", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.FRIES, vegetarian: true, imageUrl: "https://i.pinimg.com/736x/3a/65/e8/3a65e87d53afc715133063166bdc73a2.jpg" },
  { name: "Masala Cheese Fries", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.FRIES, vegetarian: true, imageUrl: "https://thetableofspice.com/wp-content/uploads/2022/09/DSC_3426.jpg" },

  { name: "Veg Roll", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.ROLES, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1as8mqjlnJ-LvUHsd0VrH0sz0_b8PhkpeFA&s" },
  { name: "Paneer Roll", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.ROLES, vegetarian: true, imageUrl: "https://spicecravings.com/wp-content/uploads/2020/12/Paneer-kathi-Roll-Featured-1.jpg" },
  { name: "Egg Roll", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.ROLES, vegetarian: false, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCxUCesVocy2Sg4QAzy1Pk1ba9-_T3b35I5g&s" },
  { name: "Chicken Roll", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.ROLES, vegetarian: false, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXClat_CRywJpYR1RX0MogYSmVDFmL-GqQCA&s" },
  { name: "Pizza Roll", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.ROLES, vegetarian: true, description: "Extra Cheese 20 rs charge extra", imageUrl: "https://sugarspunrun.com/wp-content/uploads/2024/12/Pizza-Rolls-1-of-1.jpg" },

  { name: "Vanilla Ice Cream", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.ICE_CREAM, vegetarian: true, imageUrl: "https://delightfuladventures.com/wp-content/uploads/2024/09/vegan-vanilla-ice-cream-recipe.jpg" },
  { name: "Mango Ice Cream", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.ICE_CREAM, vegetarian: true, imageUrl: "https://spicecravings.com/wp-content/uploads/2021/06/Mango-Ice-Cream-9.jpg" },
  { name: "Chocolate Ice Cream", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.ICE_CREAM, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXFZ1fZmfeVgjHWJ9Re5R2FYEc_wwWlXV0tA&s" },

  { name: "Cold Coffee", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://www.cookwithmanali.com/wp-content/uploads/2022/04/Cold-Coffee-676x1024.jpg" },
  { name: "Cold Coffee with Crispy Chocolate", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://www.cadburydessertscorner.com/hubfs/dc-website-2022/articles/iced-coffee-chocolate-milkshake-with-pistachio-sprinkle/feature-image-iced-coffee-chocolate-milkshake-with-pistachio-sprinkle.webp" },
  { name: "Cold Coffee With Chocolate", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://recipesworld.co.uk/recipeDetail/69778https://arcticicedcoffee.co.uk/wp-content/uploads/2026/03/Social-Ideas-2026-03-23T144516.266.png" },
  { name: "Cold Coffee With Ice Cream", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://media.istockphoto.com/id/1151360590/photo/delicious-iced-coffe-with-ice-cream.jpg?s=612x612&w=0&k=20&c=Z5U-JtExJxdHirrIZa3CPtGQC3TN7X3B522o8_OA8qY=" },
  { name: "Cold Coffee with Chocolate Ice cream", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAlBFTeHq5aXAwEqwIXlN9m_2nMMPpH4UV5w&s" },
  { name: "CAD - B", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS8okLES0ohDFtYKYh6tC8TAz4Kp0g4MSoEg&s" },
  { name: "CAD - V", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://media-cdn.tripadvisor.com/media/photo-p/12/91/75/06/cad-m-cad-b.jpg" },
  { name: "CAD - M", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.C_MAGIC, vegetarian: true, imageUrl: "https://media-cdn.tripadvisor.com/media/photo-p/12/91/75/06/cad-m-cad-b.jpg" },

  { name: "Hot Coffee", pricingType: "single", singlePrice: 30, category: CATEGORY_IDS.HOT_COFFEE, vegetarian: true, imageUrl: "https://t3.ftcdn.net/jpg/05/34/82/24/360_F_534822425_9Ok2L60rSndeunIM6sELPKvuDqzhopX7.jpg" },
  { name: "Coffee Mococcino", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.HOT_COFFEE, vegetarian: true, imageUrl: "https://storage.cornercoffeestore.com/2021/02/what-is-mocha.jpg" },

  { name: "Rose Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Mango Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Butterscotch Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Chocolate Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Strawberry Milk Shake", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Blueberry Milk shake", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Oreo Milk shake", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },
  { name: "Kitkat Milk shake", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.MILK_SHAKE, vegetarian: true, imageUrl: "" },

  { name: "Paneer Thousand Rice", pricingType: "half-full", halfPrice: 130, fullPrice: 250, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://www.indianveggiedelight.com/wp-content/uploads/2023/09/paneer-fried-rice-featured.jpg" },
  { name: "Paneer Triple Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHiUxku3gnATmkIV1c1dedX-Ae0Gc2Y2xNKw&s" },
  { name: "Paneer Manchurian Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://www.shutterstock.com/image-photo/indian-street-food-paneer-manchurian-260nw-2594793733.jpg" },
  { name: "Paneer Chilli Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://someindiangirl.com/wp-content/uploads/2021/12/Chilli-Paneer-Fried-Rice-9-of-19-500x500.jpg" },
  { name: "Paneer Hongkong Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/paneer-fried-rice-recipe.jpg" },
  { name: "Paneer Schezwan Rice", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://yumtumbhojana.com/wp-content/uploads/2018/04/schezwan-paneer-fried-rice.jpeg" },
  { name: "Paneer Garlic Rice", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/paneer-fried-rice-recipe.jpg" },
  { name: "Paneer Fried Rice", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.PANEER_COURSE_RICE, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz_pFVDwlSuhkvb_wgQy7YYxOhS-b0hGnn4w&s" },

  { name: "Paneer Thousand Noodles", pricingType: "half-full", halfPrice: 130, fullPrice: 250, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/paneer-fried-rice.jpg" },
  { name: "Paneer Triple Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/paneer-fried-rice.jpg" },
  { name: "Paneer Manchurian Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQcwkuPw9JqnyasLhojf7UAVQipJ8gDg-ddZEjUXSGQ&s" },
  { name: "Paneer Chilli Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://www.jcookingodyssey.com/wp-content/uploads/2025/11/chilli-paneer-noodles.jpg" },
  { name: "Paneer Hongkong Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://www.cookwithmanali.com/wp-content/uploads/2014/11/Hakka-Noodles-1.jpg" },
  { name: "Paneer Schezwan Noodles", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/paneer-fried-rice.jpg" },
  { name: "Paneer Garlic Noodles", pricingType: "half-full", halfPrice: 80, fullPrice: 150, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://www.jcookingodyssey.com/wp-content/uploads/2025/11/chilli-paneer-noodles.jpg" },
  { name: "Paneer Hakka Noodles", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.PANEER_COURSE_NOODLE, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHjh01eRET2UcWxED8iKbcN_sRpCK9TwVKxPP_JZduPQ&s" },

  { name: "Chicken Lollipop", pricingType: "half-full", halfPrice: 80, fullPrice: 160, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false, imageUrl: "https://lh3.googleusercontent.com/proxy/3M5fKmqCsyKjF6vxj75sFkYj29l2DoKJWbBFGph1eBeygd59_flsuVtof6fZVbiO_sB4a0Wz63Nrb0qKLt1q-8zg-t5LYWcBQA" },
  { name: "Chicken Lollipop Masala", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false, imageUrl: "https://www.awesomecuisine.com/wp-content/uploads/2020/09/chicken-lollipop-masala.jpg" },
  { name: "Chicken Chilli Dry", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVCFdeVLUs0J-sqwV83wl7_8xnUMhb0uKWwg&s" },
  { name: "Chicken Manchurian Dry", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false, imageUrl: "https://www.kannammacooks.com/wp-content/uploads/chicken-manchurian-recipe-dry-restaurant-style-1.jpg" },
  { name: "Chicken 65 (100 gm)", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxLUylpXSB7u85LFAYqTeMTc1SBAuH-YKJ_Q&s" },
  { name: "Pahadi 65 (100 gm)", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: false, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoX8j2CnJ2mlVXSqgf6WksSQbS3hAj8AgiGQ&s" },
  { name: "Gobi Manchurian Dry", pricingType: "half-full", halfPrice: 60, fullPrice: 120, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-m30_nlDK2EMxy3D0iEds3iY_YjfQXR1twg&s" },
  { name: "Paneer Manchurian", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToLrutX-KFajf0OMxOdL97QxZ3KZSv9WJraw&s" },
  { name: "Paneer Chilli", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true, imageUrl: "https://www.cookwithmanali.com/wp-content/uploads/2016/01/Chilli-Paneer-Restaurant-Style.jpg" },
  { name: "Paneer 65 (100 gm)", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true, imageUrl: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/2/paneer_65.webp?updatedAt=1730797786263" },
  { name: "Fry Noodle (Time Pass)", pricingType: "single", singlePrice: 20, category: CATEGORY_IDS.CHICKEN_SPECIAL, vegetarian: true, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuMAIQCKNdVrYcOADRh4qoYExwCx5NajIb1Q&s" },

  { name: "Veg. 94 Chinese Sp. Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true, imageUrl: "" },
  { name: "Veg. Manchurian Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true, imageUrl: "" },
  { name: "Veg. Manchow Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true, imageUrl: "" },
  { name: "Tomato Soup", pricingType: "half-full", halfPrice: 40, fullPrice: null, category: CATEGORY_IDS.VEG_SOUP, vegetarian: true, imageUrl: "" },
  { name: "Veg. American Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.VEG_CHOPSUEY, vegetarian: true, imageUrl: "" },
  { name: "Veg. Schezwan Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.VEG_CHOPSUEY, vegetarian: true, imageUrl: "" },

  { name: "Chi. 94 Chinese Sp. Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false, imageUrl: "" },
  { name: "Chi. Manchurian Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false, imageUrl: "" },
  { name: "Chi. Manchow Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false, imageUrl: "" },
  { name: "Chicken Egg Soup", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.NON_VEG_SOUP, vegetarian: false, imageUrl: "" },
  { name: "Chi. American Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_CHOPSUEY, vegetarian: false, imageUrl: "" },
  { name: "Chi. Schezwan Chopsuey", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_CHOPSUEY, vegetarian: false, imageUrl: "" },

  { name: "Chi. Thousand Rice", pricingType: "half-full", halfPrice: 120, fullPrice: 230, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Hongkong Rice", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Triple Rice", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Manchurian Rice", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Chilli Rice", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Schezwan Rice", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Garlic Rice", pricingType: "half-full", halfPrice: 70, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Fried Rice", pricingType: "half-full", halfPrice: 60, fullPrice: 120, category: CATEGORY_IDS.NON_VEG_COURSE_RICE, vegetarian: false, imageUrl: "" },

  { name: "Chi. Thousand Noodles", pricingType: "half-full", halfPrice: 120, fullPrice: 230, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Hongkong Noodles", pricingType: "half-full", halfPrice: 100, fullPrice: 200, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Triple Noodles", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Manchurian Noodles", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Chilli Noodles", pricingType: "half-full", halfPrice: 90, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Schezwan Noodles", pricingType: "half-full", halfPrice: 70, fullPrice: 140, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Garlic Noodles", pricingType: "half-full", halfPrice: 70, fullPrice: 180, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Chi. Hakka Noodles", pricingType: "half-full", halfPrice: 60, fullPrice: 120, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: false, imageUrl: "" },
  { name: "Fry Noodle (Non-Veg Time Pass)", pricingType: "single", singlePrice: 20, category: CATEGORY_IDS.NON_VEG_COURSE_NOODLE, vegetarian: true, imageUrl: "" },

  { name: "Chocolate Sandwich", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },
  { name: "Chocolate Cheese Sandwich", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },
  { name: "Veg Sandwich", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },
  { name: "Veg-Cheese Sandwich", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },
  { name: "Paneer Sandwich", pricingType: "single", singlePrice: 70, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },
  { name: "Paneer - Cheese Sandwich", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },
  { name: "94 Special Sandwich", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.SANDWICH, vegetarian: true, imageUrl: "" },

  { name: "Chilli Cheese Toast", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.TOAST, vegetarian: true, imageUrl: "" },
  { name: "Cheese Garlic Toast", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.TOAST, vegetarian: true, imageUrl: "" },
  { name: "Cheese Corn Toast", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.TOAST, vegetarian: true, imageUrl: "" },
  { name: "Paneer Toast", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.TOAST, vegetarian: true, imageUrl: "" },
  { name: "Mix Veg Toast", pricingType: "single", singlePrice: 60, category: CATEGORY_IDS.TOAST, vegetarian: true, imageUrl: "" },

  { name: "Blue Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true, imageUrl: "" },
  { name: "Mint Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true, imageUrl: "" },
  { name: "Orange Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true, imageUrl: "" },
  { name: "Watermelon Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true, imageUrl: "" },
  { name: "Vodaka Mojito", pricingType: "single", singlePrice: 80, category: CATEGORY_IDS.MOCKTAILS, vegetarian: true, imageUrl: "" },

  { name: "94 Special Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "94 Special Pizza (Medium)", pricingType: "single", singlePrice: 160, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "94 Special Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  
  { name: "Plain Cheese Paneer Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Plain Cheese Paneer Pizza (Medium)", pricingType: "single", singlePrice: 160, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Plain Cheese Paneer Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Veg- Cheese Panner Pizza (Mini)", pricingType: "single", singlePrice: 130, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Veg- Cheese Panner Pizza (Medium)", pricingType: "single", singlePrice: 170, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Veg- Cheese Panner Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Paneer Tikka Pizza (Mini)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Paneer Tikka Pizza (Medium)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Paneer Tikka Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Chicken Tikka Pizza (Mini)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: false, imageUrl: "" },
  { name: "Chicken Tikka Pizza (Medium)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: false, imageUrl: "" },
  { name: "Chicken Tikka Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: false, imageUrl: "" },

  { name: "Jalapeno Pizza (Mini)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Jalapeno Pizza (Medium)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Jalapeno Pizza (Large)", pricingType: "single", singlePrice: 200, category: CATEGORY_IDS.SPECIAL_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Plain Cheese Pizza (Mini)", pricingType: "single", singlePrice: 90, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Plain Cheese Pizza (Medium)", pricingType: "single", singlePrice: 130, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Plain Cheese Pizza (Large)", pricingType: "single", singlePrice: 170, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Cheese Corn Pizza (Mini)", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Cheese Corn Pizza (Medium)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Cheese Corn Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Spicy Pizza (Mini)", pricingType: "single", singlePrice: 100, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Spicy Pizza (Medium)", pricingType: "single", singlePrice: 140, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Spicy Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Plain Cheese Fries Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Plain Cheese Fries Pizza (Medium)", pricingType: "single", singlePrice: 150, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Plain Cheese Fries Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Veg. Cheese Pizza (Mini)", pricingType: "single", singlePrice: 120, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Veg. Cheese Pizza (Medium)", pricingType: "single", singlePrice: 150, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Veg. Cheese Pizza (Large)", pricingType: "single", singlePrice: 180, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Paneer Cheese Pizza (Mini)", pricingType: "single", singlePrice: 130, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Paneer Cheese Pizza (Medium)", pricingType: "single", singlePrice: 170, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },
  { name: "Paneer Cheese Pizza (Large)", pricingType: "single", singlePrice: 190, category: CATEGORY_IDS.VEG_PIZZA, vegetarian: true, imageUrl: "" },

  { name: "Plain Maggie", pricingType: "single", singlePrice: 40, category: CATEGORY_IDS.MAGGIE, vegetarian: true, imageUrl: "" },
  { name: "Masala Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true, imageUrl: "" },
  { name: "Veg. Mix Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true, imageUrl: "" },
  { name: "Cheese Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true, description: "Extra Cheese 10 rs charge extra", imageUrl: "" },
  { name: "Panner Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true, imageUrl: "" },
  { name: "Corn Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: true, imageUrl: "" },
  { name: "Chicken Maggie", pricingType: "single", singlePrice: 50, category: CATEGORY_IDS.MAGGIE, vegetarian: false, imageUrl: "" }
];

const seedMenu = async () => {
  const CHINESE_EXACT_NAMES = [
    "Momos", "Paneer Course (Rice)", "Paneer Course (Noodles)", 
    "Chicken Special", "Veg Soups", "Veg Chopsuey", "Non-Veg Soups", 
    "Non-Veg Chopsuey", "Non-Veg Course (Rice)", "Non-Veg Course (Noodles)"
  ];

  // First seed categories using stable CATEGORY_IDS
  for (const [key, id] of Object.entries(CATEGORY_IDS)) {
    const name = CATEGORY_NAMES[key];
    const isChinese = CHINESE_EXACT_NAMES.includes(name);
    await Category.findOneAndUpdate(
      { _id: id },
      { 
        _id: id, 
        name, 
        description: `${name} selections`, 
        menuType: isChinese ? "chinese" : "cafe",
        isActive: true 
      },
      { upsert: true, new: true }
    );
  }

  // Next seed menu items
  for (const item of menuData) {
    const imageVal = item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";
    
    // Infer dietaryType
    let dType = "veg";
    const lowercaseName = item.name.toLowerCase();
    if (
      lowercaseName.includes("chicken") ||
      lowercaseName.includes("chi.") ||
      lowercaseName.includes("non. veg") ||
      lowercaseName.includes("non-veg") ||
      lowercaseName.includes("lollipop")
    ) {
      dType = "non-veg";
    } else if (lowercaseName.includes("egg")) {
      dType = "egg";
    } else if (item.vegetarian === false) {
      dType = "non-veg";
    }

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
        vegetarian: item.vegetarian ?? true,
        dietaryType: dType
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
