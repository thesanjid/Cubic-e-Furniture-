const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");

dotenv.config();
connectDB();

const categories = [
  { name: "Office Chairs" },
  { name: "Office Desks" },
  { name: "Sofas" },
  { name: "Storage & Cabinets" },
  { name: "Hospital & Metal Furniture" },
  { name: "Lockers & Racks" },
];

const importData = async () => {
  try {
    const admin = await User.findOneAndUpdate(
      { email: "admin@cubic.furniture" },
      { name: "Admin", email: "admin@cubic.furniture", password: "Admin@123", isAdmin: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(categories);

    console.log("Admin user:", admin.email, "(password: Admin@123)");
    console.log(`Seeded ${createdCategories.length} categories.`);
    console.log("Add products via the admin dashboard, then run again as needed.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    console.log("Data destroyed (products, categories, orders). Users kept.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
