import React from 'react';
import { services } from './db_home'; // Import từ file db.ts

const BNCloud: React.FC = () => {
    return (
        <div className="w-full min-h-0 flex flex-col"> {/* Quan trọng: min-h-0 */}

            {/* Hero Section */}
            <section className="flex-shrink-0 w-full"> {/* Thêm flex-shrink-0 */}
                <div className="container mx-auto px-4 py-8 md:py-20"> {/* Giảm padding trên mobile */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
                            Bạn đang tìm kiếm một nền tảng đám mây đáng tin cậy?
                        </h2>
                        <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 leading-relaxed">
                            Dịch vụ đám mây của chúng tôi là giải pháp hoàn hảo cho bạn với hiệu suất ổn định,
                            bảo mật tối đa và hỗ trợ kỹ thuật tận tâm.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-12">
                            {/* Feature Cards với height cố định */}
                            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full min-h-0">
                                <div className="text-4xl md:text-5xl mb-4 md:mb-6">⚡</div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">Tốc độ vượt trội</h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    Triển khai mọi dạng siêu tốc, tối ưu hóa hiệu suất hoạt động cho doanh nghiệp của bạn.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full min-h-0">
                                <div className="text-4xl md:text-5xl mb-4 md:mb-6">🛡️</div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">Bảo mật tối đa</h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    Hiệu suất ổn định & bảo mật tối đa, bảo vệ dữ liệu của bạn 24/7.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full min-h-0">
                                <div className="text-4xl md:text-5xl mb-4 md:mb-6">👨‍💻</div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">Hỗ trợ tận tâm</h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    Hỗ trợ kỹ thuật tận tâm, sẵn sàng giải quyết mọi vấn đề của bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="flex-shrink-0 w-full py-8 md:py-20 bg-white"> {/* Thêm flex-shrink-0 */}
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-16">
                        Dịch vụ của chúng tôi
                    </h2>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 flex flex-col h-full min-h-0"
                            >
                                <div className="text-4xl md:text-5xl mb-4 md:mb-6">{service.icon}</div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">{service.name}</h3>
                                <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base flex-grow">{service.description}</p>

                                {/* Responsive buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-auto">
                                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-xs md:text-sm flex-1 text-center">
                                        Tìm hiểu thêm
                                    </button>
                                    <button className="bg-gray-800 text-white px-3 md:px-4 py-2 md:py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-xs md:text-sm flex-1 text-center">
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BNCloud;