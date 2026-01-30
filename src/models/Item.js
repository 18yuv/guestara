import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },

  is_mandatory: {
    type: Boolean,
    default: false
  },
  group: {
    type: String,
    trim: true
  }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  image: { type: String, trim: true },

  // both set as optional, validation below
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },

  pricing_type: {
    type: String,
    required: true,
    enum: ['static', 'tiered', 'complimentary', 'discounted', 'dynamic'] // pricing based on pre difined tags
  },
  pricing_config: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  tax_applicable: {
    type: Boolean,
    default: undefined
  },
  tax_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: undefined,
    required: function (){
        return this.tax_applicable === true; // true if tax applicable
    }
  },
  is_bookable: {
    type: Boolean,
    default: false
  },
  availability: {
    days: {
      type: [Number],
      validate: {
        validator: function(days) {
          return days.every(day => day >= 0 && day <= 6);
        },
        message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
      }
    },
    slots: [{
      start_time: String,
      end_time: String,
      _id: false
    }],
    _id: false
  },
  addons: [addonSchema],
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


// validation for only one category or subcategory
itemSchema.pre('validate', function () {
  if (this.category && this.subcategory) {
    throw new Error('Item cannot have both category and subcategory');
  }
  if (!this.category && !this.subcategory) {
    throw new Error('Item must have either category or subcategory');
  }
});

itemSchema.index({ category: 1, subcategory: 1, name: 1 }, { unique: true });
itemSchema.index({ is_active: 1 });
itemSchema.index({ pricing_type: 1 });

export default mongoose.model('Item', itemSchema);