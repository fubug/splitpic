// ZIP库加载器 - 动态加载JSZip库
class ZipLoader {
    constructor() {
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
    }

    /**
     * 加载JSZip库
     * @returns {Promise<void>}
     */
    async load() {
        if (this.isLoaded) {
            return;
        }

        if (this.isLoading) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadPromise = this.loadJSZip();

        try {
            await this.loadPromise;
            this.isLoaded = true;
        } catch (error) {
            console.error('JSZip加载失败:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 动态加载JSZip库
     * @returns {Promise<void>}
     */
    loadJSZip() {
        return new Promise((resolve, reject) => {
            // 检查是否已经存在
            if (typeof JSZip !== 'undefined') {
                resolve();
                return;
            }

            // 创建script标签
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
            script.async = true;

            script.onload = () => {
                if (typeof JSZip !== 'undefined') {
                    resolve();
                } else {
                    reject(new Error('JSZip加载失败'));
                }
            };

            script.onerror = () => {
                reject(new Error('JSZip加载网络错误'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * 检查是否可用
     * @returns {boolean}
     */
    isAvailable() {
        return this.isLoaded || (typeof JSZip !== 'undefined');
    }
}

// 创建全局实例
window.zipLoader = new ZipLoader();