const mongoose = require("mongoose");
const slugify = require("slugify");

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Category name must produce a valid slug"],
      unique: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate the slug and validate the parent before saving.
categorySchema.pre("validate", function () {
  if (typeof this.name === "string") {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  // Handle both populated and unpopulated parent references.
  const parentId = this.parent?._id ?? this.parent;

  if (parentId && this._id && this._id.equals(parentId)) {
    this.invalidate(
      "parent",
      "A category cannot be its own parent"
    );
  }
});

module.exports =
  mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
