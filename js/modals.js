/**
 * Utility functions for displaying modal dialogs instead of browser alerts
 */

// Modal HTML templates
const modalTemplates = {
    // Message modal template
    message: `
    <div class="modal fade" id="globalMessageModal" tabindex="-1" aria-labelledby="globalMessageModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="globalMessageModalLabel">رسالة</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-info-circle-fill text-primary me-3" style="font-size: 2rem;"></i>
                        <p class="mb-0" id="globalMessageModalContent"></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">موافق</button>
                </div>
            </div>
        </div>
    </div>
    `,
    
    // Confirmation modal template
    confirmation: `
    <div class="modal fade" id="globalConfirmationModal" tabindex="-1" aria-labelledby="globalConfirmationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="globalConfirmationModalLabel">تأكيد</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-question-circle-fill text-warning me-3" style="font-size: 2rem;"></i>
                        <p class="mb-0" id="globalConfirmationModalContent"></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-primary" id="globalConfirmModalBtn">تأكيد</button>
                </div>
            </div>
        </div>
    </div>
    `,
    
    // Success modal template
    success: `
    <div class="modal fade" id="globalSuccessModal" tabindex="-1" aria-labelledby="globalSuccessModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title" id="globalSuccessModalLabel">نجاح</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-success me-3" style="font-size: 2rem;"></i>
                        <p class="mb-0" id="globalSuccessModalContent"></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal">موافق</button>
                </div>
            </div>
        </div>
    </div>
    `,
    
    // Error modal template
    error: `
    <div class="modal fade" id="globalErrorModal" tabindex="-1" aria-labelledby="globalErrorModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="globalErrorModalLabel">خطأ</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle-fill text-danger me-3" style="font-size: 2rem;"></i>
                        <p class="mb-0" id="globalErrorModalContent"></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">موافق</button>
                </div>
            </div>
        </div>
    </div>
    `
};

// Initialize modals
function initializeModals() {
    // Check if modals already exist
    if (document.getElementById('globalMessageModal')) {
        return;
    }
    
    // Create container for modals if it doesn't exist
    let modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        document.body.appendChild(modalContainer);
    }
    
    // Add all modal templates to the container
    for (const type in modalTemplates) {
        modalContainer.innerHTML += modalTemplates[type];
    }
}

// Show message modal
function showModal(message, type = 'message') {
    // Initialize modals if they don't exist
    initializeModals();
    
    // Default to message type if invalid type provided
    if (!['message', 'confirmation', 'success', 'error'].includes(type)) {
        type = 'message';
    }
    
    try {
        // Set modal content
        const modalId = `global${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
        const contentId = `global${type.charAt(0).toUpperCase() + type.slice(1)}ModalContent`;
        
        const modalElement = document.getElementById(modalId);
        const contentElement = document.getElementById(contentId);
        
        if (modalElement && contentElement) {
            // Remove any existing backdrop if present
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Make sure body doesn't have modal classes
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            contentElement.textContent = message;
            
            // Create and show modal
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Add event listener to ensure backdrop is removed on hide
            modalElement.addEventListener('hidden.bs.modal', function() {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, { once: true });
            
            return modal;
        } else {
            console.error(`Modal elements not found: ${modalId}, ${contentId}`);
            alert(message);
        }
    } catch (error) {
        console.error('Error showing modal:', error);
        alert(message);
    }
    
    return null;
}

// Show confirmation modal with callback
function showConfirmModal(message, callback) {
    // Initialize modals if they don't exist
    initializeModals();
    
    try {
        // Set modal content
        const modalElement = document.getElementById('globalConfirmationModal');
        const contentElement = document.getElementById('globalConfirmationModalContent');
        const confirmBtn = document.getElementById('globalConfirmModalBtn');
        
        if (modalElement && contentElement && confirmBtn) {
            contentElement.textContent = message;
            
            // Remove any existing event listeners
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add new event listener
            newConfirmBtn.addEventListener('click', function() {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                if (typeof callback === 'function') {
                    callback();
                }
            });
            
            // Create and show modal
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            return modal;
        } else {
            console.error('Confirmation modal elements not found');
            if (confirm(message) && typeof callback === 'function') {
                callback();
            }
        }
    } catch (error) {
        console.error('Error showing confirmation modal:', error);
        if (confirm(message) && typeof callback === 'function') {
            callback();
        }
    }
    
    return null;
}

// Show success modal
function showSuccessModal(message) {
    return showModal(message, 'success');
}

// Show error modal
function showErrorModal(message) {
    return showModal(message, 'error');
}

// Export functions
window.showModal = showModal;
window.showConfirmModal = showConfirmModal;
window.showSuccessModal = showSuccessModal;
window.showErrorModal = showErrorModal;
