import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface RuntimeInfo {
    id: string;
    name: string;
    price: number;
    cpu: number;
    ram: number;
    storage: number;
    link_git: string;
    token: string;
    description: string;
    version: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

interface User {
    id: string;
    name: string;
    phone: { String: string; Valid: boolean };
    role: string;
    address: { String: string; Valid: boolean };
    email: string;
    deleted_at: string;
    created_at: string;
    updated_at: string;
}

interface RuntimeData {
    id: string;
    user_id: string;
    service_id: string;
    link_git: string;
    info_runtime: RuntimeInfo;
    user: User;
    link_return: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

interface GitHubRepoInfo {
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string;
    default_branch: string;
    permissions?: {
        admin: boolean;
        push: boolean;
        pull: boolean;
    };
}

interface MetricsData {
    PodName: string;
    Namespace: string;
    MemoryUsed: string;
    CPUUsed: string;
}

const RuntimeService: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [runtimeData, setRuntimeData] = useState<RuntimeData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [accessToken, setAccessToken] = useState<string>("");
    const [repositoryUrl, setRepositoryUrl] = useState<string>("");
    const [branch, setBranch] = useState<string>("main");
    const [isWebHook, setIsWebHook] = useState<boolean>(false);
    const [isRunning, setIsRunning] = useState<boolean>(true);
    const [deployLoading, setDeployLoading] = useState<boolean>(false);
    const [testingRepo, setTestingRepo] = useState<boolean>(false);
    const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [metricsLoading, setMetricsLoading] = useState<boolean>(true);

    const REACT_APP_API_URL = "http://localhost:3000";
    const linkWebhook = "example.com/webhook";

    const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);

    const clearLogs = () => {
        setDeploymentLogs([]);
    };

    useEffect(() => {
        if (!runtimeData?.id) return;

        let ws: WebSocket;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10; // tăng lên để ổn định
        let reconnectTimer: NodeJS.Timeout;

        const connectWebSocket = () => {
            console.log(`Connecting to WebSocket: ws://localhost:3000/service/${runtimeData.id}`);
            setDeploymentLogs(prev => [...prev, 'Connecting to WebSocket...']);

            ws = new WebSocket(`ws://localhost:3000/service/${runtimeData.id}`);

            ws.onopen = () => {
                console.log("WebSocket connected");
                setDeploymentLogs(prev => [...prev, 'WebSocket connected']);
                reconnectAttempts = 0;
            };

            ws.onmessage = (event) => {
                console.log("📩 WS message:", event.data);

                let msg = event.data;

                // Nếu server gửi JSON
                try {
                    const json = JSON.parse(event.data);

                    // Nếu log message từ service runtime
                    if (json.app && json.log) {
                        msg = `[${json.app}] ${json.log}`;
                    }
                    // Nếu status
                    else if (json.status) {
                        msg = `STATUS (${json.app}): ${json.status}`;
                    }
                    // fallback
                    else {
                        msg = JSON.stringify(json);
                    }
                } catch {
                    // không phải JSON → giữ nguyên raw text
                    msg = event.data;
                }

                setDeploymentLogs(prev => [...prev, msg]);
            };

            ws.onerror = (err) => {
                console.error("⚠️ WebSocket error:", err);
                setDeploymentLogs(prev => [...prev, '⚠️ WebSocket error']);
            };

            ws.onclose = () => {
                console.log("🔌 WebSocket closed");
                setDeploymentLogs(prev => [...prev, '🔌 WebSocket disconnected']);

                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    const time = 1000 * reconnectAttempts; // exponential backoff
                    setDeploymentLogs(prev => [
                        ...prev,
                        `♻️ Reconnecting in ${time / 1000}s...`
                    ]);

                    reconnectTimer = setTimeout(connectWebSocket, time);
                } else {
                    setDeploymentLogs(prev => [...prev, '❌ Max reconnect attempts reached.']);
                }
            };
        };

        connectWebSocket();

        return () => {
            console.log("🔻 Cleanup WebSocket");
            clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, [runtimeData?.id]);

    // Trong React component
    const viewLogs = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!runtimeData?.id) {
                alert('Không tìm thấy service ID');
                return;
            }

            // Sử dụng appName từ runtimeData hoặc mặc định
            let appName = `${runtimeData.user.name}-${runtimeData.id}`
                .toLowerCase()
                .replace(/\s+/g, '')              // xoá space khỏi toàn chuỗi
                .replace(/[^a-z0-9-]/g, '');      // chỉ cho phép a-z 0-9 -


            const response = await fetch(
                `${REACT_APP_API_URL}/apps/${runtimeData.id}/logs/${appName}`,
                {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                setDeploymentLogs(prev => [...prev, '...']);
                const result = await response.json();
                console.log('Log request started:', result);
            } else {
                const error = await response.text();
                console.error('Error requesting logs:', error);
                setDeploymentLogs(prev => [...prev, `❌ Lỗi khi tải logs: ${error}`]);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            setDeploymentLogs(prev => [...prev, `❌ Lỗi kết nối: ${err}`]);
        }
    };
    // Fetch runtime data
    useEffect(() => {
        const fetchRuntimeData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('No access token found');
                }

                const response = await fetch(`${REACT_APP_API_URL}/v2/sub-runtime/${id}`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch runtime data: ${response.status}`);
                }

                const data = await response.json();
                if (data) {
                    setRuntimeData(data);
                    setRepositoryUrl(data.link_git || "");
                    setAccessToken(data.token || "");

                    if (data.link_git) {
                        setRepoInfo({
                            name: data.link_git.split('/').pop() || '',
                            full_name: data.link_git.replace('https://github.com/', ''),
                            private: false,
                            html_url: data.link_git,
                            description: 'Repository connected',
                            default_branch: 'main'
                        });
                    }
                } else {
                    setError("Runtime not found");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRuntimeData();
        }
    }, [id, REACT_APP_API_URL]);

    // Fetch metrics data
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setMetricsLoading(true);
                const token = localStorage.getItem('access_token');
                if (!token || !id) return;

                const response = await fetch(`${REACT_APP_API_URL}/v2/mestrics/${id}`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const metricsData = await response.json();
                    if (metricsData.status === 200 && metricsData.data) {
                        setMetrics(metricsData.data);
                    }
                }
            } catch (err) {
                console.error('Error fetching metrics:', err);
            } finally {
                setMetricsLoading(false);
            }
        };

        if (id && runtimeData) {
            fetchMetrics();
            const interval = setInterval(fetchMetrics, 30000);
            return () => clearInterval(interval);
        }
    }, [id, runtimeData, REACT_APP_API_URL]);

    // Format memory from KiB to MiB
    const formatMemory = (memory: string): string => {
        if (!memory) return '0 MiB';
        if (memory.endsWith('Ki')) {
            const value = parseFloat(memory.replace('Ki', ''));
            return (value / 1024).toFixed(2) + ' MiB';
        }
        return memory;
    };

    // Format CPU from nanocores to millicores
    const formatCPU = (cpu: string): string => {
        if (!cpu) return '0 m';
        if (cpu.endsWith('n')) {
            const value = parseFloat(cpu.replace('n', ''));
            return (value / 1000000).toFixed(2) + ' m';
        }
        return cpu;
    };

    // Calculate usage percentages
    const calculateMemoryUsage = (): number => {
        if (!metrics?.MemoryUsed || !runtimeData?.info_runtime?.ram) return 0;
        const usedMemoryMiB = parseFloat(metrics.MemoryUsed.replace('Ki', '')) / 1024;
        const totalMemoryMiB = runtimeData.info_runtime.ram;
        return (usedMemoryMiB / totalMemoryMiB) * 100;
    };

    const calculateCPUUsage = (): number => {
        if (!metrics?.CPUUsed || !runtimeData?.info_runtime?.cpu) return 0;
        const usedCPUm = parseFloat(metrics.CPUUsed.replace('n', '')) / 1000000;
        const totalCPUm = runtimeData.info_runtime.cpu * 1000;
        return (usedCPUm / totalCPUm) * 100;
    };

    // Extract owner and repo from GitHub URL
    const extractRepoInfo = (url: string): { owner: string; repo: string } | null => {
        try {
            const patterns = [
                /https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\.git)?\/?/,
                /git@github\.com:([^\/]+)\/([^\/]+)(\.git)?\/?/,
                /github\.com\/([^\/]+)\/([^\/]+)/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    return {
                        owner: match[1],
                        repo: match[2].replace('.git', '')
                    };
                }
            }
            return null;
        } catch {
            return null;
        }
    };

    // Test GitHub repository connection
    const testGitHubRepository = async () => {
        if (!accessToken.trim()) {
            alert("Vui lòng nhập GitHub Access Token");
            return;
        }

        if (!repositoryUrl.trim()) {
            alert("Vui lòng nhập Repository URL");
            return;
        }

        const repoData = extractRepoInfo(repositoryUrl);
        if (!repoData) {
            alert("Repository URL không hợp lệ. Ví dụ: https://github.com/username/repository");
            return;
        }

        try {
            setTestingRepo(true);

            const repoResponse = await fetch(
                `https://api.github.com/repos/${repoData.owner}/${repoData.repo}`,
                {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                    }
                }
            );

            if (!repoResponse.ok) {
                if (repoResponse.status === 404) {
                    throw new Error('Repository không tồn tại hoặc không có quyền truy cập');
                } else if (repoResponse.status === 403) {
                    throw new Error('Access Token không có quyền truy cập repository này');
                } else {
                    throw new Error(`Lỗi GitHub API: ${repoResponse.status}`);
                }
            }

            const repoInfoData: GitHubRepoInfo = await repoResponse.json();
            setRepoInfo(repoInfoData);

            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!userResponse.ok) {
                throw new Error('Access Token không hợp lệ');
            }

            const userData = await userResponse.json();

            if ((!branch || branch === "main") && repoInfoData.default_branch) {
                setBranch(repoInfoData.default_branch);
            }

            alert(`Kết nối thành công!\nRepository: ${repoInfoData.full_name}\nUser: ${userData.login}\nBranch mặc định: ${repoInfoData.default_branch}`);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra repository';
            alert(errorMessage);
            setRepoInfo(null);
        } finally {
            setTestingRepo(false);
        }
    };

    // Handle deployment
    const handleDeploy = async () => {
        try {
            setDeployLoading(true);
            setDeploymentLogs(prev => [...prev, '🚀 Bắt đầu triển khai...']);

            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No access token found');

            const body = {
                link_git: repositoryUrl || null,
                token: accessToken || null,
                status: true
            };

            const response = await fetch(`${REACT_APP_API_URL}/v2/sub-runtime/${id}/deploy`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Deployment failed: ${response.status} - ${errorText}`);
            }

            setDeploymentLogs(prev => [...prev, '✅ Triển khai thành công!']);
            alert("Triển khai thành công!");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi triển khai';
            setDeploymentLogs(prev => [...prev, `❌ Lỗi: ${errorMsg}`]);
            alert(errorMsg);
        } finally {
            setDeployLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600 text-lg">{error}</div>
            </div>
        );
    }

    if (!runtimeData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Không tìm thấy dữ liệu runtime</div>
            </div>
        );
    }

    const memoryUsagePercent = calculateMemoryUsage();
    const cpuUsagePercent = calculateCPUUsage();

    return (
        <div className="space-y-6">
            {/* Service Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {runtimeData.info_runtime?.name || "Golang"}
                    </h1>
                    <p className="text-gray-600">
                        {runtimeData.info_runtime?.description || "Môi trường phát triển ứng dụng Golang"}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${isRunning
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {isRunning ? "🟢 Đang chạy" : "⚪ Đã dừng"}
                    </button>
                </div>
            </div>

            {/* Resource Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specs Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông số kỹ thuật</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Môi trường:</span>
                                <span className="font-medium">
                                    {runtimeData.info_runtime?.name} {runtimeData.info_runtime?.version}
                                </span>
                            </div>
                        </div>

                        {/* CPU Usage */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">CPU:</span>
                                <div className="text-right">
                                    <span className="font-medium">{runtimeData.info_runtime?.cpu} core</span>
                                    {metrics && (
                                        <div className="text-sm text-gray-500">
                                            Đang sử dụng: {formatCPU(metrics.CPUUsed)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(cpuUsagePercent, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {metricsLoading ? 'Đang tải...' : `${cpuUsagePercent.toFixed(1)}% đang sử dụng`}
                            </div>
                        </div>

                        {/* RAM Usage */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">RAM:</span>
                                <div className="text-right">
                                    <span className="font-medium">{runtimeData.info_runtime?.ram} MB</span>
                                    {metrics && (
                                        <div className="text-sm text-gray-500">
                                            Đang sử dụng: {formatMemory(metrics.MemoryUsed)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(memoryUsagePercent, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {metricsLoading ? 'Đang tải...' : `${memoryUsagePercent.toFixed(1)}% đang sử dụng`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* GitHub Integration */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Kết nối GitHub</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link Webhook
                            </label>
                            <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                https://{linkWebhook}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Repository URL
                            </label>
                            <input
                                type="text"
                                value={repositoryUrl}
                                onChange={(e) => {
                                    setRepositoryUrl(e.target.value);
                                    setRepoInfo(null);
                                }}
                                placeholder="https://github.com/username/repository"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch
                            </label>
                            <input
                                type="text"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                placeholder="main"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GitHub Access Token
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="password"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="ghp_..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    onClick={testGitHubRepository}
                                    disabled={testingRepo || !repositoryUrl.trim() || !accessToken.trim()}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${testingRepo || !repositoryUrl.trim() || !accessToken.trim()
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {testingRepo ? "Đang test..." : "Kiểm tra Repo"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Token cần quyền <code>repo</code> và <code>admin:repo_hook</code> (cho webhook)
                            </p>
                        </div>

                        {/* Repository Info Display */}
                        {repoInfo && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-green-800">Repository hợp lệ</span>
                                </div>
                                <div className="text-sm text-green-700">
                                    <div><strong>Name:</strong> {repoInfo.full_name}</div>
                                    <div><strong>Branch:</strong> {branch}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Current GitHub Connection Status */}
            {runtimeData.link_git && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">GitHub đã kết nối</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-700">Repository: {runtimeData.link_git}</p>
                            <p className="text-green-600 text-sm">Cập nhật lần cuối: {new Date(runtimeData.updated_at).toLocaleString()}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            ✅ Đã kết nối
                        </span>
                    </div>
                </div>
            )}

            {/* Deployment Logs - ĐƠN GIẢN HÓA */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Log triển khai</h3>
                    <button
                        onClick={clearLogs}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                    >
                        Xóa Logs
                    </button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                    {deploymentLogs.length === 0 ? (
                        <div className="text-gray-500">Chưa có log nào. Hãy triển khai để xem log.</div>
                    ) : (
                        deploymentLogs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap py-1 border-b border-gray-700 last:border-b-0">
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Application URL */}
            {runtimeData.link_return && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Ứng dụng của bạn</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-700">Triển khai thành công!</p>
                            <a
                                href={`http://${runtimeData.link_return}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                http://{runtimeData.link_return}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
                <button
                    onClick={handleDeploy}
                    disabled={!repoInfo || deployLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition ${!repoInfo || deployLoading
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {deployLoading ? "Đang triển khai..." : "Cập nhật và triển khai"}
                </button>

                {/* Nút xem logs */}
                <button
                    onClick={viewLogs}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    📄 Xem Logs
                </button>
            </div>
        </div>
    );
};

export default RuntimeService;