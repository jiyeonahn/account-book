// src/api/api.ts

type UnauthorizedCallback = () => void;

class ApiClient {
    private baseURL: string;
    private onUnauthorized: UnauthorizedCallback | null = null;

    constructor(baseURL: string = 'http://localhost:8080/api') {
        this.baseURL = baseURL;
    }

    // 401 콜백 등록
    setUnauthorizedCallback(callback: UnauthorizedCallback) {
        this.onUnauthorized = callback;
    }

    async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            ...options,
        });
    }

    async post<T = any>(endpoint: string, data: any = null, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
            ...options,
        });
    }

    async put<T = any>(endpoint: string, data: any = null, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : null,
            ...options,
        });
    }

    async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }

    private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        const token = localStorage.getItem('accessToken');
        if (token) {
            // @ts-ignore
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                if (this.onUnauthorized) {
                    this.onUnauthorized();
                }
                throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }

            return response as unknown as T;
        } catch (error: unknown) {
            if (error instanceof TypeError) {
                throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
            }
            throw error;
        }
    }
}

// 싱글톤 인스턴스
const apiClient = new ApiClient();

export default apiClient;
