import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from "./pages/DashboardPage";

function App() {
  // 로그인 상태 관리 (실제로는 Context나 상태관리 라이브러리 사용 권장)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    // 실제로는 localStorage, sessionStorage, 또는 쿠키에서 토큰 확인
    const token = localStorage.getItem('authToken');

    if (token) {
      // TODO: 백엔드 구현 후 토큰 유효성 검증
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          로딩 중...
        </div>
    );
  }

  return (
      <Router>
        <div className="App">
          <Routes>
            {/* 루트 경로 - 로그인 상태에 따라 리다이렉트 */}
            <Route
                path="/"
                element={
                  isAuthenticated ?
                      <Navigate to="/main" replace /> :
                      <Navigate to="/login" replace />
                }
            />

            {/* 로그인 페이지 - 이미 로그인된 경우 메인으로 리다이렉트 */}
            <Route
                path="/login"
                element={
                  isAuthenticated ?
                      <Navigate to="/main" replace /> :
                      <LoginPage setIsAuthenticated={setIsAuthenticated} />
                }
            />

            {/* 메인 페이지 - 로그인하지 않은 경우 로그인 페이지로 리다이렉트 */}
            <Route
                path="/main"
                element={
                    <DashboardPage setIsAuthenticated={setIsAuthenticated} />
                  // isAuthenticated ?
                  //     <DashboardPage setIsAuthenticated={setIsAuthenticated} /> :
                  //     <Navigate to="/login" replace />
                }
            />

            {/* 404 페이지 */}
            <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
