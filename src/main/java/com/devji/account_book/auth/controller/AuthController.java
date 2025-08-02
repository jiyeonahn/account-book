package com.devji.account_book.auth.controller;

import com.devji.account_book.auth.dto.MessageResponse;
import com.devji.account_book.auth.dto.SignupRequest;
import com.devji.account_book.auth.security.PrincipalDetails;
import com.devji.account_book.auth.security.PrincipalDetailsService;
import com.devji.account_book.auth.service.AuthService;
import com.devji.account_book.auth.util.JwtUtil;
import com.devji.account_book.auth.util.RedisUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final PrincipalDetailsService principalDetailsService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignupRequest signupRequestDto) {
        authService.signup(signupRequestDto);
        return ResponseEntity.ok(new MessageResponse("회원가입이 완료되었습니다"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 1. 쿠키에서 accessToken 추출
            String accessToken = jwtUtil.getAccessTokenFromCookie(request);

            if (accessToken == null) { //accessToken이 비어있다면
                return handleRefreshFailure(response, "엑세스 토큰이 없습니다.");
            }

            // 2. 토큰이 만료되었는지 확인
            if (jwtUtil.isValidToken(accessToken)) {
                return ResponseEntity.ok(Map.of("message", "토큰이 아직 유효합니다."));
            }

            // 3. 만료된 토큰에서 사용자명(email) 추출
            String email = jwtUtil.extractUsername(accessToken);

            // 4. Redis에서 refreshToken 조회
            String storedRefreshToken = redisUtil.getRefreshToken(email);
            if (storedRefreshToken == null) {
                return handleRefreshFailure(response, "리프레시 토큰이 존재하지 않습니다.");
            }

            log.info("리프레시 토큰::::: ", storedRefreshToken);

            // 5. refreshToken 검증
            if (!jwtUtil.isValidToken(storedRefreshToken)) {
                //유효하지 않은 refreshToken이면 Redis에서 삭제
                redisUtil.deleteRefreshToken(email);
                return handleRefreshFailure(response, "리프레시 토큰이 유효하지 않습니다.");
            }

            // 6. 새로운 accessToken 발급
            String newAccessToken = jwtUtil.createAccessToken(email);

            // 7. 새로운 accessToken을 쿠키에 설정
            Cookie newAccessTokenCookie = jwtUtil.addAccessTokenToCookie(newAccessToken);
            response.addCookie(newAccessTokenCookie);

            // 8. 사용자 정보 조회 및 응답
            PrincipalDetails principalDetails = (PrincipalDetails) principalDetailsService.loadUserByUsername(email);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "토큰이 성공적으로 재발급되었습니다.");
            responseBody.put("user", Map.of(
                    "id", principalDetails.getUser().getId(),
                    "email", principalDetails.getUser().getEmail(),
                    "name", principalDetails.getUser().getName()
            ));
            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생",e);
            return handleRefreshFailure(response, "토큰 재발급 중 오류가 발생했습니다.");
        }
    }

    private ResponseEntity<Map<String, String>> handleRefreshFailure(HttpServletResponse response, String message) {
        Cookie expiresCookie = jwtUtil.deleteCookie();
        response.addCookie(expiresCookie);

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", message);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }
}
