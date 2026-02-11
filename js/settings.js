/**
 * Settings Modal Logic
 * Handles API key configuration UI
 */

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsButton');
    const modal = document.getElementById('settingsModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelModal');
    const saveBtn = document.getElementById('saveApiKey');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const toggleBtn = document.getElementById('toggleApiKey');

    // Load existing API key on page load
    const existingKey = getApiKey();
    if (existingKey) {
        apiKeyInput.value = existingKey;
    }

    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        apiKeyInput.focus();
    });

    // Close modal
    const closeModal = () => {
        modal.classList.add('hidden');
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    });

    // Save API key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            alert('Please enter an API key');
            return;
        }

        saveApiKey(apiKey);
        closeModal();

        // Show success message
        alert('✅ API key saved successfully! You can now analyze stocks.');

        // Reload the page to pick up new API key
        location.reload();
    });

    // Save on Enter key
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });

    // Show settings modal automatically if no API key is configured
    if (!isApiKeyConfigured()) {
        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 1000);
    }
});
