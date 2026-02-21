// Rich Tym Luxe Admin Dashboard JavaScript

const API_BASE = '/api';

// State
let currentUser = null;
let products = [];
let currentPage = 1;
let totalPages = 1;
let editingProductId = null;
let deleteProductId = null;
let additionalImages = [];

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const productsTableBody = document.getElementById('productsTableBody');
const searchInput = document.getElementById('searchInput');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const coverImagePreview = document.getElementById('coverImagePreview');
const coverImageInput = document.getElementById('coverImage');
const coverImagePath = document.getElementById('coverImagePath');
const additionalImagesPreview = document.getElementById('additionalImagesPreview');
const addAdditionalImageBtn = document.getElementById('addAdditionalImage');
const additionalImagesInput = document.getElementById('additionalImages');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        try {
            const response = await fetch(`${API_BASE}/admin/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data;
                showDashboard();
            } else {
                localStorage.removeItem('adminToken');
                showLogin();
            }
        } catch (error) {
            showLogin();
        }
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 500));
    
    // Add product
    addProductBtn.addEventListener('click', () => openProductModal());
    
    // Product type change - update categories
    document.getElementById('productType').addEventListener('change', function() {
        updateCategoryOptions(this.value);
    });
    
    // Mobile sidebar toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
        });
    }
    
    // Close sidebar via overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Close sidebar via button
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        });
    }
    
    // Modal controls
    closeModal.addEventListener('click', closeProductModal);
    cancelBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });
    
    // Delete modal
    cancelDelete.addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
    confirmDelete.addEventListener('click', handleDelete);
    
    // Form submit
    productForm.addEventListener('submit', handleProductSubmit);
    
    // Image uploads
    coverImageInput.addEventListener('change', handleCoverImageUpload);
    addAdditionalImageBtn.addEventListener('click', () => additionalImagesInput.click());
    additionalImagesInput.addEventListener('change', handleAdditionalImagesUpload);
    
    // Mobile menu
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            handleNavigation(view);
        });
    });
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            currentUser = data;
            showDashboard();
            showToast('Welcome back!', 'success');
            loginForm.reset();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('adminToken');
    currentUser = null;
    showLogin();
    showToast('Logged out successfully', 'success');
}

// Show login screen
function showLogin() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    document.getElementById('adminName').textContent = currentUser.fullName || currentUser.username;
    loadProducts();
}

// Load products
async function loadProducts(page = 1, search = '') {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
        let url = `${API_BASE}/products/admin/all?page=${page}&limit=10`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            products = data.products;
            currentPage = data.currentPage;
            totalPages = data.totalPages;
            renderProductsTable();
            renderPagination();
        } else {
            showToast(data.message || 'Failed to load products', 'error');
        }
    } catch (error) {
        showToast('An error occurred while loading products', 'error');
    }
}

// Render products table
function renderProductsTable() {
    productsTableBody.innerHTML = '';
    
    if (products.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No products found. Add your first product!
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Image
        const imageHtml = product.coverImage 
            ? `<img src="${product.coverImage}" alt="${product.productName}" class="product-image">`
            : `<div class="product-image-placeholder"><i class="fas fa-image"></i></div>`;
        
        // Price
        let priceHtml = '';
        if (product.originalPrice && product.salesPrice) {
            priceHtml = `
                <div class="price-info">
                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                    <span class="sales-price">$${product.salesPrice.toFixed(2)}</span>
                </div>
            `;
        } else if (product.salesPrice) {
            priceHtml = `<span class="sales-price">$${product.salesPrice.toFixed(2)}</span>`;
        } else if (product.originalPrice) {
            priceHtml = `<span class="sales-price">$${product.originalPrice.toFixed(2)}</span>`;
        } else {
            priceHtml = '<span class="sales-price">-</span>';
        }
        
        // Stock
        let stockClass = 'in-stock';
        let stockText = product.stockQuantity;
        if (product.stockQuantity === 0) {
            stockClass = 'out-of-stock';
            stockText = 'Out of Stock';
        } else if (product.stockQuantity < 5) {
            stockClass = 'low-stock';
            stockText = `Low Stock (${product.stockQuantity})`;
        }
        
        // Badges
        let badgesHtml = '';
        if (product.discountPercentage > 0) {
            badgesHtml += `<span class="badge sale">-${product.discountPercentage}%</span>`;
        }
        if (product.isNew) {
            badgesHtml += `<span class="badge new">New</span>`;
        }
        if (product.isBestseller) {
            badgesHtml += `<span class="badge bestseller">Bestseller</span>`;
        }
        
        row.innerHTML = `
            <td>${imageHtml}</td>
            <td class="product-name">${product.productName}</td>
            <td><span class="product-type ${product.productType}">${product.productType}</span></td>
            <td>${priceHtml}</td>
            <td><span class="stock-badge ${stockClass}">${stockText}</span></td>
            <td>${badgesHtml || '-'}</td>
            <td class="actions">
                <button class="action-btn edit" onclick="editProduct('${product._id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteProduct('${product._id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        productsTableBody.appendChild(row);
    });
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => loadProducts(currentPage - 1, searchInput.value);
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => loadProducts(i, searchInput.value);
        pagination.appendChild(btn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => loadProducts(currentPage + 1, searchInput.value);
    pagination.appendChild(nextBtn);
}

// Search handler
function handleSearch(e) {
    const search = e.target.value;
    loadProducts(1, search);
}

// Open product modal
function openProductModal(product = null) {
    editingProductId = product ? product._id : null;
    modalTitle.textContent = product ? 'Edit Product' : 'Add New Product';
    
    // Reset form
    productForm.reset();
    coverImagePreview.innerHTML = '<i class="fas fa-image"></i><span>Click to upload</span>';
    coverImagePreview.classList.remove('has-image');
    coverImagePath.value = '';
    additionalImages = [];
    additionalImagesPreview.innerHTML = '';
    
    // Initialize category options based on default product type
    updateCategoryOptions('boutique');
    
    if (product) {
        // Fill form with product data
        document.getElementById('productName').value = product.productName;
        document.getElementById('shortDescription').value = product.shortDescription;
        document.getElementById('longDescription').value = product.longDescription || '';
        document.getElementById('productType').value = product.productType;
        updateCategoryOptions(product.productType); // Update categories based on type
        document.getElementById('originalPrice').value = product.originalPrice || '';
        document.getElementById('salesPrice').value = product.salesPrice || '';
        document.getElementById('stockQuantity').value = product.stockQuantity || 0;
        document.getElementById('category').value = product.category || '';
        document.getElementById('isNew').checked = product.isNew;
        document.getElementById('isBestseller').checked = product.isBestseller;
        
        // Cover image
        if (product.coverImage) {
            coverImagePath.value = product.coverImage;
            coverImagePreview.innerHTML = `<img src="${product.coverImage}" alt="Cover">`;
            coverImagePreview.classList.add('has-image');
        }
        
        // Additional images
        if (product.additionalImages && product.additionalImages.length > 0) {
            additionalImages = [...product.additionalImages];
            additionalImages.forEach((img, index) => {
                addAdditionalImageToPreview(img, index);
            });
        }
    }
    
    productModal.classList.add('active');
}

// Close product modal
function closeProductModal() {
    productModal.classList.remove('active');
    editingProductId = null;
}

// Update category options based on product type
function updateCategoryOptions(productType) {
    const categorySelect = document.getElementById('category');
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    let categories = [];
    
    if (productType === 'mobile') {
        // Mobile Phone categories
        categories = [
            'Smartphones',
            'Feature Phones',
            'Tablets',
            'Laptops',
            'Smartwatches',
            'Fitness Trackers',
            'Phone Cases',
            'Phone Chargers',
            'Power Banks',
            'Screen Protectors',
            'Earphones & Headphones',
            'Phone Mounts',
            'USB Cables',
            'Memory Cards',
            'Bluetooth Speakers'
        ];
    } else {
        // Boutique categories (default)
        categories = [
            'Dresses',
            'Tops',
            'Skirts',
            'Pants',
            'Jackets',
            'Shoes',
            'Bags',
            'Accessories',
            'Jewelry',
            'Watches',
            'Sunglasses',
            'Handbags',
            'Clutches',
            'Belts',
            'Scarves'
        ];
    }
    
    // Add categories to select
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// Edit product
window.editProduct = function(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        openProductModal(product);
    }
};

// Delete product - open modal
window.deleteProduct = function(productId) {
    deleteProductId = productId;
    deleteModal.classList.add('active');
};

// Close delete modal
function closeDeleteModal() {
    deleteModal.classList.remove('active');
    deleteProductId = null;
};

// Handle delete
async function handleDelete() {
    if (!deleteProductId) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`${API_BASE}/products/${deleteProductId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showToast('Product deleted successfully', 'success');
            closeDeleteModal();
            loadProducts(currentPage, searchInput.value);
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        showToast('An error occurred', 'error');
    }
};

// Handle product form submit
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    const formData = {
        productName: document.getElementById('productName').value,
        shortDescription: document.getElementById('shortDescription').value,
        longDescription: document.getElementById('longDescription').value,
        productType: document.getElementById('productType').value,
        originalPrice: document.getElementById('originalPrice').value ? parseFloat(document.getElementById('originalPrice').value) : undefined,
        salesPrice: document.getElementById('salesPrice').value ? parseFloat(document.getElementById('salesPrice').value) : undefined,
        stockQuantity: document.getElementById('stockQuantity').value ? parseInt(document.getElementById('stockQuantity').value) : 0,
        category: document.getElementById('category').value,
        isNew: document.getElementById('isNew').checked,
        isBestseller: document.getElementById('isBestseller').checked,
        coverImage: coverImagePath.value,
        additionalImages: additionalImages
    };
    
    try {
        const url = editingProductId 
            ? `${API_BASE}/products/${editingProductId}`
            : `${API_BASE}/products`;
        
        const response = await fetch(url, {
            method: editingProductId ? 'PUT' : 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(editingProductId ? 'Product updated successfully' : 'Product created successfully', 'success');
            closeProductModal();
            loadProducts(currentPage, searchInput.value);
        } else {
            showToast(data.message || 'Failed to save product', 'error');
        }
    } catch (error) {
        showToast('An error occurred', 'error');
    }
};

// Handle cover image upload
async function handleCoverImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            coverImagePath.value = data.filePath;
            coverImagePreview.innerHTML = `<img src="${data.filePath}" alt="Cover">`;
            coverImagePreview.classList.add('has-image');
        } else {
            showToast(data.message || 'Failed to upload image', 'error');
        }
    } catch (error) {
        showToast('Failed to upload image', 'error');
    }
}

// Handle additional images upload
async function handleAdditionalImagesUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                additionalImages.push(data.filePath);
                addAdditionalImageToPreview(data.filePath, additionalImages.length - 1);
            }
        } catch (error) {
            showToast('Failed to upload image', 'error');
        }
    }
    
    e.target.value = '';
}

// Add additional image to preview
function addAdditionalImageToPreview(src, index) {
    const div = document.createElement('div');
    div.className = 'additional-image-item';
    div.innerHTML = `
        <img src="${src}" alt="Additional ${index + 1}">
        <button type="button" class="remove-image" onclick="removeAdditionalImage(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    additionalImagesPreview.appendChild(div);
}

// Remove additional image
window.removeAdditionalImage = function(index) {
    additionalImages.splice(index, 1);
    additionalImagesPreview.innerHTML = '';
    additionalImages.forEach((img, i) => {
        addAdditionalImageToPreview(img, i);
    });
};

// Handle navigation
function handleNavigation(view) {
    // Update active nav item
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });
    
    // Close mobile sidebar when navigating
    if (window.innerWidth < 1024) {
        sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
    
    // Update page title
    switch(view) {
        case 'products':
            pageTitle.textContent = 'All Products';
            loadProducts();
            break;
        case 'boutique':
            pageTitle.textContent = 'Boutique Products';
            loadProducts(1, '');
            break;
        case 'mobile':
            pageTitle.textContent = 'Mobile Phones';
            loadProducts(1, '');
            break;
        case 'settings':
            pageTitle.textContent = 'Settings';
            break;
    }
    
    // Close mobile sidebar
    sidebar.classList.remove('active');
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
