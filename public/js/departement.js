// Département Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Département module
    initDepartementModule();
});

function initDepartementModule() {
    // Search functionality
    initSearch();
    
    // Delete confirmation
    initDeleteConfirmation();
    
    // Form validation
    initFormValidation();
    
    // Dynamic form interactions
    initDynamicForms();
    
    // UFR relationship handling
    initUfrRelationship();
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchDepartement');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('#departementTable tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Delete confirmation modal
function initDeleteConfirmation() {
    // Create modal if it doesn't exist
    if (!document.getElementById('deleteModal')) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'deleteModal';
        modal.tabIndex = '-1';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmation de suppression</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Supprimer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Confirm delete function
function confirmDelete(departementId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmBtn.onclick = function() {
        // Here you would typically make an AJAX call to delete département
        console.log('Deleting département with ID:', departementId);
        
        // For demonstration, we'll just remove row
        const row = document.querySelector(`tr[data-departement-id="${departementId}"]`);
        if (row) {
            row.remove();
        }
        
        modal.hide();
        showNotification('Département supprimé avec succès', 'success');
    };
    
    modal.show();
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('.departement-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Dynamic form interactions
function initDynamicForms() {
    // Auto-generate code based on name
    const nameInput = document.getElementById('nom');
    const codeInput = document.getElementById('code');
    
    if (nameInput && codeInput) {
        nameInput.addEventListener('input', function() {
            const name = this.value;
            if (name && !codeInput.value) {
                // Generate code from name (first 3 letters uppercase)
                const code = name.substring(0, 3).toUpperCase();
                codeInput.value = 'DPT-' + code;
            }
        });
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('telephone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '');
            if (value.startsWith('+226')) {
                value = value.replace('+226', '+226 ');
            }
            this.value = value;
        });
    }
}

// UFR relationship handling
function initUfrRelationship() {
    const ufrSelect = document.getElementById('ufr_id');
    
    if (ufrSelect) {
        ufrSelect.addEventListener('change', function() {
            const selectedUfr = this.value;
            updateDepartementInfo(selectedUfr);
        });
    }
}

// Update department info based on selected UFR
function updateDepartementInfo(ufrId) {
    // This would typically fetch from an API
    const ufrInfo = {
        '1': { name: 'Sciences et Technologies', color: '#007bff' },
        '2': { name: 'Lettres, Langues et Arts', color: '#6f42c1' },
        '3': { name: 'Droit et Sciences Politiques', color: '#fd7e14' }
    };
    
    const info = ufrInfo[ufrId];
    if (info) {
        // Update UI elements that depend on UFR
        const ufrDisplay = document.getElementById('selectedUfrDisplay');
        if (ufrDisplay) {
            ufrDisplay.textContent = info.name;
            ufrDisplay.style.color = info.color;
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Load departments dynamically
function loadDepartments(ufrId = null) {
    // This would typically make an AJAX call
    console.log('Loading departments for UFR:', ufrId);
    
    // Show loading state
    const tableBody = document.querySelector('#departementTable tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                </td>
            </tr>
        `;
    }
    
    // Simulate loading delay
    setTimeout(() => {
        // Restore content or update with filtered results
        console.log('Departments loaded');
    }, 1000);
}

// Filter departments by UFR
function filterByUfr(ufrId) {
    const rows = document.querySelectorAll('#departementTable tbody tr');
    
    rows.forEach(row => {
        const ufrBadge = row.querySelector('.badge-primary');
        if (ufrBadge) {
            const rowUfrId = ufrBadge.textContent.split('-')[0];
            const shouldShow = !ufrId || rowUfrId === ufrId;
            row.style.display = shouldShow ? '' : 'none';
        }
    });
}

// Export functions for global use
window.confirmDelete = confirmDelete;
window.showNotification = showNotification;
window.loadDepartments = loadDepartments;
window.filterByUfr = filterByUfr;

// Table sorting functionality
function initTableSorting() {
    const table = document.getElementById('departementTable');
    if (table) {
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const column = this.dataset.sort;
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                rows.sort((a, b) => {
                    const aValue = a.querySelector(`td[data-column="${column}"]`).textContent;
                    const bValue = b.querySelector(`td[data-column="${column}"]`).textContent;
                    return aValue.localeCompare(bValue);
                });
                
                tbody.innerHTML = '';
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    }
}

// Initialize table sorting on page load
document.addEventListener('DOMContentLoaded', initTableSorting);

// Department statistics update
function updateDepartmentStats() {
    // Update statistics cards
    const totalDepartments = document.querySelectorAll('#departementTable tbody tr').length;
    const activeDepartments = document.querySelectorAll('.departement-status-active').length;
    const inactiveDepartments = document.querySelectorAll('.departement-status-inactive').length;
    
    // Update UI elements
    const totalElement = document.getElementById('totalDepartments');
    const activeElement = document.getElementById('activeDepartments');
    const inactiveElement = document.getElementById('inactiveDepartments');
    
    if (totalElement) totalElement.textContent = totalDepartments;
    if (activeElement) activeElement.textContent = activeDepartments;
    if (inactiveElement) inactiveElement.textContent = inactiveDepartments;
}

// Call stats update on page load
document.addEventListener('DOMContentLoaded', updateDepartmentStats);
