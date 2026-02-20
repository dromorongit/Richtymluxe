/**
 * Rich Tym Luxe - Optimized JavaScript
 * Enhanced Mobile Experience | Performance Optimized
 */

// ========================================
// DOM Elements
// ========================================
const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const cartBtn = document.querySelector('.cart-btn');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartClose = document.querySelector('.cart-close');
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-content img');
const lightboxClose = document.querySelector('.lightbox-close');
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

// ========================================
// Cart System
// ========================================
let cart = [];
let products = [
  { id: 1, name: 'Unisex Premium Hoodie', price: 350, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', category: 'clothing' },
  { id: 2, name: 'Elegant Summer Dress', price: 280, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', category: 'clothing' },
  { id: 3, name: 'Classic White Shirt', price: 180, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', category: 'clothing' },
  { id: 4, name: 'Designer Jacket', price: 450, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', category: 'clothing' },
  { id: 5, name: 'Casual Blazer', price: 320, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', category: 'clothing' },
  { id: 6, name: 'Luxury Silk Top', price: 220, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400', category: 'clothing' }
];

// Initialize cart
function initCart() {
  try {
    const savedCart = localStorage.getItem('richtymluxe_cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartCount();
      renderCartItems();
    }
  } catch (e) {
    console.log('Cart initialization error:', e);
    cart = [];
  }
}

// Save cart
function saveCart() {
  try {
    localStorage.setItem('richtymluxe_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
  } catch (e) {
    console.log('Cart save error:', e);
  }
}

// Update cart count
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    openCart();
  }
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

// Update quantity
function updateQty(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
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

// Render cart items
function renderCartItems() {
  const cartItemsContainer = document.querySelector('.cart-items');
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
        <p>Your cart is empty</p>
      </div>
    `;
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>GH₵ ${item.price}</p>
        <div class="cart-item-qty">
          <span class="qty-btn" onclick="updateQty(${item.id}, -1)">-</span>
          <span>${item.qty}</span>
          <span class="qty-btn" onclick="updateQty(${item.id}, 1)">+</span>
        </div>
        <span class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</span>
      </div>
    </div>
  `).join('');

  const cartTotal = document.querySelector('.cart-total strong');
  if (cartTotal) {
    cartTotal.textContent = `GH₵ ${getCartTotal()}`;
  }
}

// Open cart
function openCart() {
  if (cartSidebar) cartSidebar.classList.add('active');
  if (cartOverlay) cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close cart
function closeCart() {
  if (cartSidebar) cartSidebar.classList.remove('active');
  if (cartOverlay) cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Send to WhatsApp
function sendToWhatsApp() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const phoneNumber = '0597705175';
  let message = `*🛒 New Order from Rich Tym Luxe*\n\n`;
  
  cart.forEach(item => {
    message += `• ${item.name} x${item.qty} = GH₵ ${item.price * item.qty}\n`;
  });
  
  message += `\n*Total: GH₵ ${getCartTotal()}*\n\n`;
  message += `--- Customer Details ---\n`;
  message += `Name: \n`;
  message += `Address: \n`;
  message += `Phone: `;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

// Paystack
function initPaystack() {
  const total = getCartTotal();
  if (total === 0) {
    alert('Your cart is empty!');
    return;
  }
  alert('Paystack integration requires a valid public key. Please configure your Paystack keys in main.js');
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

// Booking form
function submitBooking(event) {
  event.preventDefault();
  
  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }
  
  if (!validateForm('booking-form')) {
    alert('Please fill in all required fields');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Booking Request';
    }
    return;
  }

  const form = document.getElementById('booking-form');
  const formData = new FormData(form);
  
  const name = formData.get('name');
  const phone = formData.get('phone');
  const service = formData.get('service');
  const date = formData.get('date');
  const time = formData.get('time');
  const notes = formData.get('notes');

  let message = `*📅 New Booking Request*\n\n`;
  message += `*Name:* ${name}\n`;
  message += `*Phone:* ${phone}\n`;
  message += `*Service:* ${service}\n`;
  message += `*Date:* ${date}\n`;
  message += `*Time:* ${time}\n`;
  if (notes) message += `*Notes:* ${notes}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/0597705175?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
  
  // Show success message
  alert('Booking request sent! We will contact you shortly.');
  form.reset();
  
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Booking Request';
  }
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
  const whatsappUrl = `https://wa.me/0597705175?text=${encodedMessage}`;
  
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
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
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
  
  // Event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Navigation
  if (navToggle) {
    navToggle.addEventListener('click', toggleNav);
  }
  
  // Cart
  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }
  
  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }
  
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }
  
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
window.sendToWhatsApp = sendToWhatsApp;
window.initPaystack = initPaystack;
window.filterGallery = filterGallery;
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleNav = toggleNav;
window.closeNav = closeNav;
