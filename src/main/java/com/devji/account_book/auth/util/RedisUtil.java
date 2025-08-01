package com.devji.account_book.auth.util;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisUtil {

    private final RedisTemplate<String, String> redisTemplate;

    public void setRefreshToken(String email, String refreshToken, long expirationMs) {
        redisTemplate.opsForValue().set("RT:" + email, refreshToken, Duration.ofMillis(expirationMs));
    }

    public String getRefreshToken(String email) {
        return redisTemplate.opsForValue().get("RT:" + email);
    }

    public void deleteRefreshToken(String email) {
        redisTemplate.delete("RT:" + email);
    }
}
