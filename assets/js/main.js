/**
 * Rich Tym Luxe - Optimized JavaScript
 * Enhanced Mobile Experience | Performance Optimized
 */

// ========================================
// API Configuration
// ========================================
const API_BASE = 'https://richtymluxe-production.up.railway.app/api';

// ========================================
// Paystack Configuration
// ========================================
const PAYSTACK_DEFAULT_EMAIL = 'payments@richtymluxe.com';

// ========================================
// DOM Elements
// ========================================
const header = document.querySelector('.header');
const cartBtn = document.querySelector('.cart-btn');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartClose = document.querySelector('.cart-close');
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// ========================================
// Cart System
// ========================================
let cart = [];
let products = [];

 // Initialize cart
  function initCart() {
    try {
      const savedCart = localStorage.getItem('richTymCart');
      if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('Cart loaded from localStorage:', cart);
        updateCartCount();
        renderCartPageItems();
        renderCheckoutSummary();
      }
      
      // Load saved customer details
      const savedCustomer = localStorage.getItem('richtymluxe_customer');
      if (savedCustomer) {
        const customer = JSON.parse(savedCustomer);
        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('customer-phone');
        const addressInput = document.getElementById('customer-address');
        
        if (nameInput) nameInput.value = customer.name || '';
        if (phoneInput) phoneInput.value = customer.phone || '';
        if (addressInput) addressInput.value = customer.address || '';
      }
    } catch (e) {
      console.log('Cart initialization error:', e);
      cart = [];
    }
    
    // Always render cart summary and items in case cart is empty or we need to update UI
    renderCartPageItems();
    renderCheckoutSummary();
  }

// ========================================
// Product Fetching from API
// ========================================
async function fetchProducts(type = 'boutique') {
  console.log('fetchProducts called with type:', type);
  try {
    // Add timestamp to prevent caching issues
    const cacheBust = Date.now();
    const url = `${API_BASE}/products/${type}?t=${cacheBust}`;
    console.log('Fetching URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (response.ok || response.status === 304) {
      const data = await response.json();
      console.log('Products received:', data.length, data);
      return data;
    }
    
    console.log('Returning empty array - response not OK');
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

function renderProductCard(product) {
  const priceDisplay = product.salesPrice 
    ? `<span>GH₵ ${product.salesPrice}</span>${product.originalPrice ? `<span class="original-price">GH₵ ${product.originalPrice}</span>` : ''}`
    : product.originalPrice 
      ? `<span>GH₵ ${product.originalPrice}</span>`
      : '<span>Contact for price</span>';

  let badges = '';
  if (product.discountPercentage > 0) {
    badges += `<span class="product-badge">Sale -${product.discountPercentage}%</span>`;
  }
  if (product.isNew) {
    badges += `<span class="product-badge">New</span>`;
  }
  if (product.isBestseller) {
    badges += `<span class="product-badge">Best Seller</span>`;
  }

  const imageUrl = product.coverImage || 'assets/images/placeholder.jpg';

  return `
    <div class="product-card fade-in" data-product-id="${product._id}">
      <div class="product-image">
        <img src="${imageUrl}" alt="${product.productName}" loading="lazy">
        ${badges}
      </div>
      <div class="product-info">
        <h3>${product.productName}</h3>
        <p class="product-price">${priceDisplay}</p>
        <button class="product-btn" onclick="addProductToCart('${product._id}')">Add to Cart</button>
      </div>
    </div>
  `;
}

function addProductToCart(productId) {
  const product = products.find(p => String(p._id) === String(productId));
  if (product) {
    const price = product.salesPrice || product.originalPrice || 0;
    const cartProduct = {
      id: product._id,
      productName: product.productName,
      productType: 'boutique', // Default for shop.html products
      category: product.category || 'Unisex Fashion', // Default category
      coverImage: product.coverImage || '',
      originalPrice: product.originalPrice || 0,
      salesPrice: product.salesPrice || null,
      finalPrice: price,
      quantity: 1,
      selectedStorage: null,
      selectedColor: null
    };
    const existingItem = cart.find(item => String(item.id) === String(productId));
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push(cartProduct);
    }
    saveCart();
    // Show toast notification
    if (typeof showToast === 'function') {
      showToast('Product added to cart successfully.', true);
    }
  }
}

async function loadProductsToPage(productType) {
  console.log('loadProductsToPage called with:', productType);
  
  // Try multiple ways to find the container
  let container = document.getElementById('product-container');
  
  if (!container) {
    console.log('Container not found by ID, searching by class...');
    container = document.querySelector('.shop-grid');
  }
  
  if (!container) {
    console.log('ERROR: No product container found in DOM!');
    console.log('Looking for elements with product-container or shop-grid...');
    console.log('All divs:', document.querySelectorAll('div'));
    return;
  }

  console.log('Container found:', container);
  container.innerHTML = '<div class="loading" style="padding:20px;text-align:center;">Loading products...</div>';

  products = await fetchProducts(productType);
   window.products = products; // Make products globally accessible
   console.log('loadProductsToPage - products length:', products.length);

  if (products.length === 0) {
    container.innerHTML = '<div class="no-products" style="padding:40px;text-align:center;">No products available. Check back soon!</div>';
    return;
  }

  // Render products with inline styles for debugging
  container.innerHTML = products.map(product => renderProductCard(product)).join('');
  
  // Force display
  container.style.display = 'grid';
  
  console.log('Products rendered to DOM. Container HTML length:', container.innerHTML.length);
}

  // Save cart
  function saveCart() {
  try {
    localStorage.setItem('richTymCart', JSON.stringify(cart));
    
    // Save customer details
    const customerDetails = {
      name: document.getElementById('customer-name')?.value || '',
      phone: document.getElementById('customer-phone')?.value || '',
      address: document.getElementById('customer-address')?.value || ''
    };
    localStorage.setItem('richtymluxe_customer', JSON.stringify(customerDetails));
    
    updateCartCount();
    // renderCartItems() - removed (mini cart disabled)
    renderCartPageItems();
    renderCheckoutSummary();
  } catch (e) {
    console.log('Cart save error:', e);
  }
}

  // Render cart items for cart page
  function renderCartPageItems() {
    const cartItemsList = document.getElementById('cartItemsList');
    const summaryItemsList = document.getElementById('summaryItemsList');
    const cartItemsCount = document.getElementById('cartItemsCount');
    
    if (!cartItemsList && !summaryItemsList) return;
    
    if (cart.length === 0) {
      if (cartItemsList) {
        cartItemsList.innerHTML = `
          <div class="empty-cart-state">
            <div class="empty-cart-icon">
              <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <div class="empty-cart-actions">
              <a href="shop.html" class="btn btn-primary">Shop Now</a>
              <a href="mobile-phones.html" class="btn btn-secondary">Browse Phones</a>
            </div>
          </div>
        `;
      }
      if (cartItemsCount) {
        cartItemsCount.textContent = '0 items';
      }
      if (summaryItemsList) {
        summaryItemsList.innerHTML = '<p style="text-align:center;color:var(--gray);">No items in cart</p>';
      }
      updateCartSummary(0, 0, 0);
      return;
    }
    
     // Render cart items list
     if (cartItemsList) {
       cartItemsList.innerHTML = cart.map((item, index) => `
         <div class="cart-item-card" data-index="${index}">
           <div class="cart-item-image">
             <img src="${item.coverImage || 'assets/images/Richtymluxe.PNG'}" alt="${item.productName}" loading="lazy">
           </div>
           <div class="cart-item-details">
             <h4 class="cart-item-name">${item.productName}</h4>
             ${item.category ? `<p class="cart-item-category">${item.category}</p>` : ''}
             ${item.selectedStorage || item.selectedColor ? `
               <div class="cart-item-variants">
                 ${item.selectedStorage ? `<span class="cart-item-variant">${item.selectedStorage}</span>` : ''}
                 ${item.selectedColor ? `<span class="cart-item-variant">${item.selectedColor}</span>` : ''}
               </div>
             ` : ''}
             <div class="cart-item-price-row">
               <span class="cart-item-price">GH₵ ${item.finalPrice}</span>
               ${item.originalPrice && item.originalPrice > item.finalPrice ? `
                 <span class="cart-item-original-price">GH₵ ${item.originalPrice}</span>
                 <span class="cart-item-discount-badge">-${Math.round((1 - item.finalPrice/item.originalPrice) * 100)}%</span>
               ` : ''}
             </div>
             <div class="cart-item-quantity">
               <button class="cart-qty-btn" onclick="updateCartItemQty(${index}, -1)" aria-label="Decrease quantity">-</button>
               <span class="cart-qty-value">${item.quantity}</span>
               <button class="cart-qty-btn" onclick="updateCartItemQty(${index}, 1)" aria-label="Increase quantity">+</button>
             </div>
           </div>
           <div class="cart-item-remove">
             <span class="cart-item-line-total">Line Total: <strong>GH₵ ${(item.finalPrice * item.quantity).toFixed(2)}</strong></span>
             <button class="remove-item-btn" onclick="removeCartItem(${index})" aria-label="Remove item">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M6 18L18 6M6 6l12 12"/>
               </svg>
               Remove
             </button>
           </div>
         </div>
       `).join('');
     }
    
     // Render summary items
     if (summaryItemsList) {
       summaryItemsList.innerHTML = cart.map(item => `
         <div class="summary-item">
           <span class="summary-item-name">${item.productName} ${item.selectedStorage ? `(${item.selectedStorage})` : ''} ${item.selectedColor ? `(${item.selectedColor})` : ''}</span>
           <span class="summary-item-qty">x${item.quantity}</span>
           <span class="summary-item-price">GH₵ ${(item.finalPrice * item.quantity).toFixed(2)}</span>
         </div>
       `).join('');
     }
    
     // Update count
     if (cartItemsCount) {
       const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
       cartItemsCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
     }
    
   // Update summary
     const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
     const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
     updateCartSummary(subtotal, totalQty, subtotal);
  }

   // Update cart item quantity
   function updateCartItemQty(index, change) {
     if (index >= 0 && index < cart.length) {
       cart[index].quantity += change;
       if (cart[index].quantity <= 0) {
         cart.splice(index, 1);
       }
       saveCart();
     }
   }

  // Remove cart item
  function removeCartItem(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart();
    }
  }

  // Clear cart
  function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to clear your cart?')) {
      cart = [];
      saveCart();
    }
  }

  // Update cart summary
  function updateCartSummary(subtotal, quantity, total) {
    const subtotalEl = document.getElementById('summarySubtotal');
    const quantityEl = document.getElementById('summaryQuantity');
    const totalEl = document.getElementById('summaryTotal');
    const checkoutSubtotalEl = document.getElementById('checkoutSubtotal');
    const checkoutQuantityEl = document.getElementById('checkoutQuantity');
    const checkoutTotalEl = document.getElementById('checkoutTotal');
    
    if (subtotalEl) subtotalEl.textContent = `GH₵ ${subtotal.toFixed(2)}`;
    if (quantityEl) quantityEl.textContent = quantity;
    if (totalEl) totalEl.textContent = `GH₵ ${total.toFixed(2)}`;
    if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = `GH₵ ${subtotal.toFixed(2)}`;
    if (checkoutQuantityEl) checkoutQuantityEl.textContent = quantity;
    if (checkoutTotalEl) checkoutTotalEl.textContent = `GH₵ ${total.toFixed(2)}`;
  }

  // Render checkout summary
  function renderCheckoutSummary() {
    const summaryItemsList = document.getElementById('checkoutSummaryItems');
    if (!summaryItemsList) return;
    
    if (cart.length === 0) {
      summaryItemsList.innerHTML = '<p style="text-align:center;color:var(--gray);">No items in cart</p>';
      updateCartSummary(0, 0, 0);
      return;
    }
    
    summaryItemsList.innerHTML = cart.map(item => `
      <div class="summary-item">
        <span class="summary-item-name">${item.productName} ${item.selectedStorage ? `(${item.selectedStorage})` : ''} ${item.selectedColor ? `(${item.selectedColor})` : ''}</span>
        <span class="summary-item-qty">x${item.quantity}</span>
        <span class="summary-item-price">GH₵ ${(item.finalPrice * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartSummary(subtotal, totalQty, subtotal);
  }

   // Update cart count
   function updateCartCount() {
     const cartCount = document.querySelector('.cart-count');
     if (cartCount) {
       const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
       cartCount.textContent = totalItems;
       cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
     }
   }

// Show toast notification
function showToast(message = 'Product added to cart successfully.', showViewCart = true) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  
  const toastMessage = toast.querySelector('.toast-message');
  const continueBtn = toast.querySelector('.continue-shopping');
  const viewCartBtn = toast.querySelector('.view-cart');
  
  if (toastMessage) toastMessage.textContent = message;
  if (viewCartBtn) viewCartBtn.style.display = showViewCart ? 'block' : 'none';
  
  toast.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
  
  // Continue shopping button closes toast
  if (continueBtn) {
    continueBtn.onclick = () => toast.classList.remove('show');
  }
  // View Cart button navigates to cart page
  if (viewCartBtn) {
    viewCartBtn.onclick = () => {
      window.location.href = 'cart.html';
    };
  }
}

// Add to cart
function addToCart(productId) {
  const product = products.find(p => String(p.id) === String(productId));
  if (product) {
    const price = product.salesPrice || product.originalPrice || 0;
    const cartProduct = {
      id: product._id,
      productName: product.productName,
      productType: 'boutique', // Default for shop.html products
      category: product.category || 'Unisex Fashion', // Default category
      coverImage: product.coverImage || '',
      originalPrice: product.originalPrice || 0,
      salesPrice: product.salesPrice || null,
      finalPrice: price,
      quantity: 1,
      selectedStorage: null,
      selectedColor: null
    };
    const existingItem = cart.find(item => String(item.id) === String(productId));
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push(cartProduct);
    }
    saveCart();
    // Show toast notification
    if (typeof showToast === 'function') {
      showToast('Product added to cart successfully.', true);
    }
  }
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart();
}

// Update quantity
function updateQty(productId, change) {
  const item = cart.find(item => String(item.id) === String(productId));
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
    }
  }
}

// Get cart total
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// Render cart items (mini cart) - DISABLED - using main cart page only
function renderCartItems() {
  // Mini cart removed - function disabled
}

// Open cart - DISABLED (mini cart removed)
function openCart() {
  // No operation - mini cart removed
}

// Close cart - DISABLED
function closeCart() {
  // Mini cart removed - function disabled
}

// Paystack Product Payment
function initPaystack() {
  const total = getCartTotal();
  if (total === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Get customer details
  const customerName = document.getElementById('customer-name')?.value.trim();
  const customerPhone = document.getElementById('customer-phone')?.value.trim();
  const customerAddress = document.getElementById('customer-address')?.value.trim();

  // Validate customer details
  if (!customerName || !customerPhone || !customerAddress) {
    alert('Please fill in your name, phone number, and delivery address!');
    return;
  }

  // Prepare payment data
  const paymentData = {
    amount: total,
    paymentType: 'product',
    customerDetails: {
      name: customerName,
      phone: customerPhone,
      address: customerAddress
    },
    items: cart.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.qty,
      price: item.price
    })),
    email: PAYSTACK_DEFAULT_EMAIL
  };

  // Show loading
  const paystackBtn = document.querySelector('.cart-paystack-btn');
  if (paystackBtn) {
    paystackBtn.disabled = true;
    paystackBtn.textContent = 'Processing...';
  }

  // Initialize payment with backend
  fetch(`${API_BASE}/payments/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.paystack.authorization_url) {
      // Redirect to Paystack
      window.location.href = data.paystack.authorization_url;
    } else {
      throw new Error(data.message || 'Payment initialization failed');
    }
  })
  .catch(error => {
    console.error('Payment error:', error);
    alert('Payment initialization failed. Please try again.');

    // Reset button
    if (paystackBtn) {
      paystackBtn.disabled = false;
      paystackBtn.textContent = 'Pay with Paystack';
    }
  });
}

// Paystack Service Payment (for booking)
function initServicePayment(serviceData) {
  // Show loading
  const submitBtn = document.querySelector('#booking-form button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Payment...';
  }

  const paymentData = {
    amount: serviceData.amount || 0, // Service amount should be defined
    paymentType: 'service',
    customerDetails: {
      name: serviceData.name,
      phone: serviceData.phone,
      email: serviceData.email || `${serviceData.phone}@temp.com`
    },
    serviceDetails: {
      service: serviceData.service,
      date: serviceData.date,
      time: serviceData.time,
      notes: serviceData.notes
    },
    email: serviceData.email || `${serviceData.phone}@temp.com`
  };

  fetch(`${API_BASE}/payments/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.paystack.authorization_url) {
      // Redirect to Paystack
      window.location.href = data.paystack.authorization_url;
    } else {
      throw new Error(data.message || 'Payment initialization failed');
    }
  })
  .catch(error => {
    console.error('Payment error:', error);
    alert('Payment initialization failed. Please try again.');

    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay with Paystack & Book Appointment';
    }
  });
}

// ========================================
// Navigation
// ========================================
function toggleNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle) navToggle.classList.toggle('active');
  if (navMenu) navMenu.classList.toggle('active');
}

function closeNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle) navToggle.classList.remove('active');
  if (navMenu) navMenu.classList.remove('active');
}

// ========================================
// Gallery
// ========================================
function openLightbox(imageSrc) {
  if (lightbox && lightboxImg) {
    lightboxImg.src = imageSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  if (lightbox) lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function filterGallery(category) {
  if (!galleryItems) return;
  
  galleryItems.forEach(item => {
    const shouldShow = category === 'all' || item.dataset.category === category;
    if (shouldShow) {
      item.style.display = 'block';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      }, 50);
    } else {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.9)';
      setTimeout(() => {
        item.style.display = 'none';
      }, 200);
    }
  });
}

// ========================================
// Forms
// ========================================
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'red';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  return isValid;
}

// Pay with Paystack for booking
function payWithPaystack() {
  const form = document.getElementById('booking-form');
  if (!validateForm('booking-form')) {
    alert('Please fill in all required fields');
    return;
  }

  const formData = new FormData(form);

  const serviceData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    service: formData.get('service'),
    date: formData.get('date'),
    time: formData.get('time'),
    notes: formData.get('notes'),
    amount: parseFloat(formData.get('paymentAmount')) || 0,
    email: PAYSTACK_DEFAULT_EMAIL
  };

  if (serviceData.amount <= 0) {
    alert('Please enter a valid service amount');
    return;
  }

  initServicePayment(serviceData);
}

// Contact form
function submitContact(event) {
  event.preventDefault();
  
  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }
  
  if (!validateForm('contact-form')) {
    alert('Please fill in all required fields');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
    return;
  }

  const form = document.getElementById('contact-form');
  const formData = new FormData(form);
  
  const name = formData.get('name');
  const email = formData.get('email');
  const subject = formData.get('subject');
  const message = formData.get('message');

  let whatsappMessage = `*📩 New Contact Message*\n\n`;
  whatsappMessage += `*Name:* ${name}\n`;
  whatsappMessage += `*Email:* ${email}\n`;
  whatsappMessage += `*Subject:* ${subject}\n`;
  whatsappMessage += `*Message:* ${message}`;

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/233597705175?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
  
  alert('Message sent! We will get back to you soon.');
  form.reset();
  
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
}

// ========================================
// Scroll Effects
// ========================================
function handleScroll() {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
}

// ========================================
// Animations
// ========================================
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  
  if (fadeElements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

// Smooth scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Active nav link
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize functions
  initCart();
  initScrollAnimations();
  initSmoothScroll();
  setActiveNavLink();
  
  // Render cart page items if on cart page
  if (document.getElementById('cartItemsList')) {
    renderCartPageItems();
  }
  // Render checkout summary if on checkout page
  if (document.getElementById('checkoutSummaryItems')) {
    renderCheckoutSummary();
  }
  
  // Check for Paystack payment callback
  checkPaymentCallback();
  
  // Event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Note: Navigation toggle uses inline onclick in HTML
  // Cart button is now a direct link to cart.html, no JS needed
  // Mini cart removed - no event listeners attached
  
  // Lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Gallery filters
  if (filterBtns) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterGallery(this.dataset.filter);
      });
    });
  }

  // Gallery items
  if (galleryItems) {
    galleryItems.forEach(item => {
      item.addEventListener('click', function() {
        const img = this.querySelector('img');
        if (img) {
          openLightbox(img.src);
        }
      });
    });
  }

  // Booking form
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', submitBooking);
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', submitContact);
  }

  // Render cart/checkout pages on load
  if (document.getElementById('cartItemsList')) {
    renderCartPageItems();
  }
  if (document.getElementById('checkoutSummaryItems')) {
    renderCheckoutSummary();
  }

  // Close nav when clicking outside
  document.addEventListener('click', function(e) {
    if (navMenu && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && (!navToggle || !navToggle.contains(e.target))) {
        closeNav();
      }
    }
  });

  // Close on nav link click (mobile)
  if (navMenu) {
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeNav();
        }
      });
    });
  }

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeCart();
      closeLightbox();
      closeNav();
    }
  });

  // Prevent double tap zoom on buttons
  document.querySelectorAll('.btn, .product-btn, .filter-btn, .nav-toggle').forEach(btn => {
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.click();
    });
  });
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.initPaystack = initPaystack;
window.initServicePayment = initServicePayment;
// Generate unique payment reference
  function generatePaymentReference() {
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 8); // YYYYMMDD
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RTL-${timestamp}-${randomString}`;
  }

// Process Paystack payment for checkout
  function processPaystackPayment() {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Validate customer details
    const fullName = document.getElementById('fullName')?.value.trim();
    const phoneNumber = document.getElementById('phoneNumber')?.value.trim();
    const whatsappNumber = document.getElementById('whatsappNumber')?.value.trim();
    const location = document.getElementById('location')?.value.trim();
    const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked')?.value;
    const additionalNotes = document.getElementById('additionalNotes')?.value.trim();

    if (!fullName || !phoneNumber || !whatsappNumber || !location || !deliveryOption) {
      alert('Please fill in all required fields!');
      // Highlight empty fields
      if (!fullName) document.getElementById('fullName').classList.add('error');
      if (!phoneNumber) document.getElementById('phoneNumber').classList.add('error');
      if (!whatsappNumber) document.getElementById('whatsappNumber').classList.add('error');
      if (!location) document.getElementById('location').classList.add('error');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[^\d]/g, ''))) {
      alert('Please enter a valid phone number (10-15 digits)');
      document.getElementById('phoneNumber').classList.add('error');
      return;
    }

    if (!phoneRegex.test(whatsappNumber.replace(/[^\d]/g, ''))) {
      alert('Please enter a valid WhatsApp number (10-15 digits)');
      document.getElementById('whatsappNumber').classList.add('error');
      return;
    }

    const grandTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const email = document.getElementById('emailAddress')?.value.trim() || PAYSTACK_DEFAULT_EMAIL;

    // Show processing status
    const paystackBtn = document.getElementById('paystackPaymentBtn');
    const paymentStatus = document.getElementById('paymentStatus');
    const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
    const backToCartBtn = document.getElementById('backToCartBtn');

    if (paystackBtn) {
      paystackBtn.disabled = true;
      paystackBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--accent);animation:spin 1s linear infinite">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.2"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"/>
        </svg>
        Processing...
      `;
    }

    if (paymentStatus) {
      paymentStatus.className = 'payment-status processing';
      paymentStatus.querySelector('#paymentStatusTitle').textContent = 'Processing Payment';
      paymentStatus.querySelector('#paymentStatusMessage').textContent = 'Redirecting to Paystack...';
      paymentStatus.style.display = 'block';
    }

    // Generate unique payment reference
    const paymentReference = generatePaymentReference();
    
    // Prepare payment data
    const paymentData = {
      reference: paymentReference,
      amount: grandTotal,
      paymentType: 'product',
      customerDetails: {
        name: fullName,
        phone: phoneNumber,
        email: email,
        address: location
      },
      items: cart.map(item => ({
        productId: item.id,
        productName: item.productName,
        productType: item.productType || 'boutique',
        category: item.category || '',
        quantity: item.quantity,
        price: item.finalPrice,
        selectedStorage: item.selectedStorage || '',
        selectedColor: item.selectedColor || ''
      })),
      deliveryOption: deliveryOption,
      additionalNotes: additionalNotes || '',
      email: email
    };

    // Initialize Paystack payment via backend
    fetch(`${API_BASE}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.paystack.authorization_url) {
        // Store order data in localStorage for after payment
        const orderData = {
          ...paymentData,
          paystackReference: data.paystack.reference,
          paymentId: data.payment._id,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('richtymluxe_pending_order', JSON.stringify(orderData));
        
        // Redirect to Paystack
        window.location.href = data.paystack.authorization_url;
      } else {
        throw new Error(data.message || 'Payment initialization failed');
      }
    })
    .catch(error => {
      console.error('Payment error:', error);
      
      if (paystackBtn) {
        paystackBtn.disabled = false;
        paystackBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          Pay with Paystack
        `;
      }
      
      if (paymentStatus) {
        paymentStatus.className = 'payment-status error';
        paymentStatus.querySelector('#paymentStatusTitle').textContent = 'Payment Failed';
        paymentStatus.querySelector('#paymentStatusMessage').textContent = error.message || 'Payment initialization failed. Please try again.';
        paymentStatus.style.display = 'block';
      }
      
      if (backToCartBtn) {
        backToCartBtn.style.display = 'block';
      }
    });
  }

  // Submit WhatsApp order after successful payment
  function submitWhatsAppOrder() {
    const pendingOrder = localStorage.getItem('richtymluxe_pending_order');
    
    if (!pendingOrder) {
      alert('No pending order found. Please complete payment first.');
      return;
    }

    const orderData = JSON.parse(pendingOrder);
    
    // Verify payment was successful
    if (orderData.status !== 'success') {
      alert('Payment not verified. Please complete payment first.');
      return;
    }

    const { customerDetails, items, deliveryOption, additionalNotes, paystackReference, reference } = orderData;
    const grandTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Build WhatsApp message
    let message = `*🛍️ New Paid Order - Rich Tym Luxe*\n\n`;
    message += `*Order Reference:* ${reference || 'N/A'}\n`;
    message += `*Paystack Reference:* ${paystackReference || 'N/A'}\n\n`;
    
    message += `*Customer Details:*\n`;
    message += `Name: ${customerDetails.name}\n`;
    message += `Phone: ${customerDetails.phone}\n`;
    message += `WhatsApp: ${customerDetails.phone}\n`;
    message += `Email: ${customerDetails.email || 'N/A'}\n`;
    message += `Delivery/Pickup: ${deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}\n`;
    message += `Location/Address: ${customerDetails.address}\n\n`;
    
    message += `*Products Ordered:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName}\n`;
      if (item.selectedStorage) message += `   Storage: ${item.selectedStorage}\n`;
      if (item.selectedColor) message += `   Color: ${item.selectedColor}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Unit Price: GH₵ ${item.price}\n`;
      message += `   Line Total: GH₵ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `*Grand Total: GH₵ ${grandTotal.toFixed(2)}*\n\n`;
    
    if (additionalNotes) {
      message += `*Additional Notes:*\n${additionalNotes}\n\n`;
    }
    
    message += `*Payment Method:* Paystack (Online Payment)\n`;
    message += `*Payment Status:* ✅ Paid\n`;

    const encodedMessage = encodeURIComponent(message);
    
    // Get selected WhatsApp number from checkout form
    const selectedNumberRadio = document.querySelector('input[name="selectedWhatsAppNumber"]:checked');
    const whatsappNumber = selectedNumberRadio ? selectedNumberRadio.value : '233503390421';
    
    // Open WhatsApp with selected number
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Show success message
    const paymentStatus = document.getElementById('paymentStatus');
    if (paymentStatus) {
      paymentStatus.className = 'payment-status success';
      paymentStatus.querySelector('#paymentStatusTitle').textContent = 'Order Submitted!';
      paymentStatus.querySelector('#paymentStatusMessage').textContent = 'WhatsApp message opened. Please complete your order submission.';
      paymentStatus.style.display = 'block';
    }
    
    // Hide WhatsApp button, show back to cart
    const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
    const backToCartBtn = document.getElementById('backToCartBtn');
    if (whatsappOrderBtn) whatsappOrderBtn.style.display = 'none';
    if (backToCartBtn) backToCartBtn.style.display = 'block';
    
    // Clear cart and pending order after successful submission
    setTimeout(() => {
      cart = [];
      saveCart();
      localStorage.removeItem('richtymluxe_pending_order');
    }, 2000);
  }

  // Check for successful Paystack payment callback on page load
  function checkPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const status = urlParams.get('status');
    
    if (reference && status === 'success') {
      // Verify payment with backend
      fetch(`${API_BASE}/payments/verify/${reference}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.payment) {
            // Update pending order status
            const pendingOrder = localStorage.getItem('richtymluxe_pending_order');
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              orderData.status = 'success';
              orderData.paystackReference = reference;
              orderData.paymentVerified = true;
              localStorage.setItem('richtymluxe_pending_order', JSON.stringify(orderData));
              
              // Show success state
              const paymentStatus = document.getElementById('paymentStatus');
              const paystackBtn = document.getElementById('paystackPaymentBtn');
              const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
              const backToCartBtn = document.getElementById('backToCartBtn');
              const whatsappNumberSelector = document.getElementById('whatsappNumberSelector');
              
              if (paymentStatus) {
                paymentStatus.className = 'payment-status success';
                paymentStatus.querySelector('#paymentStatusTitle').textContent = 'Payment Successful!';
                paymentStatus.querySelector('#paymentStatusMessage').textContent = 'Your payment has been verified. Click below to submit your order via WhatsApp.';
                paymentStatus.style.display = 'block';
              }
              
              if (paystackBtn) paystackBtn.style.display = 'none';
              if (whatsappOrderBtn) whatsappOrderBtn.style.display = 'flex';
              if (backToCartBtn) backToCartBtn.style.display = 'none';
              if (whatsappNumberSelector) whatsappNumberSelector.style.display = 'block';
            }
          }
        })
        .catch(error => {
          console.error('Payment verification error:', error);
        });
    }
  }

  // Make functions globally available
   window.addToCart = addToCart;
   window.removeFromCart = removeFromCart;
   window.updateQty = updateQty;
   window.initPaystack = initPaystack;
   window.initServicePayment = initServicePayment;
   window.payWithPaystack = payWithPaystack;
   window.filterGallery = filterGallery;
   window.toggleNav = toggleNav;
   window.closeNav = closeNav;
   window.addProductToCart = addProductToCart;
   window.loadProductsToPage = loadProductsToPage;
   window.fetchProducts = fetchProducts;
   window.updateCartItemQty = updateCartItemQty;
   window.removeCartItem = removeCartItem;
   window.clearCart = clearCart;
   window.processPaystackPayment = processPaystackPayment;
   window.submitWhatsAppOrder = submitWhatsAppOrder;
   window.checkPaymentCallback = checkPaymentCallback;
   window.renderProductCard = renderProductCard;

    // Initialize cart and render checkout summary on DOM load
    document.addEventListener('DOMContentLoaded', function() {
        initCart();
        renderCheckoutSummary();
        initDeliveryPickupToggle();
    });

    // Initialize delivery/pickup toggle functionality
    function initDeliveryPickupToggle() {
        const deliveryOptionRadios = document.querySelectorAll('input[name="deliveryOption"]');
        const locationField = document.getElementById('location');
        const locationLabel = document.querySelector('label[for="location"]');
        
        if (!deliveryOptionRadios.length || !locationField) return;

        // Function to update field state based on selected option
        function updateLocationFieldState() {
            const isPickup = document.querySelector('input[name="deliveryOption"][value="pickup"]:checked');
            
            if (isPickup) {
                // For pickup, make location field optional and change placeholder
                locationField.removeAttribute('required');
                locationField.placeholder = 'Enter your pickup location (optional)';
                if (locationLabel) {
                    locationLabel.innerHTML = 'Location / Pickup Location <span class="required">*</span>';
                }
            } else {
                // For delivery, make location field required
                locationField.setAttribute('required', '');
                locationField.placeholder = 'Enter your delivery address';
                if (locationLabel) {
                    locationLabel.innerHTML = 'Location / Delivery Address <span class="required">*</span>';
                }
            }
        }

        // Add event listeners to delivery option radios
        deliveryOptionRadios.forEach(radio => {
            radio.addEventListener('change', updateLocationFieldState);
        });

        // Initialize state on page load
        updateLocationFieldState();
    }
