/**
 * Core cropping functionality
 */

class ImageCropper {
    constructor(container, image, previewCanvas, options = {}) {
        this.container = container;
        this.image = image;
        this.previewCanvas = previewCanvas;
        this.ctx = previewCanvas.getContext('2d');

        // Configuration
        this.minCropSize = options.minCropSize || 50;
        this.initialCropRatio = options.initialCropRatio || 0.8;
        this.magnifierSize = options.magnifierSize || 100;
        this.magnifierZoom = options.magnifierZoom || 4;

        // State
        this.cropBox = null;
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null;
        this.startPos = { x: 0, y: 0 };
        this.cropState = { x: 0, y: 0, width: 0, height: 0 };
        this.startCropState = { x: 0, y: 0, width: 0, height: 0 };

        // Magnifier
        this.magnifier = null;
        this.magnifierCanvas = null;
        this.magnifierCtx = null;
        this.mousePos = { x: 0, y: 0 };

        // Initialize
        this.init();
    }

    init() {
        // Get existing crop box from DOM
        this.cropBox = document.getElementById('cropBox');

        // Initialize magnifier
        this.magnifier = document.getElementById('magnifier');
        this.magnifierCanvas = document.getElementById('magnifierCanvas');
        this.magnifierCtx = this.magnifierCanvas.getContext('2d');

        // Set magnifier canvas size
        this.magnifierCanvas.width = this.magnifierSize;
        this.magnifierCanvas.height = this.magnifierSize;

        // Wait for image to load
        if (this.image.complete) {
            this.initializeCropBox();
        } else {
            this.image.onload = () => this.initializeCropBox();
        }

        // Bind events
        this.bindEvents();

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.cropState.width > 0) {
                this.updateCropBox();
                this.updatePreview();
            }
        });
    }

    initializeCropBox() {
        const imgRect = this.image.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        // Calculate initial crop box size (80% of image)
        const cropWidth = imgRect.width * this.initialCropRatio;
        const cropHeight = imgRect.height * this.initialCropRatio;

        // Center the crop box
        const startX = (imgRect.width - cropWidth) / 2;
        const startY = (imgRect.height - cropHeight) / 2;

        this.cropState = {
            x: startX,
            y: startY,
            width: cropWidth,
            height: cropHeight
        };

        this.updateCropBox();
        this.updatePreview();

        // Show crop box
        this.cropBox.style.display = 'block';
    }

    bindEvents() {
        // Mouse events
        this.cropBox.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.cropBox.addEventListener('mousemove', (e) => this.onContainerMouseMove(e));
        this.container.addEventListener('mousemove', (e) => this.onContainerMouseMove(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());

        // Touch events for mobile
        this.cropBox.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', () => this.onMouseUp());
    }

    onMouseDown(e) {
        e.preventDefault();

        const handle = e.target.dataset.handle;

        if (handle) {
            // Resizing
            this.isResizing = true;
            this.activeHandle = handle;
        } else {
            // Dragging
            this.isDragging = true;
        }

        this.startPos = { x: e.clientX, y: e.clientY };
        this.startCropState = { ...this.cropState };
    }

    onMouseMove(e) {
        if (!this.isDragging && !this.isResizing) return;

        const deltaX = e.clientX - this.startPos.x;
        const deltaY = e.clientY - this.startPos.y;

        if (this.isDragging) {
            this.moveCropBox(deltaX, deltaY);
        } else if (this.isResizing) {
            this.resizeCropBox(deltaX, deltaY);
        }

        this.updateCropBox();
        this.updatePreview();
    }

    onMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null;
    }

    onTouchStart(e) {
        const touch = e.touches[0];
        this.onMouseDown({
            preventDefault: () => e.preventDefault(),
            target: e.target,
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    onTouchMove(e) {
        const touch = e.touches[0];
        this.onMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    moveCropBox(deltaX, deltaY) {
        const imgRect = this.image.getBoundingClientRect();

        let newX = this.startCropState.x + deltaX;
        let newY = this.startCropState.y + deltaY;

        // Constrain within image bounds
        newX = clamp(newX, 0, imgRect.width - this.cropState.width);
        newY = clamp(newY, 0, imgRect.height - this.cropState.height);

        this.cropState.x = newX;
        this.cropState.y = newY;
    }

    resizeCropBox(deltaX, deltaY) {
        const imgRect = this.image.getBoundingClientRect();

        let newX = this.startCropState.x;
        let newY = this.startCropState.y;
        let newWidth = this.startCropState.width;
        let newHeight = this.startCropState.height;

        const handle = this.activeHandle;

        // Handle different resize directions
        if (handle.includes('e')) {
            newWidth = clamp(
                this.startCropState.width + deltaX,
                this.minCropSize,
                imgRect.width - this.startCropState.x
            );
        }
        if (handle.includes('w')) {
            const maxDelta = this.startCropState.width - this.minCropSize;
            const validDelta = clamp(deltaX, -maxDelta, this.startCropState.x);
            newX = this.startCropState.x + validDelta;
            newWidth = this.startCropState.width - validDelta;
        }
        if (handle.includes('s')) {
            newHeight = clamp(
                this.startCropState.height + deltaY,
                this.minCropSize,
                imgRect.height - this.startCropState.y
            );
        }
        if (handle.includes('n')) {
            const maxDelta = this.startCropState.height - this.minCropSize;
            const validDelta = clamp(deltaY, -maxDelta, this.startCropState.y);
            newY = this.startCropState.y + validDelta;
            newHeight = this.startCropState.height - validDelta;
        }

        this.cropState = { x: newX, y: newY, width: newWidth, height: newHeight };
    }

    updateCropBox() {
        const imgRect = this.image.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        // Calculate position relative to image
        const offsetX = imgRect.left - containerRect.left;
        const offsetY = imgRect.top - containerRect.top;

        this.cropBox.style.left = (offsetX + this.cropState.x) + 'px';
        this.cropBox.style.top = (offsetY + this.cropState.y) + 'px';
        this.cropBox.style.width = this.cropState.width + 'px';
        this.cropBox.style.height = this.cropState.height + 'px';
    }

    updatePreview() {
        const imgRect = this.image.getBoundingClientRect();

        // Calculate scale factors
        const scaleX = this.image.naturalWidth / imgRect.width;
        const scaleY = this.image.naturalHeight / imgRect.height;

        // Calculate actual crop coordinates
        const actualX = this.cropState.x * scaleX;
        const actualY = this.cropState.y * scaleY;
        const actualWidth = this.cropState.width * scaleX;
        const actualHeight = this.cropState.height * scaleY;

        // Set canvas size
        this.previewCanvas.width = actualWidth;
        this.previewCanvas.height = actualHeight;

        // Draw cropped image
        this.ctx.drawImage(
            this.image,
            actualX, actualY, actualWidth, actualHeight,
            0, 0, actualWidth, actualHeight
        );

        // Return crop info for display
        return {
            width: Math.round(actualWidth),
            height: Math.round(actualHeight)
        };
    }

    getCropData() {
        const imgRect = this.image.getBoundingClientRect();
        const scaleX = this.image.naturalWidth / imgRect.width;
        const scaleY = this.image.naturalHeight / imgRect.height;

        return {
            x: this.cropState.x * scaleX,
            y: this.cropState.y * scaleY,
            width: this.cropState.width * scaleX,
            height: this.cropState.height * scaleY
        };
    }

    reset() {
        this.initializeCropBox();
    }

    // Magnifier methods
    showMagnifier() {
        if (this.magnifier) {
            this.magnifier.style.display = 'block';
        }
    }

    hideMagnifier() {
        if (this.magnifier) {
            this.magnifier.style.display = 'none';
        }
    }

    onContainerMouseMove(e) {
        // Update mouse position
        const rect = this.container.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;

        // Update magnifier position and content
        this.updateMagnifier();
    }

    updateMagnifier() {
        if (!this.magnifier || !this.image) return;

        const imgRect = this.image.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        // Check if mouse is over the crop box
        if (this.mousePos.x < this.cropState.x ||
            this.mousePos.x > this.cropState.x + this.cropState.width ||
            this.mousePos.y < this.cropState.y ||
            this.mousePos.y > this.cropState.y + this.cropState.height) {
            this.magnifier.style.display = 'none';
            return;
        }

        this.magnifier.style.display = 'block';

        // Calculate magnifier position (centered on mouse)
        const magnifierHalfSize = this.magnifierSize / 2;
        let magnifierX = this.mousePos.x - magnifierHalfSize;
        let magnifierY = this.mousePos.y - magnifierHalfSize;

        // Constrain magnifier within container
        magnifierX = clamp(magnifierX, 0, containerRect.width - this.magnifierSize);
        magnifierY = clamp(magnifierY, 0, containerRect.height - this.magnifierSize);

        this.magnifier.style.left = magnifierX + 'px';
        this.magnifier.style.top = magnifierY + 'px';

        // Calculate position relative to image
        const imageX = this.mousePos.x - (imgRect.left - containerRect.left);
        const imageY = this.mousePos.y - (imgRect.top - containerRect.top);

        // Calculate source rectangle on original image
        const scaleX = this.image.naturalWidth / imgRect.width;
        const scaleY = this.image.naturalHeight / imgRect.height;

        // Size of area to capture (magnifier size / zoom level)
        const sourceSize = this.magnifierSize / this.magnifierZoom;
        const sourceX = (imageX * scaleX) - (sourceSize * scaleX / 2);
        const sourceY = (imageY * scaleY) - (sourceSize * scaleY / 2);

        // Clear canvas
        this.magnifierCtx.clearRect(0, 0, this.magnifierSize, this.magnifierSize);

        // Draw magnified region
        this.magnifierCtx.drawImage(
            this.image,
            sourceX, sourceY, sourceSize * scaleX, sourceSize * scaleY,
            0, 0, this.magnifierSize, this.magnifierSize
        );

        // Draw crop box boundary in magnifier
        this.drawCropBoxInMagnifier(sourceX, sourceY, scaleX, scaleY);
    }

    drawCropBoxInMagnifier(sourceX, sourceY, scaleX, scaleY) {
        const imgRect = this.image.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        // Calculate crop box position in original image coordinates
        const cropBoxImageX = this.cropState.x * scaleX;
        const cropBoxImageY = this.cropState.y * scaleY;
        const cropBoxImageWidth = this.cropState.width * scaleX;
        const cropBoxImageHeight = this.cropState.height * scaleY;

        // Calculate crop box position relative to magnifier view
        // The magnifier shows area from (sourceX, sourceY) with size (sourceSize * scaleX, sourceSize * scaleY)
        const magnifierViewX = sourceX;
        const magnifierViewY = sourceY;
        const magnifierViewWidth = this.magnifierSize / this.magnifierZoom * scaleX;
        const magnifierViewHeight = this.magnifierSize / this.magnifierZoom * scaleY;

        // Calculate crop box position in magnifier canvas coordinates
        const magCanvasScaleX = this.magnifierSize / magnifierViewWidth;
        const magCanvasScaleY = this.magnifierSize / magnifierViewHeight;

        const cropBoxCanvasX = (cropBoxImageX - magnifierViewX) * magCanvasScaleX;
        const cropBoxCanvasY = (cropBoxImageY - magnifierViewY) * magCanvasScaleY;
        const cropBoxCanvasWidth = cropBoxImageWidth * magCanvasScaleX;
        const cropBoxCanvasHeight = cropBoxImageHeight * magCanvasScaleY;

        // Draw crop box boundary
        this.magnifierCtx.strokeStyle = '#3b82f6';
        this.magnifierCtx.lineWidth = 3;
        this.magnifierCtx.setLineDash([8, 4]);

        this.magnifierCtx.strokeRect(
            cropBoxCanvasX,
            cropBoxCanvasY,
            cropBoxCanvasWidth,
            cropBoxCanvasHeight
        );

        // Reset line dash
        this.magnifierCtx.setLineDash([]);
    }

    destroy() {
        if (this.cropBox) {
            this.cropBox.style.display = 'none';
        }
    }
}
