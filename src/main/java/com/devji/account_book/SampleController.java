package com.devji.account_book;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {

    @GetMapping("/api/data")
    public String test(){
        return "Hello, world!";
    }
}
