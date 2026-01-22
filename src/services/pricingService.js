import { getTaxForItem } from './taxService.js';

class PricingService {
  
  calculatePrice(item, options = {}) {
    const { quantity = 1, time = new Date(), selectedAddons = [] } = options;
    
    let basePrice = 0;
    let discount = 0;
    let pricingRule = item.pricing_type;

    switch (item.pricing_type) {
      case 'static':
        basePrice = this.calculateStaticPrice(item.pricing_config);
        break;
      case 'tiered':
        basePrice = this.calculateTieredPrice(item.pricing_config, quantity);
        break;
      case 'complimentary':
        basePrice = 0;
        break;
      case 'discounted':
        const discounted = this.calculateDiscountedPrice(item.pricing_config);
        basePrice = discounted.base;
        discount = discounted.discount;
        break;
      case 'dynamic':
        basePrice = this.calculateDynamicPrice(item.pricing_config, time);
        break;
      default:
        throw new Error(`Unknown pricing type: ${item.pricing_type}`);
    }

    const addonsTotal = this.calculateAddonsPrice(selectedAddons);
    const subtotal = basePrice + addonsTotal;
    
    const tax = getTaxForItem(item);
    const taxAmount = tax.applicable ? (subtotal * tax.percentage) / 100 : 0;
    
    const grandTotal = subtotal + taxAmount;

    return {
      pricing_rule: pricingRule,
      base_price: basePrice,
      discount,
      addons_total: addonsTotal,
      subtotal,
      tax_applicable: tax.applicable,
      tax_percentage: tax.percentage,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      grand_total: parseFloat(grandTotal.toFixed(2)),
      final_price: parseFloat(grandTotal.toFixed(2))
    };
  }

  calculateStaticPrice(config) {
    if (!config || typeof config.price !== 'number') {
      throw new Error('Invalid static pricing configuration');
    }
    return config.price;
  }

  calculateTieredPrice(config, quantity) {
    if (!config || !Array.isArray(config.tiers) || config.tiers.length === 0) {
      throw new Error('Invalid tiered pricing configuration');
    }

    const sortedTiers = [...config.tiers].sort((a, b) => a.max_quantity - b.max_quantity);
    
    const tier = sortedTiers.find(t => quantity <= t.max_quantity);
    
    if (!tier) {
      return sortedTiers[sortedTiers.length - 1].price;
    }
    
    return tier.price;
  }

  calculateDiscountedPrice(config) {
    if (!config || typeof config.base_price !== 'number') {
      throw new Error('Invalid discounted pricing configuration');
    }

    const { base_price, discount_type, discount_value } = config;
    let discount = 0;

    if (discount_type === 'flat') {
      discount = discount_value;
    } else if (discount_type === 'percentage') {
      discount = (base_price * discount_value) / 100;
    }

    const finalPrice = Math.max(0, base_price - discount);
    
    return {
      base: finalPrice,
      discount
    };
  }

  calculateDynamicPrice(config, currentTime) {
    if (!config || !Array.isArray(config.windows) || config.windows.length === 0) {
      throw new Error('Invalid dynamic pricing configuration');
    }

    const currentTimeStr = this.formatTime(currentTime);
    
    const window = config.windows.find(w => {
      return currentTimeStr >= w.start_time && currentTimeStr < w.end_time;
    });

    if (!window) {
      throw new Error('Item not available at the current time');
    }

    return window.price;
  }

  calculateAddonsPrice(selectedAddons) {
    if (!Array.isArray(selectedAddons) || selectedAddons.length === 0) {
      return 0;
    }
    
    return selectedAddons.reduce((total, addon) => {
      return total + (addon.price || 0);
    }, 0);
  }

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

export default new PricingService();