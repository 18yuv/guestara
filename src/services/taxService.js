export function getTaxForItem(item) {
  if (item.tax_applicable !== undefined && item.tax_applicable !== null) {
    return {
      applicable: item.tax_applicable,
      percentage: item.tax_percentage || 0
    };
  }

  if (item.subcategory) {
    const subcategory = item.subcategory;
    
    if (subcategory.tax_applicable !== undefined && subcategory.tax_applicable !== null) {
      return {
        applicable: subcategory.tax_applicable,
        percentage: subcategory.tax_percentage || 0
      };
    }

    if (subcategory.category) {
      return getCategoryTax(subcategory.category);
    }
  }

  if (item.category) {
    return getCategoryTax(item.category);
  }

  return {
    applicable: false,
    percentage: 0
  };
}

export function getCategoryTax(category) {
  if (!category) {
    return {
      applicable: false,
      percentage: 0
    };
  }

  return {
    applicable: category.tax_applicable || false,
    percentage: category.tax_percentage || 0
  };
}