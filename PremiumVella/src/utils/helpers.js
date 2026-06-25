export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export const getCategories = (products) => {
  const categories = products.map(p => p.category);
  return ['All', ...new Set(categories)];
};

export const filterProducts = (products, searchQuery, category) => {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });
};

export const applyDiscount = (total, discountCode) => {
  const discounts = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'WELCOME': 0.15,
    'SUMMER': 0.25,
  };
  return discounts[discountCode?.toUpperCase()] || 0;
};

export const validateCheckout = (formData) => {
  const errors = {};
  
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name is required (min 2 characters)';
  }
  
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.address || formData.address.trim().length < 5) {
    errors.address = 'Address is required (min 5 characters)';
  }
  
  if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
    errors.cardNumber = 'Valid 16-digit card number is required';
  }
  
  if (!formData.expiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiry)) {
    errors.expiry = 'Valid expiry date (MM/YY) is required';
  }
  
  if (!formData.cvv || formData.cvv.length < 3 || formData.cvv.length > 4) {
    errors.cvv = 'Valid CVV is required';
  }
  
  return errors;
};