import React, { useState } from 'react';
import { DollarSign, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

interface LoginPageProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const AuthScreens: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
    const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: ''
    });

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = () => {
        console.log('로그인:', formData);
        // 여기서 실제 로그인 API 호출
    };

    const handleSignup = () => {
        console.log('회원가입:', formData);
        // 여기서 실제 회원가입 API 호출
    };

    const LoginScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* 로고 및 제목 */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-2 mb-4">
                        <div className="bg-blue-600 p-3 rounded-2xl">
                            <DollarSign className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">가계부에 오신걸 환영해요</h2>
                    <p className="mt-2 text-gray-600">나만의 똑똑한 가계부로 시작해보세요</p>
                </div>

                {/* 로그인 폼 */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="space-y-4">
                        {/* 이메일 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="이메일을 입력해주세요"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* 비밀번호 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="비밀번호를 입력해주세요"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 로그인 옵션 */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                        </label>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>

                    {/* 로그인 버튼 */}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all shadow-lg"
                    >
                        로그인
                    </button>

                    {/* 구분선 */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">또는</span>
                        </div>
                    </div>

                    {/* 소셜 로그인 */}
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-5 h-5 bg-yellow-400 rounded"></div>
                            <span className="font-medium text-gray-700">카카오로 로그인</span>
                        </button>
                        <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-5 h-5 bg-green-500 rounded"></div>
                            <span className="font-medium text-gray-700">네이버로 로그인</span>
                        </button>
                    </div>

                    {/* 회원가입 링크 */}
                    <div className="text-center">
                        <span className="text-gray-600">계정이 없으신가요? </span>
                        <button
                            onClick={() => setCurrentScreen('signup')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const SignupScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* 로고 및 제목 */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-2 mb-4">
                        <div className="bg-green-600 p-3 rounded-2xl">
                            <DollarSign className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">새로운 시작을 함께해요</h2>
                    <p className="mt-2 text-gray-600">몇 가지 정보만 입력하면 바로 시작할 수 있어요</p>
                </div>

                {/* 회원가입 폼 */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="space-y-4">
                        {/* 이름 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="이름을 입력해주세요"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* 이메일 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="이메일을 입력해주세요"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* 전화번호 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="010-0000-0000"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* 비밀번호 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="8자 이상 입력해주세요"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">영문, 숫자, 특수문자를 포함해 8자 이상</p>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="비밀번호를 다시 입력해주세요"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 약관 동의 */}
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <span className="ml-2 text-sm text-gray-700">
                <span className="text-green-600 font-medium">[필수]</span> 이용약관에 동의합니다
              </span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <span className="ml-2 text-sm text-gray-700">
                <span className="text-green-600 font-medium">[필수]</span> 개인정보 처리방침에 동의합니다
              </span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <span className="ml-2 text-sm text-gray-600">
                <span className="text-gray-500">[선택]</span> 마케팅 정보 수신에 동의합니다
              </span>
                        </label>
                    </div>

                    {/* 회원가입 버튼 */}
                    <button
                        onClick={handleSignup}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] transition-all shadow-lg"
                    >
                        회원가입
                    </button>

                    {/* 로그인 링크 */}
                    <div className="text-center">
                        <span className="text-gray-600">이미 계정이 있으신가요? </span>
                        <button
                            onClick={() => setCurrentScreen('login')}
                            className="text-green-600 hover:text-green-800 font-medium"
                        >
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {currentScreen === 'login' ? <LoginScreen /> : <SignupScreen />}

            {/* 화면 전환 버튼 (데모용) */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setCurrentScreen(currentScreen === 'login' ? 'signup' : 'login')}
                    className="bg-white shadow-lg rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200"
                >
                    {currentScreen === 'login' ? '회원가입 화면' : '로그인 화면'}
                </button>
            </div>
        </div>
    );
};

export default AuthScreens;
