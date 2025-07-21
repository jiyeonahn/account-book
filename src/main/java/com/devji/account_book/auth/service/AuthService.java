package com.devji.account_book.auth.service;


import com.devji.account_book.auth.dto.SignupRequest;
import com.devji.account_book.auth.util.JwtUtil;
import com.devji.account_book.entity.User;
import com.devji.account_book.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;


@Slf4j(topic = "Auth Service")
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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


}
