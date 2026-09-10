const API_BASE = "http://localhost:8000/api/v1";

export interface CameraData {
  id: string;
  name: string;
  stream_url: string;
  stream_type: "rtsp" | "mjpeg" | "webcam" | "file" | "synthetic";
  sector: string;
  status: "online" | "offline" | "degraded";
  ai_status: "active" | "bypassed" | "error";
  fps: number;
  resolution: string;
  virtual_fence?: string;
  latency_ms?: number;
  created_at?: string;
}

export interface TestConnectionRequest {
  stream_url: string;
  stream_type?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  frame_width?: number;
  frame_height?: number;
  fps?: number;
}

export const apiService = {
  async getCameras(): Promise<CameraData[]> {
    try {
      const res = await fetch(`${API_BASE}/cameras`);
      if (!res.ok) throw new Error("Failed to fetch cameras");
      return await res.json();
    } catch (e) {
      console.warn("Backend API unavailable, using local camera registry fallback.", e);
      return [];
    }
  },

  async addCamera(camera: Partial<CameraData>): Promise<CameraData> {
    const res = await fetch(`${API_BASE}/cameras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(camera),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to add camera");
    }
    return await res.json();
  },

  async testConnection(req: TestConnectionRequest): Promise<TestConnectionResponse> {
    try {
      const res = await fetch(`${API_BASE}/cameras/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      return await res.json();
    } catch (e) {
      return {
        success: false,
        message: "Could not reach backend server at http://localhost:8000.",
      };
    }
  },

  async updateCameraFence(cameraId: string, fenceGeoJson: string): Promise<CameraData> {
    const res = await fetch(`${API_BASE}/cameras/${cameraId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ virtual_fence: fenceGeoJson }),
    });
    if (!res.ok) throw new Error("Failed to update camera fence");
    return await res.json();
  },

  async deleteCamera(cameraId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/cameras/${cameraId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Failed to delete camera from backend API", e);
    }
  },

  async uploadVideoFile(file: File): Promise<{ success: boolean; file_path: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/cameras/upload-video`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to upload video file.");
    }
    return await res.json();
  },

  async getAlerts(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async updateAlertStatus(alertId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update alert status");
    return await res.json();
  },

  async getIncidents(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/incidents`);
      if (!res.ok) throw new Error("Failed to fetch incidents");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async createIncident(incident: any): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    if (!res.ok) throw new Error("Failed to create incident");
    return await res.json();
  },

  async updateIncident(incidentId: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update incident");
    return await res.json();
  }
};
