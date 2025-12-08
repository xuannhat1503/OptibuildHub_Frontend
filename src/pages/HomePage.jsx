import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="text-center">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
          Chào mừng đến OptiBuildHub
        </h1>
        <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 px-4">
          Nền tảng xây dựng cấu hình PC thông minh với kiểm tra tương thích tự động
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
        <Link
          to="/parts"
          className="bg-white rounded-lg shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow"
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🔧</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Linh kiện PC</h2>
          <p className="text-sm md:text-base text-gray-600">
            Khám phá hàng nghìn linh kiện PC với giá cả cạnh tranh. Lọc theo danh mục, thương hiệu và giá.
          </p>
        </Link>

        <Link
          to="/builder"
          className="bg-white rounded-lg shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow"
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🖥️</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Xây dựng PC</h2>
          <p className="text-sm md:text-base text-gray-600">
            Tạo cấu hình PC của bạn với công cụ kiểm tra tương thích tự động và tính toán công suất.
          </p>
        </Link>

        <Link
          to="/forum"
          className="bg-white rounded-lg shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow"
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">💬</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Diễn đàn</h2>
          <p className="text-sm md:text-base text-gray-600">
            Chia sẻ cấu hình, trao đổi kinh nghiệm và nhận tư vấn từ cộng đồng.
          </p>
        </Link>
      </div>

      <div className="mt-8 md:mt-16 max-w-3xl mx-auto">
        <div className="bg-blue-50 rounded-lg p-4 md:p-8 border border-blue-200">
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">✨ Tính năng nổi bật</h3>
          <ul className="text-left space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
            <li className="flex items-start gap-2 md:gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span>Kiểm tra tương thích tự động giữa các linh kiện</span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span>Theo dõi lịch sử giá và xu hướng thị trường</span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span>Đánh giá và nhận xét từ người dùng thực tế</span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span>Tính toán tổng công suất và đề xuất PSU phù hợp</span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span>Chia sẻ và thảo luận cấu hình trên diễn đàn</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
