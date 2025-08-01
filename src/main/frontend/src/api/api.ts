// src/api/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type UnauthorizedCallback = () => void;

class ApiClient {
    private axiosInstance: AxiosInstance;
    private onUnauthorized: UnauthorizedCallback | null = null;

    constructor(baseURL: string = 'http://localhost:8080/api') {
        // axios 인스턴스 생성
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 10000, // 10초 타임아웃
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 요청 인터셉터 - 토큰 자동 추가
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터 - 401 에러 처리
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    if (this.onUnauthorized) {
                        this.onUnauthorized();
                    }
                    return Promise.reject(new Error('로그인이 만료되었습니다. 다시 로그인해주세요.'));
                }

                // 네트워크 에러 처리
                if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                    return Promise.reject(new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'));
                }

                // 서버 에러 메시지 처리
                const errorMessage = error.response?.data?.message || `HTTP Error: ${error.response?.status}`;
                return Promise.reject(new Error(errorMessage));
            }
        );
    }

    // 401 콜백 등록
    setUnauthorizedCallback(callback: UnauthorizedCallback) {
        this.onUnauthorized = callback;
    }

    async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(endpoint, config);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.post<T>(endpoint, data, config);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.put<T>(endpoint, data, config);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.delete<T>(endpoint, config);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // 파일 업로드를 위한 메서드 (multipart/form-data)
    async uploadFile<T = any>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.post<T>(endpoint, formData, {
                ...config,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...config?.headers,
                },
            });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // baseURL 변경 메서드
    setBaseURL(baseURL: string) {
        this.axiosInstance.defaults.baseURL = baseURL;
    }

    // 타임아웃 설정 메서드
    setTimeout(timeout: number) {
        this.axiosInstance.defaults.timeout = timeout;
    }

    // axios 인스턴스 직접 접근 (고급 사용)
    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

// 싱글톤 인스턴스
const apiClient = new ApiClient();

export default apiClient;
