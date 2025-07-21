package com.devji.account_book.auth.controller;

import com.devji.account_book.auth.dto.JwtResponse;
import com.devji.account_book.auth.dto.LoginRequest;
import com.devji.account_book.auth.dto.MessageResponse;
import com.devji.account_book.auth.dto.SignupRequest;
import com.devji.account_book.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignupRequest signupRequestDto) {
        authService.signup(signupRequestDto);
        return ResponseEntity.ok(new MessageResponse("회원가입이 완료되었습니다"));
    }
}
