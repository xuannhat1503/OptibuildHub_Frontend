# OptiBuildHub Frontend

Nền tảng xây dựng cấu hình PC với React + Vite + Tailwind CSS.

## 🚀 Tính năng

### 1. Quản lý Linh kiện PC
- **Danh sách linh kiện**: Hiển thị grid view với pagination
- **Lọc & Tìm kiếm**: Theo danh mục, thương hiệu, khoảng giá, từ khóa
- **Sắp xếp**: Theo tên, giá, ngày tạo (asc/desc)
- **Chi tiết linh kiện**: 
  - Thông tin đầy đủ, thông số kỹ thuật (spec JSON)
  - Lịch sử giá từ crawler
  - Đánh giá (rating) từ người dùng với sao và nội dung

### 2. PC Build Builder
- **Chọn linh kiện**: Theo từng danh mục (CPU, GPU, RAM, PSU, etc.)
- **Kiểm tra tương thích**: Real-time compatibility checking
  - Socket CPU vs Mainboard
  - RAM type và số slot
  - GPU length vs Case size
  - Tổng công suất vs PSU wattage
- **Tính toán**: Tổng giá, tổng công suất
- **Lưu cấu hình**: Với tên và userId

### 3. Diễn đàn (Forum)
- **Danh sách bài viết**: Pagination, hiển thị preview
- **Tạo bài viết**: 
  - Tiêu đề, nội dung
  - Upload nhiều ảnh
  - Liên kết với build (optional)
- **Chi tiết bài viết**:
  - Hiển thị nội dung đầy đủ, ảnh
  - Reactions: Like/Dislike
  - Comments: Nested (reply), real-time count
  
### 4. Components Tái sử dụng
- `StarRating`: Hiển thị và input rating (1-5 sao)
- `ImageUploader`: Upload file lên `/api/files`, preview
- `Pagination`: Phân trang với ellipsis
- `Loading`: Spinner animation

## 🛠️ Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd frontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 📁 Cấu trúc Project

```
src/
├── api/           # API client functions
│   ├── client.js  # Axios instance (baseURL: http://localhost:8080)
│   ├── part.js    # Parts & Ratings APIs
│   ├── post.js    # Posts, Comments, Reactions APIs
│   ├── build.js   # PC Build APIs
│   └── file.js    # File upload API
├── components/    # Reusable components
│   ├── StarRating.jsx
│   ├── ImageUploader.jsx
│   ├── Pagination.jsx
│   └── Loading.jsx
├── pages/         # Route pages
│   ├── HomePage.jsx
│   ├── PartsListPage.jsx
│   ├── PartDetailPage.jsx
│   ├── BuilderPage.jsx
│   ├── ForumListPage.jsx
│   ├── CreatePostPage.jsx
│   └── PostDetailPage.jsx
├── utils/         # Utilities
│   ├── constants.js  # CATEGORIES, SORT_OPTIONS, TEMP_USER_ID
│   └── format.js     # formatPrice, formatDate, formatRelativeTime
├── App.jsx        # Root layout với header/footer
├── main.jsx       # Router setup
└── index.css      # Tailwind imports
```

## 🔗 Backend API

Backend phải chạy ở `http://localhost:8080` với các endpoints:

### Parts
- `GET /api/parts?page=0&size=12&category=CPU&brand=...&minPrice=...&maxPrice=...&q=...&sortBy=price&sortDir=asc`
- `GET /api/parts/{id}` - Chi tiết part (kèm rating, price history)
- `GET /api/parts/{id}/prices` - Lịch sử giá
- `POST /api/parts/{id}/ratings` - Đánh giá

### Builds
- `POST /api/builds/check` - Kiểm tra tương thích `{ partIds: [...] }`
- `POST /api/builds` - Lưu build `{ userId, title, partIds }`

### Forum
- `GET /api/posts?page=0&size=20` - Danh sách posts
- `GET /api/posts/{id}` - Chi tiết post (kèm comments)
- `POST /api/posts` - Tạo post `{ userId, title, content, imageUrls, buildId }`
- `POST /api/posts/{id}/comments` - Thêm comment `{ userId, content, parentId }`
- `POST /api/posts/{id}/reactions` - Like/Dislike `{ userId, type: "LIKE"/"DISLIKE" }`

### Files
- `POST /api/files` - Upload file (multipart/form-data)

## 🎨 Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **Responsive**: Mobile-first design
- **Color scheme**: Blue primary (blue-600, blue-700)
- **Shadows & Borders**: Subtle elevation

## ⚙️ Configuration

### API Base URL
Thay đổi trong `src/api/client.js`:
```javascript
export const api = axios.create({
  baseURL: 'http://localhost:8080', // <-- Đổi URL nếu cần
  headers: { "Content-Type": "application/json" },
});
```

### Temporary User ID
Hiện tại sử dụng `TEMP_USER_ID = 1` trong `src/utils/constants.js`.
Sau này có thể thay bằng auth token thực.

## 🚧 TODO / Improvements

- [ ] Authentication & Authorization (JWT)
- [ ] User profile & avatar
- [ ] Advanced price chart (Line chart với Chart.js)
- [ ] Build comparison
- [ ] Share build to forum directly
- [ ] Infinite scroll thay vì pagination
- [ ] Dark mode
- [ ] SEO optimization (meta tags, SSR)
- [ ] Error boundary & Toast notifications
- [ ] Loading skeleton screens

## 📝 Notes

- Backend CORS đã cấu hình cho `http://localhost:5173`
- File upload size limit: Check backend config
- Image URLs trả về dạng `/uploads/filename.jpg`, cần prefix `http://localhost:8080`
- SpecJson của Part được parse thành object để hiển thị specs

## 🐛 Known Issues

- ImageUploader preview có thể bị duplicate nếu upload nhiều lần
- Nested comments chỉ hiển thị 1 level (có thể expand thêm)
- Không có validation form phía client (chỉ dựa vào backend validation)

## 📄 License

MIT
