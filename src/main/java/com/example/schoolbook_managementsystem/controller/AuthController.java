package com.example.schoolbook_managementsystem.controller;

import com.example.schoolbook_managementsystem.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password) {

        if (username.equals("admin")) {
            return jwtUtil.generateToken(username, "ADMIN");
        } else if (username.equals("staff")) {
            return jwtUtil.generateToken(username, "STAFF");
        } else {
            return jwtUtil.generateToken(username, "PARENT");
        }
    }
}