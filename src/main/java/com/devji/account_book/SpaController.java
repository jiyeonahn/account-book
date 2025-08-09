package com.devji.account_book;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    
    @GetMapping(value = {
            "/",
            "/login",
            "/main",
            // 필요한 React 라우트들 추가
    })
    public String spa() {
        return "forward:/index.html";
    }
}
