import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ServiceData } from "../model/my_db_sr";
interface ServiceParams {
    id: string;
    [key: string]: string | undefined;
}

const MyDBSR: React.FC = () => {
    const { id } = useParams<ServiceParams>();
    const [serviceData, setServiceData] = useState<ServiceData | null>(null);

    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isRunning, setIsRunning] = useState(true);

    const baseURL = "http://localhost:3000";

    useEffect(() => {
        const fetchService = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!id) return;

                // Fetch service detail
                const serviceResp = await axios.post(`${baseURL}/v2/sub-database/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const service = serviceResp.data.data as ServiceData;
                setServiceData(service);
                console.log(service)
                setIsRunning(service.status);


            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!serviceData) return <div className="p-6 text-center">Service not found</div>;

    const connectionInfo = {
        host: serviceData.link_return || "",
        port: serviceData.port?.toString() || "",
        username: serviceData.name_login || "",
        password: serviceData.password_login || "",
    };

    return (
        <div className="space-y-6 p-6">

            {/* Usage */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6 space-y-4">
                    <h3 className="text-gray-800 font-bold">Ten dich vu: {serviceData.info_database.name}</h3>
                    <div>
                        <p>CPU:{serviceData.info_database.cpu}</p>

                    </div>
                    <div>
                        <p>RAM:  {serviceData.info_database.ram} MB</p>

                    </div>
                    <div>
                        <p>Storage: {serviceData.info_database.storage} GB</p>

                    </div>
                    <p>Version: {serviceData.info_database.version}</p>
                </div>

                {/* Connection Info */}
                <div className="bg-white border rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-gray-800">Connection Info</h3>
                    {["host", "port", "username", "password"].map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                            <input
                                type={field === "password" && !showPassword ? "password" : "text"}
                                value={connectionInfo[field as keyof typeof connectionInfo]}
                                readOnly
                                className="flex-1 px-3 py-2 border rounded bg-gray-50"
                            />
                            {field === "password" && (
                                <button onClick={() => setShowPassword(!showPassword)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
                                    {showPassword ? "an" : "hien"}
                                </button>
                            )}
                            <button
                                onClick={() => navigator.clipboard.writeText(connectionInfo[field as keyof typeof connectionInfo])}
                                className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Copy
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyDBSR;
