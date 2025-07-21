//package com.devji.account_book.auth.filter;
//
//import com.devji.account_book.auth.util.JwtUtil;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.util.StringUtils;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//@Slf4j(topic = "JWT 검증 및 인가")
//@RequiredArgsConstructor
//public class JwtAuthorizationFilter extends OncePerRequestFilter { // 요청에 대해서 한 번만 동작하는 필터: OncePerRequestFilter
//
//    private final JwtUtil jwtUtil;
//    private final UserDetailsServiceImpl userDetailsService;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        String accessTokenValue = jwtUtil.getAccessTokenFromHeader(request);
//        // 토큰 값이 있으면, 토큰 검증
//        if (StringUtils.hasText(accessTokenValue)) {
//            if (!jwtUtil.isNotExpiredAccessToken(accessTokenValue) || !jwtUtil.validateToken(accessTokenValue)) {
//                return;
//            }
//            // 토큰에서 userId 받아온 후
//            String userIdFromAccessToken = jwtUtil.getUserIdFromAccessToken(accessTokenValue);
//            // 인증 객체를 생성하여, 인증 처리
//            setAuthentication(userIdFromAccessToken);
//        }
//        filterChain.doFilter(request, response);
//    }
//
//    // 인증 처리
//    public void setAuthentication(String userId) {
//        Authentication authentication = createAuthentication(userId);
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//    }
//
//    // 인증 객체 생성
//    private Authentication createAuthentication(String userId) {
//        UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
//        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
//    }
//}
