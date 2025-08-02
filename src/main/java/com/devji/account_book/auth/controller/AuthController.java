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
import java.io.UnsupportedEncodingException;
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
    public void refreshToken(HttpServletRequest request, HttpServletResponse response)
            throws UnsupportedEncodingException {
        String accessToken = jwtUtil.getAccessTokenFromCookie(request);
        Cookie newCookie = authService.refresh(accessToken);
        response.addCookie(newCookie);
    }

}
