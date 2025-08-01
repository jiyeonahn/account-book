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
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true // 쿠키 전송을 위해 필수
        });

        // 요청 인터셉터
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log('Request config:', config); // 디버깅용
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터 - 401, 403 에러 처리
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            async (error) => {
                console.log('Response error:', error.response?.status, error.response?.data); // 디버깅용

                // 401 에러: 토큰 만료
                if (error.response?.status === 401 && !error.config._retry) {
                    error.config._retry = true;
                    try {
                        await this.axiosInstance.post('/auth/refresh');
                        return this.axiosInstance(error.config);
                    } catch (refreshError) {
                        if (this.onUnauthorized) {
                            this.onUnauthorized();
                        }
                        return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
                    }
                }

                // 403 에러: 권한 없음
                if (error.response?.status === 403) {
                    console.error('403 Forbidden:', error.response.data);
                    if (this.onUnauthorized) {
                        this.onUnauthorized();
                    }
                    return Promise.reject(new Error('접근 권한이 없습니다.'));
                }

                return Promise.reject(error);
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

    setBaseURL(baseURL: string) {
        this.axiosInstance.defaults.baseURL = baseURL;
    }

    setTimeout(timeout: number) {
        this.axiosInstance.defaults.timeout = timeout;
    }

    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

const apiClient = new ApiClient();

export default apiClient;
