package com.devji.account_book.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.springframework.util.StringUtils;

@Component
@Slf4j
public class JwtUtil {
    // Header KEY 값
    public static final String AUTHORIZATION_HEADER = "Authorization";
    // 사용자 권한 값의 KEY
    public static final String AUTHORIZATION_KEY = "auth";
    // Refresh Token Cookie Name
    public static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";

    // Access Token 만료시간 (5분)
    private static final long ACCESS_TOKEN_TIME = 5 * 60 * 1000L;
    // Refresh Token 만료시간 (7일)
    public static final long REFRESH_TOKEN_TIME = 7 * 24 * 60 * 60 * 1000L;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.refresh.secret}")
    private String refreshSecret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    private SecretKey getRefreshSigningKey() {
        return Keys.hmacShaKeyFor(refreshSecret.getBytes());
    }

    // Access Token 생성
    public String createAccessToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("email", email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("email", email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_TIME))
                .signWith(getRefreshSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // AccessToken을 Cookie에 담기
    public Cookie addAccessTokenToCookie(String accessToken) {
        try {
            accessToken = URLEncoder.encode(accessToken, "utf-8").replaceAll("\\+", "%20");
            Cookie refreshTokenCookie = new Cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
            refreshTokenCookie.setHttpOnly(true);
//            refreshTokenCookie.setSecure(true); // HTTPS에서만 전송
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge((int) (REFRESH_TOKEN_TIME / 1000)); // 쿠키유효시간은 리프레시 토큰 유효시간과 같게 유지
            refreshTokenCookie.setAttribute("SameSite", "Strict"); // CSRF 보호
            return refreshTokenCookie;
        } catch (UnsupportedEncodingException e) {
            log.error("Refresh Token encoding 오류: {}", e.getMessage());
            throw new RuntimeException("토큰 인코딩 실패", e);
        }
    }

    // Cookie에서 Access Token 가져오기
    public String getAccessTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // 쿠키 삭제
    public Cookie deleteCookie() {
        Cookie cookie = new Cookie("accessToken", "");
        cookie.setHttpOnly(true);
//        cookie.setSecure(true);//https에서만 전송
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUsernameFromRefreshToken(String token) {
        return extractClaimFromRefreshToken(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Date extractExpirationFromRefreshToken(String token) {
        return extractClaimFromRefreshToken(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public <T> T extractClaimFromRefreshToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaimsFromRefreshToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        Claims claims = null;
        try{
            claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)//토큰이 만료되면 검증 포함 파싱은 불가
                    .getBody();
        } catch (ExpiredJwtException e) {
            claims = e.getClaims();
        }

        return claims;
    }

    private Claims extractAllClaimsFromRefreshToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getRefreshSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Boolean isRefreshTokenExpired(String token) {
        return extractExpirationFromRefreshToken(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public Boolean validateRefreshToken(String token, UserDetails userDetails) {
        final String username = extractUsernameFromRefreshToken(token);
        return (username.equals(userDetails.getUsername()) && !isRefreshTokenExpired(token));
    }

    public boolean isValidToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.warn("Access token expired: {}", e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isValidRefreshToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getRefreshSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return !isRefreshTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.warn("Refresh token expired: {}", e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    // 토큰에서 역할 정보 추출
    public String getRoleFromToken(String token) {
        return extractClaim(token, claims -> claims.get(AUTHORIZATION_KEY, String.class));
    }

    public String getRoleFromRefreshToken(String token) {
        return extractClaimFromRefreshToken(token, claims -> claims.get(AUTHORIZATION_KEY, String.class));
    }
}
