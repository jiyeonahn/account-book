package com.devji.account_book.auth.filter;

import com.devji.account_book.auth.security.PrincipalDetailsService;
import com.devji.account_book.auth.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j(topic = "JWT 검증 및 인가")
@RequiredArgsConstructor
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final PrincipalDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String jwt = jwtUtil.getAccessTokenFromCookie(request);
        String username = null;
        boolean isTokenExpired = false;

        if (jwt != null) {
            try {
                if (jwtUtil.isValidToken(jwt)) {
                    username = jwtUtil.extractUsername(jwt);
                } else {
                    log.debug("유효하지 않은 토큰입니다: {}", request.getRequestURI());
                    sendUnauthorizedResponse(response, "유효하지 않은 토큰입니다.");
                    return;
                }
            } catch (ExpiredJwtException e) {
                log.debug("토큰이 만료되었습니다: {}", request.getRequestURI());
                sendUnauthorizedResponse(response, "토큰이 만료되었습니다.");
                return;
            } catch (Exception e) {
                log.debug("토큰 검증 중 예외 발생: {}", request.getRequestURI());
                sendUnauthorizedResponse(response, "토큰 검증 중 오류가 발생했습니다.");
                return;
            }
        }

        // 인증 처리
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                log.error("사용자 인증 처리 중 오류 발생", e);
                sendUnauthorizedResponse(response, "인증 처리 중 오류가 발생했습니다.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 401 Unauthorized 응답 전송
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", message);
        errorResponse.put("code", "UNAUTHORIZED");

        String json = new ObjectMapper().writeValueAsString(errorResponse);
        response.getWriter().write(json);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        return path.startsWith("/api/auth/") ||
                path.equals("/") ||
                path.startsWith("/static/") ||
                path.endsWith(".html") ||
                path.endsWith(".css") ||
                path.endsWith(".js") ||
                path.endsWith(".ico") ||
                path.startsWith("/main") ||  // React 라우팅 경로
                path.startsWith("/login");
    }
}
