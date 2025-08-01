package com.devji.account_book.auth.config;

import com.devji.account_book.auth.filter.JwtAuthenticationFilter;
import com.devji.account_book.auth.filter.JwtAuthorizationFilter;
import com.devji.account_book.auth.security.PrincipalDetails;
import com.devji.account_book.auth.security.PrincipalDetailsService;
import com.devji.account_book.auth.util.JwtUtil;
import com.devji.account_book.auth.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity(debug = false)
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final PrincipalDetailsService principalDetails;
    private final UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource;
    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final AuthenticationConfiguration authenticationConfiguration;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(redisUtil, jwtUtil);
        filter.setAuthenticationManager(authenticationManager(authenticationConfiguration));
        filter.setFilterProcessesUrl("/api/auth/login"); // 기본 "/login"에서 로그인 url 변경
        return filter;
    }

    @Bean
    public JwtAuthorizationFilter jwtAuthorizationFilter() {
        return new JwtAuthorizationFilter(jwtUtil, principalDetails);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // CSRF 설정 및 시큐리티 기본 설정 비활성화
        http.csrf(AbstractHttpConfigurer::disable);
        http.formLogin(AbstractHttpConfigurer::disable);
        http.httpBasic(AbstractHttpConfigurer::disable);

        // 경로별 인가 작업
        http
                .cors(cors -> cors.configurationSource(urlBasedCorsConfigurationSource))
                .authorizeHttpRequests((authorizeHttpRequests) -> authorizeHttpRequests
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated() // 그 외 모든 요청 인증처리
                );

        // 필터 추가
        // 인증 필터 => 식별 가능한 정보로 서비스에 등록된 사용자의 신원을 입증하는 과정 (로그인)
        // addFilterBefore(필터, 기준_필터) 와 같이 사용하며, 기준_필터 이전에 필터가 먼저 실행되도록 설정
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        // 인가 필터 => 인증된 사용자에 대한 자원 접근 권한 확인
        http.addFilterBefore(jwtAuthorizationFilter(), JwtAuthenticationFilter.class);
        //http.addFilterBefore(jwtLogoutFilter(), LogoutFilter.class);

        // 기본 설정인 Session 방식은 사용하지 않고 JWT 방식을 사용하기 위한 설정
        // 세션을 stateless상태로 관리!
        http
                .sessionManagement((sessionManagement) ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}
