package com.devji.account_book.auth.filter;

import com.devji.account_book.auth.dto.LoginRequest;
import com.devji.account_book.auth.security.PrincipalDetails;
import com.devji.account_book.auth.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import java.io.IOException;

// 1차적으로 로그인을 처리하는 Filter
// 로그인 값들로 들어온 email,password를 갖고 인증 과정 후 JWT 반환
// Spring Security는 기본 UsernamePasswordAuthenticationFilter 세션 기반 로그인에 맞춰져 있으므로 커스텀 필요
@Slf4j(topic = "로그인 및 JWT 생성")
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final JwtUtil jwtUtil;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        log.info("*** JWT Authentication Filter ***");
        try {
            LoginRequest loginRequestDto = new ObjectMapper().readValue(request.getInputStream(), LoginRequest.class);

            return getAuthenticationManager().authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.getEmail(),
                            loginRequestDto.getPassword(),
                            null // 권한 정보인데, 인증 요청을 처리하는 데에는 필요하지 않음. 권한 정보는 인증 요청이 성공하면 Authentication객체를 통해 반환
                    )
            );
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }


    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        PrincipalDetails userDetails = (PrincipalDetails) authResult.getPrincipal();// UserDetails 인터페이스를 구현한 객체가 넘어옴

        String accessToken = jwtUtil.createToken(userDetails.getUser().getEmail());

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("accessToken", accessToken);
        responseBody.put("user", Map.of(
                "id", userDetails.getUser().getId(),
                "email", userDetails.getUser().getEmail(),
                "name", userDetails.getUser().getName()
        ));

        String json = new ObjectMapper().writeValueAsString(responseBody);
        response.getWriter().write(json);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        log.error("유효하지 않은 ID or 비밀번호: {}", failed.getMessage());
        response.setStatus(401);
    }
}
