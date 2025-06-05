// Vehicle data structure and fake data generation
class VehicleGallery {
    constructor() {
        this.allVehicles = [];
        this.filteredVehicles = [];
        this.displayedCount = 0;
        this.itemsPerPage = 20;
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.currentCompany = null;
        this.currentModalIndex = 0;
        this.currentVehicleImages = [];
        
        // Additional filters
        this.currentFilters = {
            year: '',
            location: '',
            salesRep: ''
        };
        
        // Masonry grid properties
        this.columnHeights = [];
        this.columnCount = 0;
        this.itemWidth = 240;
        this.horizontalGap = 20;
        this.verticalGap = 20; // Tighter vertical spacing
        
        this.init();
    }

    async init() {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        this.generateFakeData();
        this.populateFilterOptions();
        this.checkURLParams();
        this.setupEventListeners();
        this.initializeMasonryGrid();
        
        // Small delay to ensure CSS is loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.loadInitialItems();
    }

    populateFilterOptions() {
        // Extract unique years
        const years = [...new Set(this.allVehicles.map(v => this.extractYear(v.truck)))].sort((a, b) => b - a);
        const yearFilter = document.getElementById('yearFilter');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Extract unique locations (states from owner field)
        const locations = [...new Set(this.allVehicles.map(v => {
            const parts = v.owner.split(',');
            return parts[parts.length - 1].trim(); // Get the state part
        }))].sort();
        const locationFilter = document.getElementById('locationFilter');
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });

        // Extract unique sales reps
        const salesReps = [...new Set(this.allVehicles.map(v => v.salesRep))].sort();
        const salesRepFilter = document.getElementById('salesRepFilter');
        salesReps.forEach(rep => {
            const option = document.createElement('option');
            option.value = rep;
            option.textContent = rep;
            salesRepFilter.appendChild(option);
        });
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const company = urlParams.get('company');
        if (company) {
            this.currentCompany = decodeURIComponent(company);
            this.showCompanyFilter(this.currentCompany);
        }
    }

    showCompanyFilter(companyName) {
        const filterEl = document.getElementById('companyFilter');
        const nameEl = document.getElementById('companyFilterName');
        nameEl.textContent = companyName;
        filterEl.classList.add('active');
    }

    hideCompanyFilter() {
        const filterEl = document.getElementById('companyFilter');
        filterEl.classList.remove('active');
    }

    initializeMasonryGrid() {
        this.calculateColumns();
        this.resetColumnHeights();
        
        // Recalculate on window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.calculateColumns();
                this.resetColumnHeights();
                this.updateImageHeightsForViewport();
                this.repositionItems();
            }, 100);
        });
    }

    calculateColumns() {
        const container = document.getElementById('imageGrid');
        const containerWidth = container.offsetWidth;
        
        // Adjust item width based on screen size for 5 columns on desktop, 2 on mobile
        if (window.innerWidth <= 600) {
            // 2 columns on mobile and small tablets - account for container padding
            const availableWidth = containerWidth - this.horizontalGap; // Just account for gap between columns
            this.itemWidth = Math.floor(availableWidth / 2);
            // Ensure minimum width for readability
            this.itemWidth = Math.max(this.itemWidth, 140);
        } else if (window.innerWidth <= 768) {
            this.itemWidth = 180; // Slightly smaller for better fit
        } else if (window.innerWidth <= 1024) {
            this.itemWidth = 220;
        } else {
            this.itemWidth = 240; // Smaller width to ensure 5 columns
        }
        
        this.columnCount = Math.floor(containerWidth / (this.itemWidth + this.horizontalGap));
        this.columnCount = Math.max(1, this.columnCount); // At least 1 column
        
        // For mobile, force 2 columns if window is ≤600px
        if (window.innerWidth <= 600) {
            this.columnCount = 2;
        }
        
        // Center the grid by calculating left offset
        const totalWidth = this.columnCount * this.itemWidth + (this.columnCount - 1) * this.horizontalGap;
        this.leftOffset = (containerWidth - totalWidth) / 2;
    }

    resetColumnHeights() {
        this.columnHeights = new Array(this.columnCount).fill(0);
    }

    getShortestColumn() {
        let shortestIndex = 0;
        let shortestHeight = this.columnHeights[0];
        
        for (let i = 1; i < this.columnHeights.length; i++) {
            if (this.columnHeights[i] < shortestHeight) {
                shortestHeight = this.columnHeights[i];
                shortestIndex = i;
            }
        }
        
        return shortestIndex;
    }

    positionItem(item, columnIndex) {
        const x = this.leftOffset + columnIndex * (this.itemWidth + this.horizontalGap);
        const y = this.columnHeights[columnIndex];
        
        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        item.style.width = `${this.itemWidth}px`;
        
        return item.offsetHeight;
    }

    async repositionItems() {
        const items = document.querySelectorAll('.gallery-item');
        this.resetColumnHeights();
        
        // Force reflow to ensure accurate height calculations
        document.getElementById('imageGrid').offsetHeight;
        
        for (let item of items) {
            if (!item.style.display || item.style.display !== 'none') {
                // Ensure image is loaded before positioning
                const img = item.querySelector('img');
                if (img && (!img.complete || img.naturalHeight === 0)) {
                    await new Promise(resolve => {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                        setTimeout(resolve, 1000); // Fallback timeout
                    });
                }
                
                const columnIndex = this.getShortestColumn();
                this.positionItem(item, columnIndex);
                
                // Force layout recalculation
                item.offsetHeight;
                
                const actualHeight = item.offsetHeight;
                this.columnHeights[columnIndex] += actualHeight + this.verticalGap;
            }
        }
        
        // Update container height
        const maxHeight = Math.max(...this.columnHeights);
        document.getElementById('imageGrid').style.height = `${maxHeight}px`;
    }

    generateImageHeight() {
        // Generate varying heights for Pinterest effect with mobile-responsive ranges
        if (window.innerWidth <= 600) {
            // Mobile: smaller range but still varied (120-200px)
            const baseHeight = 120;
            const variation = 80;
            return baseHeight + Math.floor(Math.random() * variation);
        } else if (window.innerWidth <= 768) {
            // Tablet: medium range (140-240px)
            const baseHeight = 140;
            const variation = 100;
            return baseHeight + Math.floor(Math.random() * variation);
        } else {
            // Desktop: full range (180-350px)
            const baseHeight = 180;
            const variation = 170;
            return baseHeight + Math.floor(Math.random() * variation);
        }
    }

    generateFakeData() {
        // Get list of available images
        const imageFiles = [
            '21267-1-century-1075s-3-stage-heavy-duty-rotator-2024-kenworth-t-880.jpg',
            '21918-0-century-12-series-steel-lcg-car-carrier-2025-freightliner-m-2.jpg',
            '22519-1-century-10-series-steel-car-carrier-2023-chevrolet-6500.jpg',
            '19782-1-century-12-series-steel-lcg-car-carrier-2024-hino-lx-6.jpg',
            '20505-1-chevron-408vt-renegade-wrecker-2024-ram-5500.jpg',
            '22200-1-century-1150s-heavy-duty-rotator-2025-peterbilt-389.jpg',
            '20737-1-century-12-series-steel-lcg-car-carrier-2024-kenworth-t-280.jpg',
            '20744-1-century-12-series-steel-car-carrier-2024-kenworth-t-280.jpg',
            '20743-1-century-12-series-steel-lcg-car-carrier-2024-kenworth-t-280.jpg',
            '22494-1-century-2465-light-duty-wrecker-2024-ford-f-600.jpg',
            '21848-1-century-1150-heavy-duty-rotator-2025-peterbilt-567s.jpg',
            '21752-1-century-16-series-steel-lcg-car-carrier-2025-international-mv.jpg',
            '22067-1-century-12-series-aluminum-lcg-car-carrier-2025-international-mv-x.jpg',
            '22076-1-century-20-series-aluminum-4-car-carrier-2025-international-mv.jpg',
            '21772-1-century-16-series-steel-lcg-car-carrier-2025-ford-f-750.jpg',
            '20027-1-century-12-series-steel-lcg-car-carrier-2025-freightliner-m2.jpg',
            '19740-1-century-steel-12-series-lcg-car-carrier-2025-international-mv-x.jpg',
            '22058-1-century-12-series-steel-lcg-car-carrier-2025-international-mv-x.jpg',
            '20875-1-century-12-series-aluminum-lcg-car-carrier-2025-kenworth-t-280.jpg',
            '21250-1-century-4024-20-ton-wrecker-2024-peterbilt-537.jpg',
            '22072-1-century-12-series-steel-lcg-car-carrier-2025-international-mv.jpg',
            '21506-1-vulcan-810cw-ptsl-4-ton-light-duty-wrecker-2024-dodge-ram-4500hd.jpg',
            '21285-17-century-12-series-steel-car-carrier-2025-freightliner-m2.jpg',
            '21886-1-century-12-series-steel-car-carrier-2025-international-mv-x.jpg',
            '22179-1-century-12-series-steel-lcg-car-carrier-2025-freightliner-m2-x.jpg',
            '22314-1-century-12-series-steel-lcg-car-carrier-2025-freightliner-m2-x.jpg',
            '22315-1-century-12-series-lcg-car-carrier-2025-freightliner-m2-x.jpg',
            '22358-1-century-1150-heavy-duty-rotator-2018-peterbilt-389ec.jpg',
            '19760-1-century-steel-12-series-lcg-car-carrier-2024-hino-l6.jpg'
        ];

        const companies = [
            'Phantom Towing LLC, Hayward, CA',
            'Elite Recovery Services, Phoenix, AZ',
            'Metro Towing Group, Dallas, TX',
            'Mountain View Auto Transport, Denver, CO',
            'Coastal Carriers Inc, Miami, FL',
            'Northern Lights Towing, Seattle, WA',
            'Desert Eagle Transport, Las Vegas, NV',
            'Atlantic Recovery, Boston, MA',
            'Midwest Heavy Haul, Chicago, IL',
            'Pacific Coast Towing, San Diego, CA',
            'Thunder Road Recovery, Nashville, TN',
            'Steel City Towing, Pittsburgh, PA',
            'Lone Star Carriers, Houston, TX',
            'Golden Gate Towing, San Francisco, CA',
            'Liberty Recovery Services, Philadelphia, PA',
            'Motor City Towing, Detroit, MI',
            'Sunshine State Transport, Orlando, FL',
            'Rocky Mountain Recovery, Salt Lake City, UT',
            'Bayou Towing Co, New Orleans, LA',
            'Empire State Carriers, New York, NY'
        ];

        const salesReps = [
            'Cole Schmitt', 'Sarah Johnson', 'Mike Rodriguez', 'Lisa Chen', 'David Thompson',
            'Amanda Williams', 'Chris Martinez', 'Jennifer Davis', 'Robert Wilson', 'Maria Garcia',
            'Kevin Brown', 'Jessica Taylor', 'Mark Anderson', 'Ashley Miller', 'Brian Jones'
        ];

        const categories = ['carriers', 'light-duty', 'medium-duty', 'heavy-duty', 'service-bodies'];

        // Generate fake vehicle data
        imageFiles.forEach((image, index) => {
            const vehicle = {
                id: index + 1,
                image: `images/${image}`,
                owner: companies[Math.floor(Math.random() * companies.length)],
                truck: this.generateTruckDetails(image),
                soldDate: this.generateSoldDate(),
                salesRep: salesReps[Math.floor(Math.random() * salesReps.length)],
                category: this.determineCategoryFromImage(image),
                imageHeight: this.generateImageHeight(), // For Pinterest-style varying heights
                images: [
                    `images/${image}`,
                    `images/${image}`, // For demo, using same image multiple times
                    `images/${image}`,
                    `images/${image}`
                ]
            };
            this.allVehicles.push(vehicle);
        });

        // Sort by newest first initially
        this.filteredVehicles = [...this.allVehicles];
        this.sortVehicles(this.filteredVehicles);
    }

    generateTruckDetails(imageName) {
        // Extract details from image filename
        const parts = imageName.split('-');
        const year = parts[0] ? 2020 + Math.floor(Math.random() * 5) : 2024;
        
        const truckTypes = [
            'Century 12 Series Steel Car Carrier',
            'Century 16 Series Steel LCG Car Carrier',
            'Century 1150 Heavy Duty Rotator',
            'Century 2465 Light Duty Wrecker',
            'Century 4024 20-Ton Wrecker',
            'Vulcan 810CW PTSL 4-Ton Light Duty Wrecker',
            'Chevron 408VT Renegade Wrecker'
        ];

        const chassis = [
            'Hino L-6', 'Freightliner M-2', 'Kenworth T-280', 'Peterbilt 389',
            'International MV', 'Ford F-750', 'Chevrolet 6500', 'Ram 5500',
            'Peterbilt 537', 'Dodge Ram 4500HD'
        ];

        const serialNumber = '#' + (19000 + Math.floor(Math.random() * 4000));
        
        return `${year} ${truckTypes[Math.floor(Math.random() * truckTypes.length)]}, ${chassis[Math.floor(Math.random() * chassis.length)]}, ${serialNumber}`;
    }

    generateSoldDate() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[Math.floor(Math.random() * months.length)];
        const year = 2024 + Math.floor(Math.random() * 2);
        const day = Math.floor(Math.random() * 28) + 1; // Safe day range for all months
        
        // Return both display format and sortable date
        return {
            display: `${month} ${year}`,
            sortDate: new Date(year, months.indexOf(month), day)
        };
    }

    determineCategoryFromImage(imageName) {
        if (imageName.includes('rotator') || imageName.includes('1150') || imageName.includes('1075')) {
            return 'heavy-duty';
        } else if (imageName.includes('carrier') || imageName.includes('car-carrier')) {
            return 'carriers';
        } else if (imageName.includes('light') || imageName.includes('2465') || imageName.includes('810cw')) {
            return 'light-duty';
        } else if (imageName.includes('4024') || imageName.includes('20-ton')) {
            return 'medium-duty';
        } else {
            const categories = ['carriers', 'light-duty', 'medium-duty', 'heavy-duty', 'service-bodies'];
            return categories[Math.floor(Math.random() * categories.length)];
        }
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.resetAndFilter();
            });
        });

        // Sort filter
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.resetAndFilter();
        });

        // Filters button
        const filtersBtn = document.getElementById('filtersBtn');
        const filtersPanel = document.getElementById('filtersPanel');
        filtersBtn.addEventListener('click', () => {
            filtersPanel.classList.toggle('show');
            filtersBtn.classList.toggle('active');
        });

        // Filter dropdowns
        document.getElementById('yearFilter').addEventListener('change', (e) => {
            this.currentFilters.year = e.target.value;
        });

        document.getElementById('locationFilter').addEventListener('change', (e) => {
            this.currentFilters.location = e.target.value;
        });

        document.getElementById('salesRepFilter').addEventListener('change', (e) => {
            this.currentFilters.salesRep = e.target.value;
        });

        // Filter actions
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAllFilters();
        });

        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.resetAndFilter();
            // Close filters panel
            filtersPanel.classList.remove('show');
            filtersBtn.classList.remove('active');
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreItems();
            });
        }

        // Modal functionality
        this.setupModalListeners();

        // Resize listener for responsive grid
        window.addEventListener('resize', () => {
            this.initializeMasonryGrid();
            this.repositionAllItems();
        });
    }

    setActiveCategory(clickedBtn) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedBtn.classList.add('active');
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.displayedCount = 0;
        this.applyFilters();
    }

    filterByCompany(companyName) {
        this.currentCompany = companyName;
        this.displayedCount = 0;
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('company', encodeURIComponent(companyName));
        window.history.pushState({}, '', url);
        
        this.showCompanyFilter(companyName);
        this.applyFilters();
    }

    clearCompanyFilter() {
        this.currentCompany = null;
        this.displayedCount = 0;
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.delete('company');
        window.history.pushState({}, '', url);
        
        this.hideCompanyFilter();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.allVehicles];

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(vehicle => vehicle.category === this.currentCategory);
        }

        // Filter by company (if set from URL or company click)
        if (this.currentCompany) {
            filtered = filtered.filter(vehicle => 
                vehicle.owner.toLowerCase().includes(this.currentCompany.toLowerCase())
            );
        }

        // Filter by year
        if (this.currentFilters.year) {
            filtered = filtered.filter(vehicle => 
                this.extractYear(vehicle.truck) === parseInt(this.currentFilters.year)
            );
        }

        // Filter by location
        if (this.currentFilters.location) {
            filtered = filtered.filter(vehicle => {
                const parts = vehicle.owner.split(',');
                const state = parts[parts.length - 1].trim();
                return state === this.currentFilters.location;
            });
        }

        // Filter by sales rep
        if (this.currentFilters.salesRep) {
            filtered = filtered.filter(vehicle => 
                vehicle.salesRep === this.currentFilters.salesRep
            );
        }

        // Apply sorting
        this.sortVehicles(filtered);

        // Reset grid and load filtered items
        this.filteredVehicles = filtered;
        this.displayedCount = 0;
        this.columnHeights = new Array(this.columnCount).fill(0);
        
        const gallery = document.getElementById('imageGrid');
        gallery.innerHTML = '';
        
        this.loadInitialItems();
        this.updateCompanyFilterIndicator();
        this.updateLoadMoreButton();
    }

    sortVehicles(vehicles) {
        switch (this.currentSort) {
            case 'newest':
                vehicles.sort((a, b) => b.soldDate.sortDate - a.soldDate.sortDate);
                break;
            case 'oldest':
                vehicles.sort((a, b) => a.soldDate.sortDate - b.soldDate.sortDate);
                break;
            case 'owner-az':
                vehicles.sort((a, b) => a.owner.localeCompare(b.owner));
                break;
            case 'owner-za':
                vehicles.sort((a, b) => b.owner.localeCompare(a.owner));
                break;
            default:
                vehicles.sort((a, b) => b.soldDate.sortDate - a.soldDate.sortDate);
        }
        return vehicles;
    }

    loadInitialItems() {
        this.renderGrid();
    }

    loadMoreItems() {
        this.renderGrid();
        this.updateLoadMoreButton();
    }

    async renderGrid() {
        const grid = document.getElementById('imageGrid');
        const itemsToShow = Math.min(this.displayedCount + this.itemsPerPage, this.filteredVehicles.length);
        
        if (this.displayedCount === 0) {
            grid.innerHTML = '';
            this.resetColumnHeights();
        }

        // Create and add new items
        const newItems = [];
        for (let i = this.displayedCount; i < itemsToShow; i++) {
            const vehicle = this.filteredVehicles[i];
            const gridItem = this.createGridItem(vehicle);
            grid.appendChild(gridItem);
            newItems.push(gridItem);
        }

        this.displayedCount = itemsToShow;

        // Position new items after they're added to DOM
        await this.positionNewItems(newItems);
    }

    async positionNewItems(items) {
        // Wait for all images to load first
        const imagePromises = items.map(item => {
            const img = item.querySelector('img');
            if (img) {
                return new Promise(resolve => {
                    if (img.complete && img.naturalHeight > 0) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                        // Fallback timeout
                        setTimeout(resolve, 2000);
                    }
                });
            }
            return Promise.resolve();
        });

        // Wait for all images to load
        await Promise.all(imagePromises);

        // Small delay to ensure layout is stable
        await new Promise(resolve => setTimeout(resolve, 50));

        // Now position all items
        for (let item of items) {
            const columnIndex = this.getShortestColumn();
            this.positionItem(item, columnIndex);
            
            // Update column height with actual item height
            const itemHeight = item.offsetHeight;
            this.columnHeights[columnIndex] += itemHeight + this.verticalGap;
        }
        
        // Update container height
        const maxHeight = Math.max(...this.columnHeights);
        document.getElementById('imageGrid').style.height = `${maxHeight}px`;

        // Add a fallback repositioning after a short delay
        setTimeout(() => {
            this.repositionItems();
        }, 100);
    }

    extractYear(truckString) {
        // Extract year from truck string (e.g., "2024 Century 12 Series..." -> 2024)
        const match = truckString.match(/^(\d{4})/);
        return match ? parseInt(match[1]) : new Date().getFullYear();
    }

    createGridItem(vehicle) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.onclick = () => this.openModal(vehicle);

        const year = this.extractYear(vehicle.truck);
        const companyName = vehicle.owner.split(',')[0];
        
        // Create image with random height for Pinterest effect
        item.innerHTML = `
            <div class="gallery-item-image">
                <img src="${vehicle.image}" 
                     alt="${vehicle.owner}" 
                     loading="lazy"
                     style="height: ${vehicle.imageHeight}px; object-fit: cover;">
                <div class="image-overlay"></div>
                <div class="floating-pills">
                    <div class="pill year-pill">${year}</div>
                    <div class="pill">${this.formatCategoryName(vehicle.category)}</div>
                </div>
            </div>
            <div class="gallery-item-content">
                <a class="company-name" onclick="event.stopPropagation(); gallery.filterByCompany('${vehicle.owner}')">${companyName}</a>
                <h3>${vehicle.truck.substring(0, 55)}...</h3>
            </div>
        `;

        return item;
    }

    formatCategoryName(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    updateLoadMoreButton() {
        const btn = document.getElementById('loadMoreBtn');
        
        if (this.displayedCount >= this.filteredVehicles.length) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'block';
            btn.textContent = `Load More (${this.filteredVehicles.length - this.displayedCount} remaining)`;
        }
    }

    openModal(vehicle) {
        this.currentVehicleImages = vehicle.images;
        this.currentModalIndex = 0;

        document.getElementById('modalOwner').textContent = vehicle.owner;
        document.getElementById('modalTruck').textContent = vehicle.truck;
        document.getElementById('modalSoldDate').textContent = vehicle.soldDate.display;
        document.getElementById('modalSalesRep').textContent = vehicle.salesRep;

        this.updateModalImage();
        this.createThumbnails();

        const modal = document.getElementById('imageModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Trigger animation on next frame for mobile slide-up
        requestAnimationFrame(() => {
            modal.classList.add('animate');
        });
    }

    updateModalImage() {
        const mainImg = document.getElementById('modalMainImage');
        mainImg.src = this.currentVehicleImages[this.currentModalIndex];

        // Update thumbnail active state
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentModalIndex);
        });
    }

    createThumbnails() {
        const container = document.getElementById('modalThumbnails');
        container.innerHTML = '';

        this.currentVehicleImages.forEach((image, index) => {
            const thumb = document.createElement('img');
            thumb.src = image;
            thumb.className = 'thumbnail';
            thumb.onclick = () => {
                this.currentModalIndex = index;
                this.updateModalImage();
            };
            container.appendChild(thumb);
        });
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        
        // Remove animation class first
        modal.classList.remove('animate');
        
        // Check if we're on mobile (using same breakpoint as CSS)
        if (window.innerWidth <= 768) {
            // Wait for slide-down animation to complete
            setTimeout(() => {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }, 300);
        } else {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    prevImage() {
        if (this.currentModalIndex > 0) {
            this.currentModalIndex--;
            this.updateModalImage();
        }
    }

    nextImage() {
        if (this.currentModalIndex < this.currentVehicleImages.length - 1) {
            this.currentModalIndex++;
            this.updateModalImage();
        }
    }

    openSubmitModal() {
        document.getElementById('submitModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeSubmitModal() {
        document.getElementById('submitModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    handleSubmitForm() {
        // Show success message (in a real app, this would submit to a server)
        alert('Thank you for submitting your photos! We will review them and add them to the gallery soon.');
        this.closeSubmitModal();
        document.getElementById('photoSubmitForm').reset();
    }

    setupModalListeners() {
        // Modal close events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Submit form
        document.getElementById('photoSubmitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmitForm();
        });
    }

    resetAndFilter() {
        this.applyFilters();
    }

    clearAllFilters() {
        this.currentCategory = 'all';
        this.currentCompany = null;
        this.currentFilters = {
            year: '',
            location: '',
            salesRep: ''
        };

        // Reset UI elements
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });

        // Reset filter dropdowns
        document.getElementById('yearFilter').value = '';
        document.getElementById('locationFilter').value = '';
        document.getElementById('salesRepFilter').value = '';

        // Close filters panel
        const filtersPanel = document.getElementById('filtersPanel');
        const filtersBtn = document.getElementById('filtersBtn');
        filtersPanel.classList.remove('show');
        filtersBtn.classList.remove('active');

        this.applyFilters();
    }

    repositionAllItems() {
        this.repositionItems();
    }

    updateCompanyFilterIndicator() {
        let indicator = document.querySelector('.company-filter-indicator');
        
        if (this.currentCompany) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'company-filter-indicator';
                
                const companySpan = document.createElement('span');
                companySpan.textContent = `Filtering by: ${this.currentCompany}`;
                
                const clearBtn = document.createElement('button');
                clearBtn.innerHTML = '×';
                clearBtn.className = 'clear-company-filter';
                clearBtn.addEventListener('click', () => {
                    this.currentCompany = null;
                    this.applyFilters();
                    
                    // Update URL
                    const url = new URL(window.location);
                    url.searchParams.delete('company');
                    window.history.pushState({}, '', url);
                });
                
                indicator.appendChild(companySpan);
                indicator.appendChild(clearBtn);
                
                const gallery = document.getElementById('imageGrid');
                gallery.parentNode.insertBefore(indicator, gallery);
            } else {
                indicator.querySelector('span').textContent = `Filtering by: ${this.currentCompany}`;
            }
        } else {
            if (indicator) {
                indicator.remove();
            }
        }
    }

    updateImageHeightsForViewport() {
        // Regenerate heights for current viewport
        this.allVehicles.forEach(vehicle => {
            vehicle.imageHeight = this.generateImageHeight();
        });
        
        // Update any existing DOM elements
        const galleryItems = document.querySelectorAll('.gallery-item img');
        galleryItems.forEach((img, index) => {
            if (this.filteredVehicles[index]) {
                img.style.height = `${this.filteredVehicles[index].imageHeight}px`;
            }
        });
    }
}

// Global functions for modal interactions
function closeModal() {
    gallery.closeModal();
}

function prevImage() {
    gallery.prevImage();
}

function nextImage() {
    gallery.nextImage();
}

function openSubmitModal() {
    gallery.openSubmitModal();
}

function closeSubmitModal() {
    gallery.closeSubmitModal();
}

function clearCompanyFilter() {
    gallery.clearCompanyFilter();
}

// Initialize gallery when DOM is loaded
let gallery;
document.addEventListener('DOMContentLoaded', () => {
    gallery = new VehicleGallery();
});

// Reposition items once everything is fully loaded
window.addEventListener('load', () => {
    if (gallery) {
        setTimeout(() => {
            gallery.repositionItems();
        }, 200);
    }
});

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    if (modal.style.display === 'block') {
        switch (e.key) {
            case 'Escape':
                gallery.closeModal();
                break;
            case 'ArrowLeft':
                gallery.prevImage();
                break;
            case 'ArrowRight':
                gallery.nextImage();
                break;
        }
    }
});

// Handle image loading errors
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Image failed to load:', e.target.src);
    }
}, true);