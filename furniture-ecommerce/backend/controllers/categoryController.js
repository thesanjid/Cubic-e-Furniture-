const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const Product = require("../models/Product");

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const validateId = (id, res, label = "Category ID") => {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    fail(res, 400, `${label} is invalid`);
  }
};

const validateName = (name, res) => {
  if (typeof name !== "string" || !name.trim()) {
    fail(res, 400, "Please provide a category name");
  }

  return name.trim();
};

const validateImage = (image, res) => {
  if (typeof image !== "string") {
    fail(res, 400, "Image must be a string");
  }

  return image.trim();
};

const findCategory = async (id, res) => {
  validateId(id, res);

  const category = await Category.findById(id);

  if (!category) {
    fail(res, 404, "Category not found");
  }

  return category;
};

// Validate the parent and ensure its ancestry contains no cycles.
const resolveParent = async (parent, categoryId, res) => {
  if (parent === null || parent === "") {
    return null;
  }

  validateId(parent, res, "Parent category ID");

  const visited = new Set(
    categoryId ? [String(categoryId)] : []
  );

  let currentId = parent;

  while (currentId) {
    const key = String(currentId).toLowerCase();

    if (visited.has(key)) {
      fail(res, 400, "Category parent relationship would create a cycle");
    }

    visited.add(key);

    const ancestor = await Category.findById(currentId)
      .select("parent")
      .lean();

    if (!ancestor) {
      fail(res, 400, "Parent category or one of its ancestors does not exist");
    }

    currentId = ancestor.parent;
  }

  return parent;
};

const saveCategory = async (category, res) => {
  try {
    return await category.save();
  } catch (error) {
    if (error.code === 11000) {
      fail(res, 409, "A category with the same unique value already exists");
    }

    if (error.name === "ValidationError") {
      fail(res, 400, "Category data failed validation");
    }

    throw error;
  }
};

// @desc Get all categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });

  res.json(categories);
});

// @desc Get a category by slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (typeof slug !== "string" || !slug.trim()) {
    fail(res, 400, "Please provide a category slug");
  }

  const category = await Category.findOne({ slug: slug.trim() });

  if (!category) {
    fail(res, 404, "Category not found");
  }

  res.json(category);
});

// @desc Create a category
const createCategory = asyncHandler(async (req, res) => {
  const { name, image, parent } = req.body || {};

  const category = new Category({
    name: validateName(name, res),
    ...(image !== undefined && {
      image: validateImage(image, res),
    }),
    parent:
      parent === undefined
        ? null
        : await resolveParent(parent, null, res),
  });

  const createdCategory = await saveCategory(category, res);

  res.status(201).json(createdCategory);
});

// @desc Update a category
const updateCategory = asyncHandler(async (req, res) => {
  const category = await findCategory(req.params.id, res);
  const { name, image, parent } = req.body || {};

  if (name !== undefined) {
    category.name = validateName(name, res);
  }

  if (image !== undefined) {
    category.image = validateImage(image, res);
  }

  // Explicit null or "" removes the parent.
  if (parent !== undefined) {
    category.parent = await resolveParent(parent, category._id, res);
  }

  const updatedCategory = await saveCategory(category, res);

  res.json(updatedCategory);
});

// @desc Delete a category
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await findCategory(req.params.id, res);

  const [hasProducts, hasChildren] = await Promise.all([
    Product.exists({ category: category._id }),
    Category.exists({ parent: category._id }),
  ]);

  if (hasProducts) {
    fail(res, 400, "Cannot delete a category with existing products");
  }

  if (hasChildren) {
    fail(res, 400, "Cannot delete a category with existing subcategories");
  }

  await category.deleteOne();

  res.json({ message: "Category removed" });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
