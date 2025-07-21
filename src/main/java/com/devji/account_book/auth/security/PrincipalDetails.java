package com.devji.account_book.auth.security;

import com.devji.account_book.entity.Role;
import com.devji.account_book.entity.User;
import java.util.Collection;
import java.util.Collections;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/*
* Spring Security는 UserDetails를 사용하여 사용자 정보를 제공하고, 사용자의 권한을 관리 함
*
 */
@Getter
@RequiredArgsConstructor
public class PrincipalDetails implements UserDetails {

    private final User user;

    public User getUser() {
        return user;
    }

    // 사용자의 권한 정보를 반환하여, spring security의 권한 검증 과정에서 사용
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Role role = user.getRole();
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }
}
