// ============================================
// ✅ منوی همبرگری و سایدبار
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const body = document.body;
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const hasSubmenuLinks = document.querySelectorAll('.has-submenu > a');

    // باز و بسته کردن منو
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarMenu.classList.toggle('open');
            hamburgerMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }

    // بستن منو با کلیک روی لینک‌ها
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const isProductLink = link.closest('.has-submenu') || 
                                 link.parentElement.classList.contains('has-submenu');
            
            // اگر روی "محصولات" کلیک شد، زیرمنو باز/بسته شود
            if (link.parentElement.classList.contains('has-submenu')) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
                return;
            }
            
            // اگر روی آیتم‌های زیرمنو کلیک شد، منو بسته شود
            if (!isProductLink || link.closest('.submenu')) {
                sidebarMenu.classList.remove('open');
                hamburgerMenu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    });

    // بستن منو با کلیک خارج از آن
    document.addEventListener('click', (e) => {
        if (sidebarMenu && !sidebarMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
            sidebarMenu.classList.remove('open');
            hamburgerMenu.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });

    // ============================================
    // ✅ جستجوی هدر (Universal Search) با پیشنهادات
    // ============================================
    const universalSearchInput = document.getElementById('universalSearchInput');
    const universalSearchButton = document.getElementById('universalSearchButton');
    const universalSearchSuggestions = document.getElementById('universalSearchSuggestions');
    let allProductsForHeader = [];
    let isLoadingHeader = false;
    let searchTimeout = null; // برای تاخیر در نمایش پیشنهادات

    // ✅ لیست فایل‌های JSON برای هدر
    const headerJsonFiles = [
        'watchesdata.json',
        'necklacesdata.json',
        'braceletsdata.json'
    ];

    // ============================================
    // ✅ لود کردن چند فایل JSON برای هدر
    // ============================================
    async function loadHeaderProducts() {
        if (isLoadingHeader) return;
        isLoadingHeader = true;

        try {
            const allProductsData = [];
            
            const promises = headerJsonFiles.map(url => 
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`⚠️ فایل ${url} برای هدر پیدا نشد`);
                            return null;
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.warn(`⚠️ خطا در لود ${url} برای هدر:`, error);
                        return null;
                    })
            );
            
            const results = await Promise.all(promises);
            
            results.forEach(data => {
                if (data) {
                    if (Array.isArray(data)) {
                        allProductsData.push(...data);
                    } else {
                        allProductsData.push(data);
                    }
                }
            });
            
            // اضافه کردن نمونه Casio اگر وجود نداشت
            const casioExample = {
                "id": "Casio",
                "name": "ساعت Casio",
                "price": "1,000,000 تومان",
                "product_code": "RA-005",
                "keywords": ["کاسیو", "ساعت", "کلاسیک", "مینیمال"]
            };
            
            if (!allProductsData.some(p => p.id === casioExample.id)) {
                allProductsData.unshift(casioExample);
            }
            
            console.log(`✅ ${allProductsData.length} محصول برای هدر لود شد`);
            allProductsForHeader = allProductsData;
            return allProductsData;
            
        } catch (error) {
            console.error('❌ خطا در لود فایل‌های هدر:', error);
            return [];
        } finally {
            isLoadingHeader = false;
        }
    }

    // ============================================
    // ✅ توابع جستجوی هدر با پیشنهادات
    // ============================================
    
    // اجرای جستجو و هدایت به صفحه نتایج
    function performUniversalSearch(term) {
        if (term && term.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(term.trim())}`;
        }
    }

    // تولید پیشنهادات بر اساس عبارت جستجو
    function generateUniversalSuggestions(term) {
        if (!term || term.length < 1 || allProductsForHeader.length === 0) return [];
        
        const uniqueSuggestions = new Set();
        const lowerCaseTerm = term.toLowerCase();

        allProductsForHeader.forEach(product => {
            // نام محصول
            if (product.name && product.name.toLowerCase().includes(lowerCaseTerm)) {
                uniqueSuggestions.add(product.name);
            }
            // کد محصول
            if (product.product_code && product.product_code.toLowerCase().includes(lowerCaseTerm)) {
                uniqueSuggestions.add(`کد: ${product.product_code}`);
            }
            // کلمات کلیدی
            if (product.keywords && Array.isArray(product.keywords)) {
                product.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(lowerCaseTerm)) {
                        uniqueSuggestions.add(keyword);
                    }
                });
            }
        });
        
        return Array.from(uniqueSuggestions).slice(0, 7);
    }

    // نمایش پیشنهادات در باکس زیر جستجو
    function displayUniversalSuggestions(suggestions, searchTerm) {
        if (!universalSearchSuggestions) return;
        
        universalSearchSuggestions.innerHTML = '';
        
        if (suggestions.length > 0) {
            // اضافه کردن عبارت جستجو به عنوان پیشنهاد اول
            if (searchTerm && searchTerm.trim()) {
                const searchItem = document.createElement('div');
                searchItem.className = 'universal-suggestion-item suggestion-search';
                searchItem.innerHTML = `🔍 جستجو برای "<strong>${searchTerm}</strong>"`;
                searchItem.addEventListener('click', () => {
                    universalSearchInput.value = searchTerm;
                    universalSearchSuggestions.classList.remove('active');
                    performUniversalSearch(searchTerm);
                });
                universalSearchSuggestions.appendChild(searchItem);
            }
            
            // جداساز
            if (searchTerm && searchTerm.trim() && suggestions.length > 0) {
                const divider = document.createElement('div');
                divider.className = 'suggestion-divider';
                divider.textContent = 'پیشنهادات';
                universalSearchSuggestions.appendChild(divider);
            }
            
            // نمایش پیشنهادات
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'universal-suggestion-item';
                
                // هایلایت کردن عبارت جستجو در پیشنهادات
                const highlightedText = highlightMatch(suggestion, searchTerm);
                item.innerHTML = highlightedText;
                
                item.addEventListener('click', () => {
                    universalSearchInput.value = suggestion;
                    universalSearchSuggestions.classList.remove('active');
                    performUniversalSearch(suggestion);
                });
                universalSearchSuggestions.appendChild(item);
            });
            
            universalSearchSuggestions.classList.add('active');
        } else {
            // اگر پیشنهادی وجود نداشت، پیام "نتیجه‌ای یافت نشد" نمایش داده شود
            if (searchTerm && searchTerm.trim().length >= 2) {
                const noResult = document.createElement('div');
                noResult.className = 'universal-suggestion-item no-result';
                noResult.textContent = '❌ نتیجه‌ای برای جستجوی شما یافت نشد';
                universalSearchSuggestions.appendChild(noResult);
                universalSearchSuggestions.classList.add('active');
            } else {
                universalSearchSuggestions.classList.remove('active');
            }
        }
    }

    // تابع هایلایت کردن متن
    function highlightMatch(text, searchTerm) {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="highlight">$1</mark>');
    }

    // ============================================
    // ✅ Event Listeners جستجوی هدر با پیشنهادات
    // ============================================
    if (universalSearchInput) {
        // رویداد تایپ با تاخیر (Debounce)
        universalSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            
            const term = universalSearchInput.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (term.length >= 1 && allProductsForHeader.length > 0) {
                    const suggestions = generateUniversalSuggestions(term);
                    displayUniversalSuggestions(suggestions, term);
                } else {
                    if (universalSearchSuggestions) {
                        universalSearchSuggestions.classList.remove('active');
                    }
                }
            }, 300); // تاخیر 300 میلی‌ثانیه
        });

        // رویداد Enter
        universalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const term = universalSearchInput.value.trim();
                if (term) {
                    performUniversalSearch(term);
                    if (universalSearchSuggestions) {
                        universalSearchSuggestions.classList.remove('active');
                    }
                }
            }
        });

        // رویداد فوکوس برای نمایش پیشنهادات
        universalSearchInput.addEventListener('focus', () => {
            const term = universalSearchInput.value.trim();
            if (term.length >= 1 && allProductsForHeader.length > 0) {
                const suggestions = generateUniversalSuggestions(term);
                displayUniversalSuggestions(suggestions, term);
            }
        });

        // رویداد خروج از فوکوس با تاخیر
        universalSearchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (universalSearchSuggestions) {
                    universalSearchSuggestions.classList.remove('active');
                }
            }, 200);
        });
    }

    // رویداد کلیک دکمه جستجو
    if (universalSearchButton) {
        universalSearchButton.addEventListener('click', () => {
            const term = universalSearchInput?.value || '';
            performUniversalSearch(term);
            if (universalSearchSuggestions) {
                universalSearchSuggestions.classList.remove('active');
            }
        });
    }

    // ============================================
    // ✅ بستن پیشنهادات با کلیک خارج
    // ============================================
    document.addEventListener('click', (e) => {
        if (universalSearchSuggestions && 
            !universalSearchSuggestions.contains(e.target) && 
            !universalSearchInput?.contains(e.target) &&
            !universalSearchButton?.contains(e.target)) {
            universalSearchSuggestions.classList.remove('active');
        }
    });

    // ============================================
    // ✅ کلید ESC برای بستن پیشنهادات
    // ============================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && universalSearchSuggestions) {
            universalSearchSuggestions.classList.remove('active');
            if (universalSearchInput) {
                universalSearchInput.blur();
            }
        }
    });

    // ============================================
    // ✅ مقداردهی اولیه
    // ============================================
    async function initHeader() {
        await loadHeaderProducts();
        
        // اگر پارامتر جستجو در URL وجود داشت
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery && universalSearchInput) {
            universalSearchInput.value = searchQuery;
            // نمایش پیشنهادات برای عبارت جستجو
            const suggestions = generateUniversalSuggestions(searchQuery);
            displayUniversalSuggestions(suggestions, searchQuery);
        }
    }

    initHeader();

    // ============================================
    // ✅ بهینه‌سازی برای موبایل
    // ============================================
    if (body) {
        const style = document.createElement('style');
        style.textContent = `
            body.menu-open {
                overflow: hidden;
                position: fixed;
                width: 100%;
                height: 100%;
            }
            
            /* استایل هایلایت در پیشنهادات */
            .highlight {
                background: #e8d5f5;
                color: #6a1b9a;
                font-weight: 600;
                padding: 0 2px;
                border-radius: 3px;
            }
            
            /* استایل جداساز */
            .suggestion-divider {
                padding: 8px 18px;
                font-size: 0.8em;
                color: #999;
                border-bottom: 1px solid #eee;
                margin-bottom: 5px;
                font-weight: 500;
            }
            
            /* استایل آیتم جستجو */
            .suggestion-search {
                background: #f8f5ff;
                border-bottom: 1px solid #eee;
                font-weight: 500;
            }
            
            .suggestion-search:hover {
                background: #ede7f6;
            }
            
            /* استایل بدون نتیجه */
            .no-result {
                color: #999;
                cursor: default;
                text-align: center;
            }
            
            .no-result:hover {
                background: transparent;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
});