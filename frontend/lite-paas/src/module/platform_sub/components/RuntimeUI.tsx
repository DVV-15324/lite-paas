import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GitHubRepoInfo, RuntimeData } from "../model/runtime";


const RuntimeService: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [runtimeData, setRuntimeData] = useState<RuntimeData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [_, setError] = useState<string>("");

    const [accessTokenGit, setAccessTokenGit] = useState<string>("");
    const [repositoryUrl, setRepositoryUrl] = useState<string>("");
    const [branch, setBranch] = useState<string>("main");
    const [repoVerified, setRepoVerified] = useState(false);


    const [deployLoading, setDeployLoading] = useState<boolean>(false);
    const [testingRepo, setTestingRepo] = useState<boolean>(false);
    const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);



    const REACT_APP_API_URL = "http://localhost:3000";
    const linkWebhook = "example.com/webhook";

    const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);

    const viewLogs = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!runtimeData?.id) return;

            const appName = `${runtimeData.user.name}-${runtimeData.id}`
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9-]/g, "");

            const res = await fetch(
                `${REACT_APP_API_URL}/apps/${runtimeData.id}/logs/${appName}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const text = await res.text();
            setDeploymentLogs(text.split("\n"));

        } catch (err) {
            console.error(err);
            setDeploymentLogs(prev => [...prev, "Không lấy được logs"]);
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
                    setRuntimeData(data.data);
                    setRepositoryUrl(data.data.link_git || "");
                    setAccessTokenGit(data.data.token_git || "");

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
        if (!accessTokenGit.trim()) {
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
                        'Authorization': `Bearer ${accessTokenGit}`,
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
            setRepoVerified(true);
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${accessTokenGit}`,
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
            setDeploymentLogs(prev => [...prev, 'Bắt đầu triển khai...']);

            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No access token found');

            const body = {
                link_git: repositoryUrl || null,
                token_git: accessTokenGit || null,
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

            setDeploymentLogs(prev => [...prev, 'Đang triển khai...!']);
            // setTimeout(() => {
            //     viewLogs();
            // }, 2000);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi triển khai';
            setDeploymentLogs(prev => [...prev, `❌ Lỗi: ${errorMsg}`]);
            alert(errorMsg);
        } finally {
            setDeployLoading(false);
            setRepoVerified(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Đang tải...</div>
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


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specs Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg text-gray-800 mb-4">Thông số kỹ thuật</h3>
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

                                </div>
                            </div>


                        </div>

                        {/* RAM Usage */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">RAM:</span>
                                <div className="text-right">
                                    <span className="font-medium">{runtimeData.info_runtime?.ram} MB</span>

                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* GitHub Integration */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg text-gray-800 mb-4">Kết nối GitHub</h3>
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
                                    setRepoVerified(false);
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
                                    value={accessTokenGit}
                                    onChange={(e) => setAccessTokenGit(e.target.value)}
                                    placeholder="ghp_..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    onClick={testGitHubRepository}
                                    disabled={testingRepo || !repositoryUrl.trim() || !accessTokenGit.trim()}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${testingRepo || !repositoryUrl.trim() || !accessTokenGit.trim()
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


                    </div>
                </div>
            </div>



            {/* Pods Logs - ĐƠN GIẢN HÓA */}
            <div className="bg-white border border-gray-200 rounded-lg p-10">
                <h3 className="text-lg font-semibold text-gray-800">Log triển khai</h3>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm max-h-96">
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
            {
                runtimeData.link_return && (
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
                )
            }

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
                <button
                    onClick={handleDeploy}
                    disabled={!repoVerified || deployLoading}
                    className={`px-6 py-3 rounded-lg  ${!repoInfo || deployLoading
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
                    Xem Logs
                </button>
            </div>
        </div >
    );
};

export default RuntimeService;