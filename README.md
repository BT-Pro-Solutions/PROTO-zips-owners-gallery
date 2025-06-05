# Zips Owner's Gallery

A modern, responsive HTML/CSS/JS prototype for showcasing vehicles purchased from Zips. This gallery allows customers to browse and share photos of their purchased vehicles in an interactive, Pinterest-style masonry grid layout.

## 🚀 Features

### Core Functionality
- **Responsive Masonry Grid**: Pinterest-style layout that adapts to different screen sizes
- **Category Filtering**: Filter vehicles by type (Carriers, Light Duty, Medium Duty, Heavy Duty, Service Bodies, Company Albums)
- **Advanced Sorting**: Sort by newest, oldest, or owner name (A-Z/Z-A)
- **Load More Pagination**: Display 30 items initially with "Load More" functionality
- **Interactive Modal**: Click any vehicle to view detailed information and multiple images
- **Photo Submission**: Built-in form for customers to submit their vehicle photos

### UI/UX Features
- **Modern Design**: Clean, professional interface inspired by Dribbble
- **Smooth Animations**: Hover effects, transitions, and loading animations
- **Keyboard Navigation**: Arrow keys and ESC support in modal view
- **Mobile Responsive**: Optimized for all device sizes
- **Image Gallery**: Swipe through multiple images with thumbnail navigation
- **Contact Integration**: Direct phone link for sales inquiries

## 📁 Project Structure

```
PROTO-zips-owners-gallery/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
├── images/             # Vehicle photo assets
│   ├── 21267-1-century-1075s-3-stage-heavy-duty-rotator-2024-kenworth-t-880.jpg
│   ├── 21918-0-century-12-series-steel-lcg-car-carrier-2025-freightliner-m-2.jpg
│   └── ... (29 total vehicle images)
└── README.md          # Project documentation
```

## 🎨 Design Features

### Layout
- **Header**: Sticky navigation with logo and menu links
- **Hero Section**: Gradient background with call-to-action
- **Gallery Controls**: Category filters and sorting options
- **Masonry Grid**: Responsive vehicle showcase
- **Modal System**: Detailed vehicle information overlay

### Styling
- **Color Scheme**: Professional blue and gray palette
- **Typography**: Inter font family for modern readability
- **Shadows & Effects**: Subtle depth with box shadows and hover states
- **Responsive Breakpoints**: Mobile-first design approach

## 🔧 Technical Implementation

### JavaScript Architecture
- **Class-Based Structure**: `VehicleGallery` class manages all functionality
- **Fake Data Generation**: Automatically creates realistic vehicle data
- **Event Management**: Centralized event listener setup
- **State Management**: Tracks current filters, sorting, and modal state

### Key Functions
- `generateFakeData()`: Creates realistic vehicle data from image filenames
- `filterByCategory()`: Filters vehicles by category type
- `sortVehicles()`: Handles all sorting operations
- `renderGrid()`: Manages masonry grid display
- `openModal()`: Displays detailed vehicle information

### Data Structure
Each vehicle object contains:
```javascript
{
    id: number,
    image: string,
    owner: string,
    truck: string,
    soldDate: string,
    salesRep: string,
    category: string,
    images: array
}
```

## 🚀 Getting Started

1. **Open the Project**: Simply open `index.html` in a web browser
2. **Local Server** (Recommended): Use a local server for optimal performance:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   # Right-click index.html → "Open with Live Server"
   ```

## 📱 Usage

### Browsing Vehicles
1. View all vehicles in the main grid
2. Use category buttons to filter by vehicle type
3. Change sorting with the dropdown filter
4. Click "Load More" to see additional vehicles

### Viewing Details
1. Click any vehicle card to open the modal
2. Use arrow buttons or keyboard to navigate images
3. View complete vehicle specifications and contact info
4. Press ESC or click outside to close

### Submitting Photos
1. Click "Submit Your Photos" button
2. Fill out the vehicle information form
3. Upload multiple photos
4. Submit for review and approval

## 🎯 Demo Data

The project includes realistic fake data for 29 vehicles with:
- **Companies**: 20+ realistic towing/transport company names
- **Sales Reps**: 15 representative names
- **Vehicle Types**: Carriers, wreckers, rotators, and service vehicles
- **Locations**: Major cities across the United States
- **Dates**: Recent sales dates (2024-2025)

## 📐 Responsive Design

- **Desktop**: Full masonry grid with sidebar modal
- **Tablet**: Adapted grid with responsive modal
- **Mobile**: Single-column layout with full-screen modal

## 🔮 Future Enhancements

- Backend integration for real data storage
- User authentication system
- Advanced search functionality
- Image upload and processing
- Social sharing features
- Admin panel for content management

## 📞 Support

For questions about building similar vehicles:
**Call: 800-222-6047**

---

*This is a prototype/demo project showcasing modern web development techniques for vehicle gallery applications.*