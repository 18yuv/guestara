import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    trim: true,
    required: false
  },
  description: {
    type: String,
    trim: true,
    required: false
  },
  tax_applicable: {
    type: Boolean,
    default: false
  },
  tax_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
    required: function (){
        return this.tax_applicable === true; // true if tax applicable
    }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster queries
// helps for performance optimization
categorySchema.index({ is_active: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;