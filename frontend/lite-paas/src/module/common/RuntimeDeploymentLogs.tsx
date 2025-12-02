import React, { useEffect, useState } from "react";

interface DeploymentLog {
    app: string;
    log?: string;
    status?: string;
    host?: string;
}

const DeploymentLogsWS: React.FC<{ serviceId: string }> = ({ serviceId }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<{ [app: string]: string }>({});

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:3000/service/${serviceId}`);

        ws.onopen = () => console.log("WebSocket connected");

        ws.onmessage = (event) => {
            try {
                const data: DeploymentLog = JSON.parse(event.data);

                if (data.log) {
                    // Append log message
                    setLogs((prev) => [...prev, `[${data.app}] ${data.log!.trim()}`]);
                }

                if (data.status) {
                    // Update app status
                    setStatus((prev) => ({ ...prev, [data.app!]: data.status! }));
                }
            } catch (err) {
                console.error("Invalid WS message", err);
            }
        };

        ws.onerror = (err) => console.error("WebSocket error", err);

        ws.onclose = () => console.log("WebSocket disconnected");

        return () => ws.close();
    }, [serviceId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "running": return "text-green-600 bg-green-100";
            case "stopped": return "text-gray-600 bg-gray-100";
            case "failed": return "text-red-600 bg-red-100";
            default: return "text-blue-600 bg-blue-100";
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">Deployment Logs</h3>

            {/* Status per app */}
            {Object.entries(status).map(([app, st]) => (
                <div key={app} className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(st)}`}>
                        {st}
                    </span>
                    <span>{app}</span>
                </div>
            ))}

            {/* Logs */}
            <div className="bg-gray-50 border p-2 rounded h-64 overflow-y-auto">
                {logs.map((log, idx) => (
                    <div key={idx} className="text-sm text-gray-700">{log}</div>
                ))}
            </div>
        </div>
    );
};

export default DeploymentLogsWS;
