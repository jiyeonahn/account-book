package com.devji.account_book.auth.service;


import com.devji.account_book.auth.dto.SignupRequest;
import com.devji.account_book.auth.entity.User;
import com.devji.account_book.auth.repository.UserRepository;
import com.devji.account_book.auth.security.PrincipalDetails;
import com.devji.account_book.auth.security.PrincipalDetailsService;
import com.devji.account_book.auth.util.JwtUtil;
import com.devji.account_book.auth.util.RedisUtil;
import io.lettuce.core.RedisConnectionException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


@Slf4j(topic = "Auth Service")
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PrincipalDetailsService principalDetailsService;

    public void signup(SignupRequest signupRequest) {
        // ID 중복 확인
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다");
        }

        User user = User.builder()
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .name(signupRequest.getName())
                .build();

        userRepository.save(user);
    }

    public Cookie refresh(String accessToken) throws UnsupportedEncodingException {
        try {
            if (accessToken == null) { //accessToken이 비어있다면
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "엑세스 토큰이 없습니다.");
            }

            String email = jwtUtil.extractUsername(accessToken);

            // Redis에서 refreshToken 가져오기
            String storedRefreshToken = redisUtil.getRefreshToken(email);
            if (storedRefreshToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "리프레시 토큰이 존재하지 않습니다.");
            }

            // refreshToken 유효성 검사
            if (!jwtUtil.isValidRefreshToken(storedRefreshToken)) {
                redisUtil.deleteRefreshToken(email);
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "리프레시 토큰이 유효하지 않습니다.");
            }

            String newAccessToken = jwtUtil.createAccessToken(email);

            return jwtUtil.addAccessTokenToCookie(newAccessToken);

        } catch (RedisConnectionException e) {
            log.error("Redis 장애", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류");
        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "토큰 재발급 중 오류가 발생했습니다.");
        }
    }

    public void logout(String accessToken){
        String email = jwtUtil.extractUsername(accessToken);
        redisUtil.deleteRefreshToken(email);
    }
}
