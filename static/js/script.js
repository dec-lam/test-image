document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const uploadBox = document.querySelector('.upload-box');
    const uploadButton = document.getElementById('uploadButton');
    const preview = document.getElementById('preview');
    const result = document.getElementById('result');
    const loader = document.getElementById('loader');

    // Click handler for upload button
    uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        imageInput.click();
    });

    // ... (keep existing drag and drop handlers) ...

    // File input change handler (updated for multiple uploads)
    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 0) {
            // Clear previous results and preview
            preview.style.display = 'block';
            result.innerHTML = '';
            handleImage(imageInput.files[0]);
        }
    });

    async function handleImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Show preview
        preview.style.display = 'block';
        preview.src = URL.createObjectURL(file);

        // Prepare form data
        const formData = new FormData();
        formData.append('image', file);

        try {
            loader.style.display = 'block';
            result.innerHTML = '';
            
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.analysis) {
                // Format the comma-separated list into HTML
                const foods = data.analysis.split(',').map(food => food.trim());
                result.innerHTML = `
                    <h3>Detected Food Items:</h3>
                    <ul class="food-list">
                        ${foods.map(food => `<li>${food}</li>`).join('')}
                    </ul>
                    <button onclick="clearUpload()" class="upload-button">Analyze Another Image</button>
                `;
            } else {
                result.innerHTML = `<div class="error">Error: ${data.error || 'Unknown error'}</div>`;
            }
        } catch (error) {
            result.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        } finally {
            loader.style.display = 'none';
            URL.revokeObjectURL(preview.src);
            // Reset file input for new uploads
            imageInput.value = '';
        }
    }

    // Add to global scope for button click
    window.clearUpload = () => {
        preview.style.display = 'none';
        result.innerHTML = '';
        imageInput.value = '';
    };
});