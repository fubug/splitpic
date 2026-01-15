/**
 * 裁剪应用控制器
 * 从 cutcut/js/app.js 修改而来，适配标签页模式
 */

class CropApp {
    constructor() {
        // DOM elements - 使用crop前缀的ID
        this.uploadSection = document.getElementById('crop-uploadSection');
        this.cropperSection = document.getElementById('cropperSection');
        this.uploadArea = document.getElementById('crop-uploadArea');
        this.fileInput = document.getElementById('crop-fileInput');
        this.sourceImage = document.getElementById('crop-sourceImage');
        this.imageContainer = document.getElementById('crop-imageContainer');
        this.previewCanvas = document.getElementById('crop-previewCanvas');
        this.cropSizeDisplay = document.getElementById('crop-cropSize');

        // Buttons
        this.resetBtn = document.getElementById('crop-resetBtn');
        this.cropBtn = document.getElementById('crop-cropBtn');
        this.downloadBtn = document.getElementById('crop-downloadBtn');

        // State
        this.cropper = null;
        this.currentFile = null;
        this.isCropped = false;
        this.isActive = false;

        // Initialize
        this.init();
    }

    init() {
        this.bindUploadEvents();
        this.bindButtonEvents();
        this.bindKeyboardEvents();
        this.isActive = true;
    }

    activate() {
        if (!this.isActive) {
            this.isActive = true;
            console.log('裁剪应用已激活');
        }
    }

    deactivate() {
        if (this.isActive) {
            this.isActive = false;
            console.log('裁剪应用已停用');
        }
    }

    bindUploadEvents() {
        // Click to upload
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    bindButtonEvents() {
        this.resetBtn.addEventListener('click', () => this.reset());
        this.cropBtn.addEventListener('click', () => this.performCrop());
        this.downloadBtn.addEventListener('click', () => this.download());
    }

    bindKeyboardEvents() {
        this.keyboardHandler = (e) => {
            // Only handle keyboard events when crop tab is active
            if (!this.isActive) return;

            // Escape to reset
            if (e.key === 'Escape' && this.cropper) {
                this.reset();
            }

            // Enter to crop (when not cropping)
            if (e.key === 'Enter' && !this.isCropped && this.cropper) {
                this.performCrop();
            }
        };
        document.addEventListener('keydown', this.keyboardHandler);
    }

    async handleFileSelect(file) {
        // Validate file
        if (!isValidImageFile(file)) {
            showError('请选择有效的图片文件 (JPEG, PNG, GIF, WebP)');
            return;
        }

        if (!isValidFileSize(file)) {
            showError('图片大小不能超过 30MB');
            return;
        }

        this.currentFile = file;

        try {
            // Read and load image
            const dataUrl = await readFileAsDataURL(file);
            await loadImage(dataUrl);

            // Set image source
            this.sourceImage.src = dataUrl;

            // Switch to cropper interface
            this.showCropperInterface();

        } catch (error) {
            showError('加载图片失败: ' + error.message);
            console.error(error);
        }
    }

    showCropperInterface() {
        this.uploadSection.hidden = true;
        this.cropperSection.hidden = false;
        this.cropperSection.classList.add('fade-in');

        // Wait for image to load before initializing cropper
        this.sourceImage.onload = () => {
            this.initializeCropper();
        };

        // Handle already loaded image
        if (this.sourceImage.complete) {
            this.initializeCropper();
        }
    }

    initializeCropper() {
        // Destroy existing cropper if any
        if (this.cropper) {
            this.cropper.destroy();
        }

        // Create new cropper
        this.cropper = new ImageCropper(
            this.imageContainer,
            this.sourceImage,
            this.previewCanvas
        );

        // Update crop size display
        this.updateCropSize();
    }

    updateCropSize() {
        if (!this.cropper) return;

        // Update preview and get size info
        const size = this.cropper.updatePreview();
        this.cropSizeDisplay.textContent = `${size.width} × ${size.height} px`;
    }

    performCrop() {
        if (!this.cropper) return;

        // Update preview with final crop
        const size = this.cropper.updatePreview();
        this.cropSizeDisplay.textContent = `${size.width} × ${size.height} px`;

        // Enable download
        this.downloadBtn.disabled = false;
        this.isCropped = true;

        showSuccess('裁剪完成！可以下载了');
    }

    download() {
        if (!this.isCropped) return;

        const originalName = this.currentFile.name.replace(/\.[^/.]+$/, '');
        downloadCanvas(this.previewCanvas, `${originalName}-cropped`, 'png');
    }

    reset() {
        if (this.cropper) {
            this.cropper.reset();
        }

        this.downloadBtn.disabled = true;
        this.isCropped = false;
        this.updateCropSize();
    }

    destroy() {
        // Clean up event listeners
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }

        // Destroy cropper
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }

        this.isActive = false;
    }
}
