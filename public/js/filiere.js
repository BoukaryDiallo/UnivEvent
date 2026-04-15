// Filière Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Filière module
    initFiliereModule();
});

function initFiliereModule() {
    // Search functionality
    initSearch();
    
    // Delete confirmation
    initDeleteConfirmation();
    
    // Form validation
    initFormValidation();
    
    // Dynamic form interactions
    initDynamicForms();
    
    // UFR and Department relationship handling
    initRelationshipHandling();
    
    // Program accordion
    initProgramAccordion();
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchFiliere');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('#filiereTable tbody tr');
            
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
                        <p>Êtes-vous sûr de vouloir supprimer cette filière ? Cette action est irréversible.</p>
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
function confirmDelete(filiereId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmBtn.onclick = function() {
        // Here you would typically make an AJAX call to delete filière
        console.log('Deleting filière with ID:', filiereId);
        
        // For demonstration, we'll just remove row
        const row = document.querySelector(`tr[data-filiere-id="${filiereId}"]`);
        if (row) {
            row.remove();
        }
        
        modal.hide();
        showNotification('Filière supprimée avec succès', 'success');
    };
    
    modal.show();
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('.filiere-form');
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
                // Generate code from name (first 2 letters of each word)
                const words = name.split(' ');
                const code = words.map(word => word.substring(0, 2).toUpperCase()).join('');
                codeInput.value = 'FIL-' + code;
            }
        });
    }
    
    // Capacity validation
    const capacityInput = document.getElementById('capacite');
    if (capacityInput) {
        capacityInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1) {
                this.value = 1;
            } else if (value > 500) {
                this.value = 500;
                showNotification('La capacité maximale est de 500 étudiants', 'warning');
            }
            updateCapacityIndicator(value);
        });
    }
    
    // Duration validation
    const dureeInput = document.getElementById('duree');
    if (dureeInput) {
        dureeInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1) {
                this.value = 1;
            } else if (value > 10) {
                this.value = 10;
                showNotification('La durée maximale est de 10 ans', 'warning');
            }
        });
    }
}

// UFR and Department relationship handling
function initRelationshipHandling() {
    const ufrSelect = document.getElementById('ufr_id');
    const departementSelect = document.getElementById('departement_id');
    
    if (ufrSelect) {
        ufrSelect.addEventListener('change', function() {
            const selectedUfr = this.value;
            updateDepartementOptions(selectedUfr);
        });
    }
    
    if (departementSelect) {
        departementSelect.addEventListener('change', function() {
            const selectedDepartement = this.value;
            updateDepartementInfo(selectedDepartement);
        });
    }
}

// Update department options based on selected UFR
function updateDepartementOptions(ufrId) {
    const departementSelect = document.getElementById('departement_id');
    if (!departementSelect) return;
    
    // Clear current options
    departementSelect.innerHTML = '<option value="">Sélectionner un département</option>';
    
    // Department options by UFR (this would typically come from an API)
    const departements = {
        '1': [
            { id: '1', name: 'DPT-INF - Informatique' },
            { id: '2', name: 'DPT-MATH - Mathématiques' },
            { id: '3', name: 'DPT-PHYS - Physique-Chimie' }
        ],
        '2': [
            { id: '4', name: 'DPT-LFR - Langues Françaises' },
            { id: '5', name: 'DPT-ANG - Langues Anglaises' }
        ],
        '3': [
            { id: '6', name: 'DPT-DRT - Droit Privé' },
            { id: '7', name: 'DPT-POL - Sciences Politiques' }
        ]
    };
    
    const options = departements[ufrId] || [];
    options.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        departementSelect.appendChild(option);
    });
}

// Update department info
function updateDepartementInfo(departementId) {
    // This would typically fetch from an API
    const departementInfo = {
        '1': { name: 'Informatique', ufr: 'Sciences et Technologies' },
        '2': { name: 'Mathématiques', ufr: 'Sciences et Technologies' },
        '3': { name: 'Physique-Chimie', ufr: 'Sciences et Technologies' }
    };
    
    const info = departementInfo[departementId];
    if (info) {
        // Update UI elements that depend on department
        const deptDisplay = document.getElementById('selectedDepartementDisplay');
        if (deptDisplay) {
            deptDisplay.textContent = `${info.name} - ${info.ufr}`;
        }
    }
}

// Program accordion initialization
function initProgramAccordion() {
    const accordions = document.querySelectorAll('.filiere-programme .accordion-button');
    accordions.forEach(button => {
        button.addEventListener('click', function() {
            // Close other accordions if needed
            const isMultiple = this.closest('.filiere-programme').dataset.multiple === 'true';
            if (!isMultiple) {
                const allButtons = this.closest('.filiere-programme').querySelectorAll('.accordion-button');
                allButtons.forEach(btn => {
                    if (btn !== this && !btn.classList.contains('collapsed')) {
                        btn.click();
                    }
                });
            }
        });
    });
}

// Update capacity indicator
function updateCapacityIndicator(capacity) {
    const indicator = document.getElementById('capacityIndicator');
    if (!indicator) return;
    
    indicator.classList.remove('high', 'medium', 'low');
    
    if (capacity >= 100) {
        indicator.classList.add('high');
    } else if (capacity >= 50) {
        indicator.classList.add('medium');
    } else {
        indicator.classList.add('low');
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

// Load filieres dynamically
function loadFilieres(ufrId = null, departementId = null) {
    // This would typically make an AJAX call
    console.log('Loading filières for UFR:', ufrId, 'Department:', departementId);
    
    // Show loading state
    const tableBody = document.querySelector('#filiereTable tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
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
        console.log('Filières loaded');
        updateFiliereStats();
    }, 1000);
}

// Filter filieres by criteria
function filterFilieres(criteria) {
    const rows = document.querySelectorAll('#filiereTable tbody tr');
    
    rows.forEach(row => {
        let shouldShow = true;
        
        if (criteria.ufr) {
            const ufrBadge = row.querySelector('.badge-primary');
            if (ufrBadge) {
                const rowUfrId = ufrBadge.textContent.split('-')[0];
                shouldShow = shouldShow && rowUfrId === criteria.ufr;
            }
        }
        
        if (criteria.level) {
            const levelBadge = row.querySelector('.badge-warning');
            if (levelBadge) {
                const rowLevel = levelBadge.textContent.toLowerCase();
                shouldShow = shouldShow && rowLevel.includes(criteria.level.toLowerCase());
            }
        }
        
        if (criteria.status) {
            const statusBadge = row.querySelector('.badge-success, .badge-warning');
            if (statusBadge) {
                const rowStatus = statusBadge.textContent.toLowerCase();
                shouldShow = shouldShow && rowStatus.includes(criteria.status.toLowerCase());
            }
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Update filiere statistics
function updateFiliereStats() {
    const totalFilieres = document.querySelectorAll('#filiereTable tbody tr').length;
    const activeFilieres = document.querySelectorAll('.filiere-status-active').length;
    const inactiveFilieres = document.querySelectorAll('.filiere-status-inactive').length;
    
    // Update UI elements
    const totalElement = document.getElementById('totalFilieres');
    const activeElement = document.getElementById('activeFilieres');
    const inactiveElement = document.getElementById('inactiveFilieres');
    
    if (totalElement) totalElement.textContent = totalFilieres;
    if (activeElement) activeElement.textContent = activeFilieres;
    if (inactiveElement) inactiveElement.textContent = inactiveFilieres;
}

// Export functions for global use
window.confirmDelete = confirmDelete;
window.showNotification = showNotification;
window.loadFilieres = loadFilieres;
window.filterFilieres = filterFilieres;
window.updateFiliereStats = updateFiliereStats;

// Table sorting functionality
function initTableSorting() {
    const table = document.getElementById('filiereTable');
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

// Call stats update on page load
document.addEventListener('DOMContentLoaded', updateFiliereStats);
