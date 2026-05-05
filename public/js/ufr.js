// UFR Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize delete confirmation modal
    initDeleteConfirmation();
});

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
                        <p>Êtes-vous sûr de vouloir supprimer cet UFR ? Cette action est irréversible.</p>
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
function confirmDelete(ufrId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmBtn.onclick = function() {
        // Submit the delete form
        const deleteForm = document.getElementById(`deleteForm-${ufrId}`);
        if (deleteForm) {
            deleteForm.submit();
        }
    };
    
    modal.show();
}

// Export function for global use
window.confirmDelete = confirmDelete;
