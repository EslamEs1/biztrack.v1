// Main JavaScript file for BizTrack Dashboard

// Product data
const products = [
    {
        id: 'P001',
        barcode: '123456789',
        name: 'سكر',
        price: 25.00,
        unit: 'كيلو',
        stock: {
            'المخزن الرئيسي': { total: 100, available: 80, reserved: 20 },
            'مخزن الفرع الأول': { total: 50, available: 40, reserved: 10 },
            'مخزن الفرع الثاني': { total: 30, available: 30, reserved: 0 }
        }
    },
    {
        id: 'P002',
        barcode: '234567890',
        name: 'أرز',
        price: 30.00,
        unit: 'كيلو',
        stock: {
            'المخزن الرئيسي': { total: 200, available: 150, reserved: 50 },
            'مخزن الفرع الأول': { total: 100, available: 80, reserved: 20 },
            'مخزن الفرع الثاني': { total: 50, available: 40, reserved: 10 }
        }
    },
    {
        id: 'P003',
        barcode: '345678901',
        name: 'زيت',
        price: 85.00,
        unit: 'لتر',
        stock: {
            'المخزن الرئيسي': { total: 150, available: 120, reserved: 30 },
            'مخزن الفرع الأول': { total: 80, available: 70, reserved: 10 },
            'مخزن الفرع الثاني': { total: 40, available: 35, reserved: 5 }
        }
    }
];

// Warehouses
const warehouses = [
    'المخزن الرئيسي',
    'مخزن الفرع الأول',
    'مخزن الفرع الثاني'
];

// Admin credentials for price changes
const adminCredentials = [
    { username: 'admin', password: 'admin123' },
    { username: 'manager', password: 'manager456' },
    { username: 'supervisor', password: 'super789' }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle')?.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Invoice type toggle (Cash/Credit)
    const customerTypeRadios = document.querySelectorAll('input[name="customerType"]');
    const cashCustomerFields = document.getElementById('cashCustomerFields');
    const creditCustomerFields = document.getElementById('creditCustomerFields');

    if (customerTypeRadios.length > 0) {
        customerTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'cash' && cashCustomerFields && creditCustomerFields) {
                    cashCustomerFields.style.display = 'block';
                    creditCustomerFields.style.display = 'none';
                } else if (this.value === 'credit' && cashCustomerFields && creditCustomerFields) {
                    cashCustomerFields.style.display = 'none';
                    creditCustomerFields.style.display = 'block';
                }
            });
        });
    }

    // Product barcode/code search
    const barcodeInput = document.getElementById('productBarcode');
    if (barcodeInput) {
        barcodeInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchProduct(this.value);
            }
        });
    }

    // Add product to invoice
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            addProductToInvoice();
        });
    }
    
    // Initialize product dropdown
    initProductDropdown();

    // Calculate totals when quantity or price changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('product-quantity') || 
            e.target.classList.contains('product-discount-percent') || 
            e.target.classList.contains('product-discount-amount')) {
            updateProductTotal(e.target);
            updateInvoiceTotal();
        }
        
        // Handle price change with password protection
        if (e.target.classList.contains('product-price')) {
            // Store the original value in case authentication fails
            const originalValue = e.target.getAttribute('data-original-value') || e.target.defaultValue;
            const newValue = e.target.value;
            const rowId = e.target.closest('tr').getAttribute('data-product-id');
            
            // Show password modal
            document.getElementById('priceChangeRowId').value = rowId;
            document.getElementById('priceChangeNewValue').value = newValue;
            
            // Reset the value temporarily until authenticated
            e.target.value = originalValue;
            
            // Show the modal
            const priceChangeModal = new bootstrap.Modal(document.getElementById('changePriceModal'));
            priceChangeModal.show();
        }
    });
    
    // Handle price change confirmation
    const confirmPriceChangeBtn = document.getElementById('confirmPriceChange');
    if (confirmPriceChangeBtn) {
        confirmPriceChangeBtn.addEventListener('click', function() {
            const username = document.getElementById('priceChangeUsername').value;
            const password = document.getElementById('priceChangePassword').value;
            const rowId = document.getElementById('priceChangeRowId').value;
            const newValue = document.getElementById('priceChangeNewValue').value;
            
            // Check credentials
            const isAuthenticated = adminCredentials.some(cred => 
                cred.username === username && cred.password === password);
            
            if (isAuthenticated) {
                // Find the row and update the price
                const row = document.querySelector(`tr[data-product-id="${rowId}"]`);
                if (row) {
                    const priceInput = row.querySelector('.product-price');
                    priceInput.value = newValue;
                    priceInput.setAttribute('data-original-value', newValue);
                    
                    // Update totals
                    updateProductTotal(priceInput);
                    updateInvoiceTotal();
                    
                    // Close modal
                    bootstrap.Modal.getInstance(document.getElementById('changePriceModal')).hide();
                    
                    // Clear password field
                    document.getElementById('priceChangePassword').value = '';
                    
                    // Show success message
                    showSuccessModal('تم تغيير السعر بنجاح');
                }
            } else {
                showErrorModal('اسم المستخدم أو كلمة المرور غير صحيحة');
                document.getElementById('priceChangePassword').value = '';
            }
        });
    }

    // Payment method selection
    const paymentMethodCards = document.querySelectorAll('.payment-method-card');
    const paymentMethodInput = document.getElementById('paymentMethod');
    
    if (paymentMethodCards.length > 0 && paymentMethodInput) {
        paymentMethodCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove selected class from all cards
                paymentMethodCards.forEach(c => c.classList.remove('selected'));
                
                // Add selected class to clicked card
                this.classList.add('selected');
                
                // Update hidden input value
                paymentMethodInput.value = this.dataset.method;
                
                // Show/hide additional fields based on payment method
                togglePaymentFields(this.dataset.method);
            });
        });
    }

    // Initialize any charts if they exist
    initCharts();
});

// Function to search for a product by barcode or code
function searchProduct(code) {
    // This would typically be an API call to your backend
    console.log('Searching for product with code:', code);
    
    // Find product by ID or barcode
    let product = products.find(p => p.id === code || p.barcode === code);
    
    if (!product) {
        // If no product found, use a default product (for demo purposes)
        product = {
            id: code,
            barcode: code,
            name: 'منتج تجريبي',
            price: 150.00,
            stock: {
                'المخزن الرئيسي': { total: 25, available: 25, reserved: 0 }
            },
            unit: 'قطعة'
        };
    }
    
    // Add the product to the invoice
    addProductToInvoiceTable(product);
}

// Function to add a product to the invoice table
function addProductToInvoiceTable(product) {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;
    
    // Check if product already exists in table
    const existingRow = document.querySelector(`tr[data-product-id="${product.id}"]`);
    if (existingRow) {
        // Increment quantity if product already exists
        const quantityInput = existingRow.querySelector('.product-quantity');
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updateProductTotal(quantityInput);
        updateInvoiceTotal();
        return;
    }
    
    // Create new row
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-product-id', product.id);
    
    // Get default warehouse
    const defaultWarehouse = 'المخزن الرئيسي';
    
    // Get stock info for the default warehouse
    const stockInfo = product.stock[defaultWarehouse] || { total: 0, available: 0, reserved: 0 };
    
    // Create warehouse dropdown
    let warehouseOptions = '';
    warehouses.forEach(warehouse => {
        const selected = warehouse === defaultWarehouse ? 'selected' : '';
        warehouseOptions += `<option value="${warehouse}" ${selected}>${warehouse}</option>`;
    });
    
    // Create product dropdown
    let productOptions = '';
    products.forEach(p => {
        const selected = p.id === product.id ? 'selected' : '';
        productOptions += `<option value="${p.id}" ${selected}>${p.name} (كود: ${p.id})</option>`;
    });
    
    newRow.innerHTML = `
        <td>${product.barcode}</td>
        <td>${product.id}</td>
        <td>
            <select class="form-select product-select">
                ${productOptions}
            </select>
        </td>
        <td>
            <select class="form-select warehouse-select">
                ${warehouseOptions}
            </select>
            <small class="text-muted stock-info">متاح: ${stockInfo.available} | حر: ${stockInfo.available - stockInfo.reserved} | محجوز: ${stockInfo.reserved}</small>
        </td>
        <td>${product.unit}</td>
        <td><input type="number" class="form-control product-quantity" value="1" min="1" max="${stockInfo.available}"></td>
        <td><input type="number" class="form-control product-price" value="${product.price.toFixed(2)}" step="0.01" data-original-value="${product.price.toFixed(2)}"></td>
        <td><input type="number" class="form-control product-discount-percent" value="0" min="0" max="100"></td>
        <td><input type="number" class="form-control product-discount-amount" value="0" min="0" step="0.01"></td>
        <td class="product-total">${product.price.toFixed(2)}</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger remove-product">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(newRow);
    
    // Add event listener to remove button
    newRow.querySelector('.remove-product').addEventListener('click', function() {
        newRow.remove();
        updateInvoiceTotal();
    });
    
    // Add event listener to product select
    newRow.querySelector('.product-select').addEventListener('change', function() {
        const selectedProductId = this.value;
        const selectedProduct = products.find(p => p.id === selectedProductId);
        
        if (selectedProduct) {
            // Update row with new product data
            newRow.cells[0].textContent = selectedProduct.barcode;
            newRow.cells[1].textContent = selectedProduct.id;
            newRow.cells[4].textContent = selectedProduct.unit;
            
            const priceInput = newRow.querySelector('.product-price');
            priceInput.value = selectedProduct.price.toFixed(2);
            
            // Update warehouse stock info
            updateWarehouseStockInfo(newRow, selectedProduct);
            
            // Update total
            updateProductTotal(priceInput);
            updateInvoiceTotal();
        }
    });
    
    // Add event listener to warehouse select
    newRow.querySelector('.warehouse-select').addEventListener('change', function() {
        const selectedProductId = newRow.getAttribute('data-product-id');
        const selectedProduct = products.find(p => p.id === selectedProductId);
        
        if (selectedProduct) {
            // Update warehouse stock info
            updateWarehouseStockInfo(newRow, selectedProduct);
        }
    });
    
    // Update invoice total
    updateInvoiceTotal();
    
    // Clear barcode input
    const barcodeInput = document.getElementById('productBarcode');
    if (barcodeInput) barcodeInput.value = '';
    
    // Reset product select
    const productSelect = document.getElementById('productSelect');
    if (productSelect) productSelect.selectedIndex = 0;
    
    // Focus back on barcode input for next scan
    if (barcodeInput) barcodeInput.focus();
}

// Function to update warehouse stock info
function updateWarehouseStockInfo(row, product) {
    const warehouseSelect = row.querySelector('.warehouse-select');
    const stockInfoElement = row.querySelector('.stock-info');
    const quantityInput = row.querySelector('.product-quantity');
    
    if (warehouseSelect && stockInfoElement && product) {
        const selectedWarehouse = warehouseSelect.value;
        const stockInfo = product.stock[selectedWarehouse] || { total: 0, available: 0, reserved: 0 };
        
        // Update stock info text
        stockInfoElement.textContent = `متاح: ${stockInfo.available} | حر: ${stockInfo.available - stockInfo.reserved} | محجوز: ${stockInfo.reserved}`;
        
        // Update quantity max attribute
        quantityInput.max = stockInfo.available;
        
        // If current quantity is more than available, adjust it
        if (parseInt(quantityInput.value) > stockInfo.available) {
            quantityInput.value = stockInfo.available;
            updateProductTotal(quantityInput);
            updateInvoiceTotal();
        }
    }
}

// Function to update a product's total based on quantity, price, and discounts
function updateProductTotal(inputElement) {
    const row = inputElement.closest('tr');
    const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.product-price').value) || 0;
    const discountPercent = parseFloat(row.querySelector('.product-discount-percent').value) || 0;
    const discountAmount = parseFloat(row.querySelector('.product-discount-amount').value) || 0;
    
    // Calculate subtotal before discounts
    const subtotal = quantity * price;
    
    // Calculate discount value from percentage
    const percentDiscountValue = subtotal * (discountPercent / 100);
    
    // Calculate total after both discounts
    const total = subtotal - percentDiscountValue - discountAmount;
    
    // Update total cell (ensure it's not negative)
    row.querySelector('.product-total').textContent = Math.max(0, total).toFixed(2);
}

// Function to update the invoice total
function updateInvoiceTotal() {
    const totalCells = document.querySelectorAll('.product-total');
    let invoiceTotal = 0;
    
    totalCells.forEach(cell => {
        invoiceTotal += parseFloat(cell.textContent) || 0;
    });
    
    // Update invoice total display
    const invoiceTotalElement = document.getElementById('invoiceTotal');
    if (invoiceTotalElement) {
        invoiceTotalElement.textContent = invoiceTotal.toFixed(2);
    }
    
    // Update payment amount if it exists
    const paymentAmountInput = document.getElementById('paymentAmount');
    if (paymentAmountInput) {
        paymentAmountInput.value = invoiceTotal.toFixed(2);
        // Trigger the calculation of remaining amount
        calculateRemainingAmount();
    }
    
    // Update payment total amount in the modal header
    const paymentTotalAmount = document.getElementById('paymentTotalAmount');
    if (paymentTotalAmount) {
        paymentTotalAmount.textContent = invoiceTotal.toFixed(2) + ' ج.م';
    }
}

// Function to calculate remaining amount in payment form
function calculateRemainingAmount() {
    const totalAmount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    const remainingAmountElement = document.getElementById('remainingAmount');
    if (remainingAmountElement) {
        remainingAmountElement.value = remainingAmount.toFixed(2);
        
        // Show alert if there's a remaining amount
        const remainingAlert = document.getElementById('remainingAlert');
        if (remainingAlert) {
            if (remainingAmount > 0) {
                remainingAlert.style.display = 'block';
            } else {
                remainingAlert.style.display = 'none';
            }
        }
    }
}

// Function to initialize product dropdown
function initProductDropdown() {
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        // Populate product dropdown
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (كود: ${product.id})`;
            productSelect.appendChild(option);
        });
        
        // Add change event listener
        productSelect.addEventListener('change', function() {
            const selectedProductId = this.value;
            if (selectedProductId) {
                const selectedProduct = products.find(p => p.id === selectedProductId);
                if (selectedProduct) {
                    document.getElementById('productBarcode').value = selectedProduct.barcode;
                }
            }
        });
    }
}

// Function to add product to invoice
function addProductToInvoice() {
    const barcodeInput = document.getElementById('productBarcode');
    const productSelect = document.getElementById('productSelect');
    
    let code = '';
    
    if (barcodeInput && barcodeInput.value) {
        code = barcodeInput.value;
    } else if (productSelect && productSelect.value) {
        code = productSelect.value;
    }
    
    if (code) {
        searchProduct(code);
    } else {
        showModal('يرجى إدخال باركود أو اختيار منتج من القائمة');
    }
}

// Function to toggle payment method specific fields
function togglePaymentFields(method) {
    const bankFields = document.getElementById('bankTransferFields');
    const checkFields = document.getElementById('checkFields');
    const vodafoneFields = document.getElementById('vodafoneCashFields');
    const fileUploadField = document.getElementById('paymentDocumentField');
    
    if (bankFields) bankFields.style.display = 'none';
    if (checkFields) checkFields.style.display = 'none';
    if (vodafoneFields) vodafoneFields.style.display = 'none';
    if (fileUploadField) fileUploadField.style.display = 'none';
    
    switch(method) {
        case 'bank':
            if (bankFields) bankFields.style.display = 'block';
            if (fileUploadField) fileUploadField.style.display = 'block';
            break;
        case 'check':
            if (checkFields) checkFields.style.display = 'block';
            if (fileUploadField) fileUploadField.style.display = 'block';
            break;
        case 'vodafone':
            if (vodafoneFields) vodafoneFields.style.display = 'block';
            if (fileUploadField) fileUploadField.style.display = 'block';
            break;
    }
}

// Function to initialize charts
function initCharts() {
    // Sales Distribution Chart
    const salesDistributionChart = document.getElementById('salesDistributionChart');
    if (salesDistributionChart) {
        new Chart(salesDistributionChart, {
            type: 'pie',
            data: {
                labels: ['نقدي', 'آجل', 'تحويل بنكي', 'فودافون كاش'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#2ecc71', '#3498db', '#f39c12', '#9b59b6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Monthly Sales Chart
    const monthlySalesChart = document.getElementById('monthlySalesChart');
    if (monthlySalesChart) {
        new Chart(monthlySalesChart, {
            type: 'bar',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'المبيعات',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    backgroundColor: '#3498db',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                }
            }
        });
    }
}
