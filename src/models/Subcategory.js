import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId, // refrence
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
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
    default: null // inhereit unless overriden
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
}, {
  timestamps: true
});

// unique subcategory names in 1 category
subcategorySchema.index({ category: 1, name: 1 }, { unique: true });
subcategorySchema.index({ is_active: 1 });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory