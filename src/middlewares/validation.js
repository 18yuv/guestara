import Joi from 'joi';

const categorySchema = Joi.object({
  name: Joi.string().required().trim(),
  image: Joi.string().uri().optional(),
  description: Joi.string().optional(),
  tax_applicable: Joi.boolean().optional(),
  tax_percentage: Joi.number().min(0).max(100).when('tax_applicable', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  is_active: Joi.boolean().optional()
});

const subcategorySchema = Joi.object({
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  name: Joi.string().required().trim(),
  image: Joi.string().uri().optional(),
  description: Joi.string().optional(),
  tax_applicable: Joi.boolean().optional(),
  tax_percentage: Joi.number().min(0).max(100).optional(),
  is_active: Joi.boolean().optional()
});

const itemSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().optional(),
  image: Joi.string().uri().optional(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  subcategory: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  pricing_type: Joi.string().valid('static', 'tiered', 'complimentary', 'discounted', 'dynamic').required(),
  pricing_config: Joi.when('pricing_type', {
    switch: [
      {
        is: 'static',
        then: Joi.object({
          price: Joi.number().min(0).required()
        })
      },
      {
        is: 'tiered',
        then: Joi.object({
          tiers: Joi.array().items(
            Joi.object({
              max_quantity: Joi.number().min(1).required(),
              price: Joi.number().min(0).required()
            })
          ).min(1).required()
        })
      },
      {
        is: 'complimentary',
        then: Joi.object({
          description: Joi.string().optional()
        })
      },
      {
        is: 'discounted',
        then: Joi.object({
          base_price: Joi.number().min(0).required(),
          discount_type: Joi.string().valid('flat', 'percentage').required(),
          discount_value: Joi.number().min(0).required()
        })
      },
      {
        is: 'dynamic',
        then: Joi.object({
          windows: Joi.array().items(
            Joi.object({
              start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
              end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
              price: Joi.number().min(0).required()
            })
          ).min(1).required()
        })
      }
    ]
  }).required(),
  tax_applicable: Joi.boolean().optional(),
  tax_percentage: Joi.number().min(0).max(100).optional(),
  is_bookable: Joi.boolean().optional(),
  availability: Joi.when('is_bookable', {
    is: true,
    then: Joi.object({
      days: Joi.array().items(Joi.number().min(0).max(6)).min(1).required(),
      slots: Joi.array().items(
        Joi.object({
          start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
        })
      ).min(1).required()
    }),
    otherwise: Joi.optional()
  }),
  addons: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim(),
      price: Joi.number().min(0).required(),
      is_mandatory: Joi.boolean().optional(),
      group: Joi.string().optional()
    })
  ).optional(),
  is_active: Joi.boolean().optional()
}).custom((value, helpers) => {
  if (value.category && value.subcategory) {
    return helpers.error('custom.both_parent');
  }
  if (!value.category && !value.subcategory) {
    return helpers.error('custom.no_parent');
  }
  return value;
}).messages({
  'custom.both_parent': 'Item cannot have both category and subcategory',
  'custom.no_parent': 'Item must have either category or subcategory'
});

const bookingSchema = Joi.object({
  item: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  date: Joi.date().min('now').required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  user_name: Joi.string().required().trim(),
  user_email: Joi.string().email().required().trim().lowercase()
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

export const validateCategory = validate(categorySchema);
export const validateSubcategory = validate(subcategorySchema);
export const validateItem = validate(itemSchema);
export const validateBooking = validate(bookingSchema);