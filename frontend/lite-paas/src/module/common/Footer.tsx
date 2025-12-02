

const FooterMain = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-6">BNCloud</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            Cung cấp dịch vụ đám mây và giải pháp triển khai ứng dụng nhanh chóng,
                            an toàn và linh hoạt.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            Đảm bảo hiệu suất ổn định, bảo mật tối đa, hỗ trợ kỹ thuật tận tâm.
                        </p>
                    </div>

                    {/* Support Info */}
                    <div>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-6">Hỗ trợ 24/7</h3>
                        <p className="text-gray-300 mb-4">
                            Đội ngũ hỗ trợ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/24h.
                        </p>
                        <p className="text-gray-300 mb-2">Email: support@bncloud.vn</p>
                        <p className="text-gray-300">Hotline: 1900 1234</p>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-6">Kết nối với chúng tôi</h3>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="bg-gray-800 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg"
                            >
                                Zalo
                            </a>
                            <a
                                href="#"
                                className="bg-gray-800 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg"
                            >
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-700 pt-8 text-center">
                    <p className="text-gray-400">
                        &copy; 2025 BNCloud. Tất cả các quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterMain;
