document.addEventListener('DOMContentLoaded', () => {
    // دریافت آیدی محصول از URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // یافتن المنت‌های مورد نیاز
    const productDetailContainer = document.querySelector('.product-detail-container');
    const mainImage = document.getElementById('main-product-image');
    const thumbnailsContainer = document.querySelector('.thumbnail-slider');
    const thumbnailWrapper = document.querySelector('.thumbnail-slider-wrapper');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const returnButton = document.getElementById('return-button');

    let currentImageIndex = 0;
    let isAnimating = false;
    let allProductImages = [];
    let totalImages = 0;

    // ✅ لیست فایل‌های JSON که باید لود شوند
    const jsonFiles = [
        'watchesdata.json',
        'necklacesdata.json',
        'braceletsdata.json'
    ];

    // ============================================
    // ✅ تابع لود کردن چند فایل JSON
    // ============================================
    async function loadAllProducts() {
        try {
            const allProducts = [];
            
            // لود کردن همه فایل‌های JSON به صورت همزمان
            const promises = jsonFiles.map(url => 
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`فایل ${url} پیدا نشد، ادامه می‌دهیم...`);
                            return null;
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.warn(`خطا در لود ${url}:`, error);
                        return null;
                    })
            );
            
            const results = await Promise.all(promises);
            
            // ترکیب همه داده‌ها در یک آرایه
            results.forEach(data => {
                if (data && Array.isArray(data)) {
                    allProducts.push(...data);
                } else if (data && !Array.isArray(data)) {
                    allProducts.push(data);
                }
            });
            
            console.log(`✅ ${allProducts.length} محصول از ${jsonFiles.length} فایل لود شد`);
            return allProducts;
            
        } catch (error) {
            console.error('❌ خطا در لود فایل‌های JSON:', error);
            return [];
        }
    }

    // ============================================
    // ✅ تابع پیدا کردن محصول بر اساس ID
    // ============================================
    async function fetchProductData() {
        const allProducts = await loadAllProducts();
        
        if (allProducts.length === 0) {
            productDetailContainer.innerHTML = `
                <h1 style="color: red; text-align: center; width: 100%; padding: 50px;">
                    ❌ خطا در بارگذاری اطلاعات محصولات.
                </h1>
            `;
            return;
        }
        
        const product = allProducts.find(p => p.id === productId);
        
        if (product) {
            displayProductDetails(product);
        } else {
            console.error("Product not found!");
            productDetailContainer.innerHTML = `
                <h1 style="color: red; text-align: center; width: 100%; padding: 50px;">
                    ❌ محصول مورد نظر یافت نشد.
                </h1>
            `;
        }
    }

    // ============================================
    // ✅ نمایش جزئیات محصول (بدون تغییر)
    // ============================================
    function displayProductDetails(product) {
        document.title = `جزئیات: ${product.name}`;

        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-code').textContent = `کد محصول : ${product.product_code || ''}`;
        document.getElementById('product-price').textContent = product.price;
        document.getElementById('product-description').textContent = product.description;
        document.getElementById('product-description_2').textContent = product.description_2 || '';

        // بارگذاری تصاویر
        if (product.image_urls && product.image_urls.length > 0) {
            allProductImages = product.image_urls;
            totalImages = allProductImages.length;
            mainImage.src = allProductImages[0];
            currentImageIndex = 0;

            thumbnailsContainer.innerHTML = '';
            allProductImages.forEach((url, index) => {
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.alt = `${product.name} - تصویر ${index + 1}`;
                thumb.classList.add('thumbnail');
                if (index === 0) {
                    thumb.classList.add('active');
                }
                thumb.addEventListener('click', () => showImage(index));
                thumbnailsContainer.appendChild(thumb);
            });
            updateNavButtons();
        } else {
            mainImage.src = 'placeholder.jpg';
            thumbnailsContainer.innerHTML = '<p>تصویری برای این محصول موجود نیست.</p>';
            updateNavButtons();
        }

        // نمایش مشخصات
        const specsList = document.getElementById('specs-list');
        specsList.innerHTML = '';
        if (product.specs) {
            for (const [key, value] of Object.entries(product.specs)) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="specs-key">${key}:</span> <span class="specs-value">${value}</span>`;
                specsList.appendChild(li);
            }
        }
    }

    // ============================================
    // ✅ توابع نمایش تصویر (بدون تغییر)
    // ============================================
    function showImage(index) {
        const validIndex = (index % totalImages + totalImages) % totalImages;

        if (isAnimating || validIndex === currentImageIndex) return;

        isAnimating = true;
        const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');

        thumbnails[currentImageIndex].classList.remove('active');

        let animationClassOut = '';
        let animationClassIn = '';
        if (validIndex > currentImageIndex) {
            animationClassOut = 'slide-out-right';
            animationClassIn = 'slide-in-left';
        } else {
            animationClassOut = 'slide-out-left';
            animationClassIn = 'slide-in-right';
        }

        mainImage.classList.remove('slide-out-left', 'slide-in-right', 'slide-out-right', 'slide-in-left');
        mainImage.classList.add(animationClassOut);

        setTimeout(() => {
            mainImage.src = allProductImages[validIndex];
            mainImage.classList.remove(animationClassOut);
            mainImage.classList.add(animationClassIn);

            thumbnails[validIndex].classList.add('active');
            currentImageIndex = validIndex;

            setTimeout(() => {
                mainImage.classList.remove(animationClassIn);
                isAnimating = false;
            }, 400);
        }, 400);

        scrollThumbnailIntoView(validIndex);
        updateNavButtons();
    }

    function updateNavButtons() {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    }

    function scrollThumbnailIntoView(index) {
        const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
        if (thumbnails.length > 0 && thumbnails[index]) {
            thumbnails[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // ============================================
    // ✅ Event Listeners
    // ============================================
    nextBtn.addEventListener('click', () => {
        showImage(currentImageIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
        showImage(currentImageIndex - 1);
    });

    if (returnButton) {
        returnButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // ============================================
    // ✅ اجرای اولیه
    // ============================================
    if (!productId) {
        console.error("Product ID not found in URL!");
        productDetailContainer.innerHTML = `
            <h1 style="color: red; text-align: center; width: 100%; padding: 50px;">
                ❌ شناسه محصول در آدرس صفحه یافت نشد.
            </h1>
        `;
    } else {
        fetchProductData();
    }
});