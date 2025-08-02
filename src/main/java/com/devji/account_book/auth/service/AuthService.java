package com.devji.account_book.auth.service;


import com.devji.account_book.auth.dto.SignupRequest;
import com.devji.account_book.auth.entity.User;
import com.devji.account_book.auth.repository.UserRepository;
import com.devji.account_book.auth.security.PrincipalDetails;
import com.devji.account_book.auth.security.PrincipalDetailsService;
import com.devji.account_book.auth.util.JwtUtil;
import com.devji.account_book.auth.util.RedisUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


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

    public ResponseEntity<?> refresh(String accessToken) {
        try {
            if (jwtUtil.isValidToken(accessToken)) {
                return ResponseEntity.ok(Map.of("message", "토큰이 아직 유효합니다."));
            }

            String email = jwtUtil.extractUsername(accessToken);
            String storedRefreshToken = redisUtil.getRefreshToken(email);
            if (storedRefreshToken == null) {
                return unauthorizedWithCookie("리프레시 토큰이 존재하지 않습니다.");
            }

            if (!jwtUtil.isValidToken(storedRefreshToken)) {
                redisUtil.deleteRefreshToken(email);
                return unauthorizedWithCookie("리프레시 토큰이 유효하지 않습니다.");
            }

            String newAccessToken = jwtUtil.createAccessToken(email);
            Cookie newCookie = jwtUtil.addAccessTokenToCookie(newAccessToken);

            PrincipalDetails principalDetails = (PrincipalDetails) principalDetailsService.loadUserByUsername(email);

            Map<String, Object> responseBody = Map.of(
                    "message", "토큰이 성공적으로 재발급되었습니다.",
                    "user", Map.of(
                            "id", principalDetails.getUser().getId(),
                            "email", principalDetails.getUser().getEmail(),
                            "name", principalDetails.getUser().getName()
                    )
            );

            return ResponseEntity.ok()
                    .header("Set-Cookie", newCookie.toString()) // 쿠키를 헤더로 세팅
                    .body(responseBody);

        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생", e);
            return unauthorizedWithCookie("토큰 재발급 중 오류가 발생했습니다.");
        }
    }

    private ResponseEntity<Map<String, String>> unauthorizedWithCookie(String message) {
        Cookie expiresCookie = jwtUtil.deleteCookie();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header("Set-Cookie", expiresCookie.toString())
                .body(Map.of("error", message));
    }

}
