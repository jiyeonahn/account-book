import React, {useState, useCallback, useMemo} from 'react';
import {DollarSign, Eye, EyeOff, Mail, Lock, User, Phone} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {userAPI} from '../api/userApi';

interface AuthScreensProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const AuthScreens: React.FC<AuthScreensProps> = ({setIsAuthenticated}) => {
    const navigate = useNavigate();
    const [currentScreen, setCurrentScreen] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: ''
    });

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleLogin = useCallback(async () => {
        if (!formData.email || !formData.password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await userAPI.login({email: formData.email, password: formData.password});

            if (response.ok) {
                console.log('로그인 성공:', response.headers.get("token"));
                setIsAuthenticated(true);
                const accessToken: string | null = response.headers.get("token");
                if (accessToken != null) {
                    localStorage.setItem("accessToken", accessToken);
                }
                navigate("/main")
            } else {
                const errorData = await response.json();
                alert(errorData.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [formData.email, formData.password, setIsAuthenticated]);

    const handleSignup = useCallback(async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (formData.password.length < 8) {
            alert('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await userAPI.signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            })

            console.log(response);
            if (response) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                setCurrentScreen('login');
            }
        } catch (error) {
            alert('회원가입 오류:'+ error);
        } finally {
            setIsLoading(false);
        }
    }, [formData]);

    const togglePassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const toggleConfirmPassword = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    const switchToSignup = useCallback(() => {
        setCurrentScreen('signup');
    }, []);

    const switchToLogin = useCallback(() => {
        setCurrentScreen('login');
    }, []);

    return (
        <div>
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center items-center space-x-2 mb-4">
                            <div
                                className={`p-3 rounded-2xl ${currentScreen === 'login' ? 'bg-blue-600' : 'bg-green-600'}`}>
                                <DollarSign className="h-8 w-8 text-white"/>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {currentScreen === 'login' ? '가계부에 오신걸 환영해요' : '새로운 시작을 함께해요'}
                        </h2>
                        <p className="mt-2 text-gray-600">
                            {currentScreen === 'login' ? '나만의 똑똑한 가계부로 시작해보세요' : '몇 가지 정보만 입력하면 바로 시작할 수 있어요'}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                        <div className="space-y-4">
                            {currentScreen === 'signup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                    <div className="relative">
                                        <User
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="이름을 입력해주세요"
                                            autoComplete="name"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="이메일을 입력해주세요"
                                        autoComplete="email"
                                        className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 ${
                                            currentScreen === 'login'
                                                ? 'focus:ring-blue-500'
                                                : 'focus:ring-green-500'
                                        } focus:border-transparent transition-all`}
                                    />
                                </div>
                            </div>

                            {currentScreen === 'signup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                                    <div className="relative">
                                        <Phone
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="010-0000-0000"
                                            autoComplete="tel"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder={currentScreen === 'login' ? "비밀번호를 입력해주세요" : "8자 이상 입력해주세요"}
                                        autoComplete={currentScreen === 'login' ? "current-password" : "new-password"}
                                        className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 ${
                                            currentScreen === 'login'
                                                ? 'focus:ring-blue-500'
                                                : 'focus:ring-green-500'
                                        } focus:border-transparent transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                                {currentScreen === 'signup' && (
                                    <p className="mt-1 text-xs text-gray-500">영문, 숫자, 특수문자를 포함해 8자 이상</p>
                                )}
                            </div>

                            {currentScreen === 'signup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="비밀번호를 다시 입력해주세요"
                                            autoComplete="new-password"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPassword}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5"/> :
                                                <Eye className="h-5 w-5"/>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {currentScreen === 'login' && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input type="checkbox"
                                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                                </label>
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    비밀번호를 잊으셨나요?
                                </button>
                            </div>
                        )}

                        {currentScreen === 'signup' && (
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input type="checkbox"
                                           className="rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                                    <span className="ml-2 text-sm text-gray-700">
                                        <span className="text-green-600 font-medium">[필수]</span> 이용약관에 동의합니다
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox"
                                           className="rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                                    <span className="ml-2 text-sm text-gray-700">
                                        <span className="text-green-600 font-medium">[필수]</span> 개인정보 처리방침에 동의합니다
                                    </span>
                                </label>
                                {/*<label className="flex items-center">*/}
                                {/*    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />*/}
                                {/*    <span className="ml-2 text-sm text-gray-600">*/}
                                {/*        <span className="text-gray-500">[선택]</span> 마케팅 정보 수신에 동의합니다*/}
                                {/*    </span>*/}
                                {/*</label>*/}
                            </div>
                        )}

                        <button
                            onClick={currentScreen === 'login' ? handleLogin : handleSignup}
                            disabled={isLoading}
                            className={`w-full ${
                                currentScreen === 'login'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                            } text-white py-3 px-4 rounded-lg font-medium transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {isLoading ? (currentScreen === 'login' ? '로그인 중...' : '회원가입 중...') : (currentScreen === 'login' ? '로그인' : '회원가입')}
                        </button>

                        {/*{currentScreen === 'login' && (*/}
                        {/*    <>*/}
                        {/*        <div className="relative">*/}
                        {/*            <div className="absolute inset-0 flex items-center">*/}
                        {/*                <div className="w-full border-t border-gray-200"></div>*/}
                        {/*            </div>*/}
                        {/*            <div className="relative flex justify-center text-sm">*/}
                        {/*                <span className="px-4 bg-white text-gray-500">또는</span>*/}
                        {/*            </div>*/}
                        {/*        </div>*/}

                        {/*        <div className="space-y-3">*/}
                        {/*            <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">*/}
                        {/*                <div className="w-5 h-5 bg-yellow-400 rounded"></div>*/}
                        {/*                <span className="font-medium text-gray-700">카카오로 로그인</span>*/}
                        {/*            </button>*/}
                        {/*            <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">*/}
                        {/*                <div className="w-5 h-5 bg-green-500 rounded"></div>*/}
                        {/*                <span className="font-medium text-gray-700">네이버로 로그인</span>*/}
                        {/*            </button>*/}
                        {/*        </div>*/}
                        {/*    </>*/}
                        {/*)}*/}

                        <div className="text-center">
                            <span className="text-gray-600">
                                {currentScreen === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
                            </span>
                            <button
                                onClick={currentScreen === 'login' ? switchToSignup : switchToLogin}
                                className={`font-medium ${
                                    currentScreen === 'login'
                                        ? 'text-blue-600 hover:text-blue-800'
                                        : 'text-green-600 hover:text-green-800'
                                }`}
                            >
                                {currentScreen === 'login' ? '회원가입' : '로그인'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={currentScreen === 'login' ? switchToSignup : switchToLogin}
                    className="bg-white shadow-lg rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200"
                >
                    {currentScreen === 'login' ? '회원가입 화면' : '로그인 화면'}
                </button>
            </div>
        </div>
    );
};

export default AuthScreens;
