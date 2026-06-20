// Load data from browser memory
let inventory = JSON.parse(localStorage.getItem('ecoData')) || [];
let editIndex = -1; // -1 means adding new, any other number means editing existing

// --- AUTHENTICATION ---
function login() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    // Matches the "admin" and "password123" credentials
    if(user === "admin" && pass === "password123") {
        document.getElementById('login-screen').classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            updateUI();
        }, 500);
    } else {
        alert("Access Denied: Invalid Credentials");
    }
}

// --- CORE CRUD & UI LOGIC ---
function updateUI() {
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = '';
    let lowStock = 0;
    let totalValuation = 0;

    inventory.forEach((item, index) => {
        const isLow = item.qty < 5;
        if(isLow) lowStock++;
        totalValuation += (item.qty * item.price);

        tbody.innerHTML += `
            <tr class="animate__animated animate__fadeIn">
                <td><strong>${item.name}</strong></td>
                <td>${item.cat}</td>
                <td><span class="status-pill ${isLow ? 'low' : ''}">${isLow ? 'Critical' : 'Operational'}</span></td>
                <td>${item.qty}</td>
                <td>$${(item.qty * item.price).toFixed(2)}</td>
                <td>
                    <i class='bx bxs-edit-alt' style="cursor:pointer; color:#00f2fe; margin-right:10px" onclick="openEditModal(${index})"></i>
                    <i class='bx bxs-trash' style="cursor:pointer; color:#ff6b6b" onclick="removeItem(${index})"></i>
                </td>
            </tr>
        `;
    });

    // Update Stats Cards
    document.getElementById('stat-total').innerText = inventory.length;
    document.getElementById('stat-low').innerText = lowStock;
    
    // If you added the valuation card from the previous step:
    if(document.getElementById('stat-value')) {
        document.getElementById('stat-value').innerText = "$" + totalValuation.toFixed(2);
    }

    // Save to browser memory
    localStorage.setItem('ecoData', JSON.stringify(inventory));
}

// --- CREATE & UPDATE ---
function addItem() {
    const name = document.getElementById('pName').value;
    const cat = document.getElementById('pCat').value;
    const qty = document.getElementById('pQty').value;
    const price = document.getElementById('pPrice').value;

    if(name && qty && price) {
        const newItem = { name, cat, qty: parseInt(qty), price: parseFloat(price) };
        
        if(editIndex === -1) {
            inventory.push(newItem); // CREATE
        } else {
            inventory[editIndex] = newItem; // UPDATE
            editIndex = -1; // Reset index
        }

        updateUI();
        renderInventoryGrid(); // Update grid view too
        closeModal();
    } else {
        alert("Please fill in all fields.");
    }
}

// --- EDIT MODE ---
function openEditModal(index) {
    editIndex = index;
    const item = inventory[index];
    
    document.getElementById('pName').value = item.name;
    document.getElementById('pCat').value = item.cat;
    document.getElementById('pQty').value = item.qty;
    document.getElementById('pPrice').value = item.price;

    // Change modal text to show we are editing
    document.querySelector('.modal-content h3').innerText = "Update Asset Details";
    openModal();
}

// --- DELETE ---
function removeItem(index) {
    if(confirm("Are you sure you want to delete this item?")) {
        inventory.splice(index, 1);
        updateUI();
        renderInventoryGrid(); // Update grid view too
    }
}

// --- MODAL UTILS ---
function openModal() { 
    document.getElementById('modal').classList.remove('hidden'); 
}

function closeModal() { 
    document.getElementById('modal').classList.add('hidden');
    // Clear inputs for next time
    document.getElementById('pName').value = '';
    document.getElementById('pQty').value = '';
    document.getElementById('pPrice').value = '';
    document.querySelector('.modal-content h3').innerText = "Register New Asset";
    editIndex = -1;
}

function logout() { 
    if(confirm("Log out of the system?")) {
        location.reload(); 
    }
}

// --- INVENTORY GRID RENDERING ---
function renderInventoryGrid() {
    const grid = document.getElementById('inventory-grid');
    if(!grid) return; // Exit if grid doesn't exist
    
    const searchInput = document.getElementById('invSearch');
    const filterSelect = document.getElementById('invFilter');
    const itemCount = document.getElementById('item-count');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterCat = filterSelect ? filterSelect.value : 'all';
    
    grid.innerHTML = '';
    let count = 0;

    inventory.forEach((item, index) => {
        // Filter Logic
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCat = filterCat === 'all' || item.cat === filterCat;

        if (matchesSearch && matchesCat) {
            count++;
            const isLow = item.qty < 5;
            
            grid.innerHTML += `
                <div class="asset-card animate__animated animate__fadeInUp">
                    <div class="status-indicator">
                        <div class="pulse ${isLow ? 'critical' : ''}"></div>
                        ${isLow ? 'Low Stock' : 'In Stock'}
                    </div>
                    <div class="asset-category">${item.cat}</div>
                    <div class="asset-name">${item.name}</div>
                    
                    <div class="asset-stats">
                        <div class="stat-box">
                            <span>QUANTITY</span>
                            <b>${item.qty} units</b>
                        </div>
                        <div class="stat-box">
                            <span>VALUATION</span>
                            <b>${(item.qty * item.price).toFixed(2)}</b>
                        </div>
                    </div>

                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button onclick="openEditModal(${index})" class="glass-btn" style="padding: 10px; flex: 1; font-size: 0.85rem;">
                            <i class='bx bx-edit-alt'></i> Edit
                        </button>
                        <button onclick="removeItem(${index})" class="glass-btn" style="padding: 10px; background: rgba(255,107,107,0.15); border-color: rgba(255,107,107,0.3); color: #ff6b6b;">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </div>
            `;
        }
    });

    // Update item count
    if(itemCount) {
        itemCount.innerText = `${count} item${count !== 1 ? 's' : ''}`;
    }
}

// --- VIEW SWITCHING ---
function showView(viewId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked nav link
    event.target.closest('.nav-link').classList.add('active');
    
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected view
    document.getElementById('view-' + viewId).classList.remove('hidden');
    
    // If switching to inventory view, render the grid
    if(viewId === 'inventory') {
        renderInventoryGrid();
    }
    
    // If switching to reports view, generate the report
    if(viewId === 'reports') {
        generateReport();
    }
}

// --- REPORTS GENERATION ---
function generateReport() {
    if(inventory.length === 0) {
        document.getElementById('reportContent').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <i class='bx bx-pie-chart-alt-2' style="font-size: 80px; opacity: 0.3;"></i>
                <h3 style="margin-top: 20px; opacity: 0.7;">No Data Available</h3>
                <p style="opacity: 0.5;">Add some inventory items to generate reports</p>
            </div>
        `;
        return;
    }

    // Calculate key metrics
    let totalValue = 0;
    let totalUnits = 0;
    let categoryData = {};
    let lowStockItems = [];
    let topItems = [];

    inventory.forEach(item => {
        const itemValue = item.qty * item.price;
        totalValue += itemValue;
        totalUnits += item.qty;
        
        // Category breakdown
        if(!categoryData[item.cat]) {
            categoryData[item.cat] = { count: 0, value: 0 };
        }
        categoryData[item.cat].count += item.qty;
        categoryData[item.cat].value += itemValue;
        
        // Low stock tracking
        if(item.qty < 5) {
            lowStockItems.push(item);
        }
        
        // Top items by value
        topItems.push({ ...item, totalValue: itemValue });
    });

    // Sort top items
    topItems.sort((a, b) => b.totalValue - a.totalValue);
    topItems = topItems.slice(0, 5);

    const avgPrice = totalValue / totalUnits || 0;

    // Update metrics
    document.getElementById('report-total-value').innerText = 'RM' + totalValue.toFixed(2);
    document.getElementById('report-avg-price').innerText = 'RM' + avgPrice.toFixed(2);
    document.getElementById('report-total-items').innerText = totalUnits;

    // Generate category chart
    let categoryHTML = '';
    const maxCategoryValue = Math.max(...Object.values(categoryData).map(d => d.value));
    
    for(let cat in categoryData) {
        const percentage = (categoryData[cat].value / maxCategoryValue) * 100;
        categoryHTML += `
            <div class="chart-bar">
                <div class="chart-label">${cat}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        ${categoryData[cat].value.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    }
    document.getElementById('categoryChart').innerHTML = categoryHTML;

    // Generate stock status chart
    const inStock = inventory.filter(item => item.qty >= 5).length;
    const critical = inventory.filter(item => item.qty < 5).length;
    const stockTotal = inventory.length;
    
    const inStockPercent = (inStock / stockTotal) * 100;
    const criticalPercent = (critical / stockTotal) * 100;
    
    document.getElementById('stockChart').innerHTML = `
        <div class="chart-bar">
            <div class="chart-label">In Stock</div>
            <div class="chart-bar-container">
                <div class="chart-bar-fill" style="width: ${inStockPercent}%">
                    ${inStock} items
                </div>
            </div>
        </div>
        <div class="chart-bar">
            <div class="chart-label">Critical</div>
            <div class="chart-bar-container">
                <div class="chart-bar-fill critical" style="width: ${criticalPercent}%">
                    ${critical} items
                </div>
            </div>
        </div>
    `;

    // Generate top items list
    let topItemsHTML = '';
    topItems.forEach((item, index) => {
        topItemsHTML += `
            <div class="report-item">
                <div>
                    <div class="report-item-name">#${index + 1} ${item.name}</div>
                    <div class="report-item-category">${item.cat} • ${item.qty} units</div>
                </div>
                <div class="report-item-value">${item.totalValue.toFixed(2)}</div>
            </div>
        `;
    });
    document.getElementById('topItemsList').innerHTML = topItemsHTML || '<p style="opacity: 0.5; text-align: center;">No items to display</p>';

    // Generate low stock list
    let lowStockHTML = '';
    lowStockItems.forEach(item => {
        lowStockHTML += `
            <div class="report-item">
                <div>
                    <div class="report-item-name">${item.name}</div>
                    <div class="report-item-category">${item.cat}</div>
                </div>
                <span class="alert-badge">${item.qty} left</span>
            </div>
        `;
    });
    document.getElementById('lowStockList').innerHTML = lowStockHTML || '<p style="opacity: 0.5; text-align: center; color: #00f2fe;">All items well stocked! 🎉</p>';
}

// --- PRINT REPORT ---
function printReport() {
    window.print();
}