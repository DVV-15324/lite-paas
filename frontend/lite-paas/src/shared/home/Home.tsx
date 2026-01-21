import React from 'react';
import { services } from './db_home';

const Home: React.FC = () => {
    return (
        <div className="w-full min-h-0 flex flex-col">
            <section className=" w-full">
                <div className="container mx-auto px-4 pt-10">
                    <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-16">
                        Dịch vụ của chúng tôi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="rounded-2xl p-4 md:p-8 border-blue-900 border-2 flex flex-col h-full min-h-0"
                            >
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">{service.name}</h3>
                                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base flex-grow">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;