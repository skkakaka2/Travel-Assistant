package com.travel.assistant.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travel.assistant.common.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

/**
 * Spring Security 安全配置
 * 
 * Spring Security 是一个强大的安全框架，用于处理认证和授权
 * 
 * 核心概念：
 * - 认证（Authentication）：验证用户身份（你是谁？）
 * - 授权（Authorization）：验证用户权限（你能做什么？）
 * 
 * 配置说明：
 * 1. 禁用 CSRF：前后端分离不需要 CSRF 保护
 * 2. 无状态会话：不使用 Session，使用 JWT
 * 3. 配置哪些接口需要认证
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    /**
     * 配置安全过滤链
     * 
     * SecurityFilterChain 定义了请求的安全处理流程
     * 请求会依次经过过滤器链，最终到达 Controller
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. 禁用 CSRF（跨站请求伪造保护）
            // 前后端分离项目使用 JWT，不需要 CSRF
            .csrf(AbstractHttpConfigurer::disable)

            // 2. 配置会话管理
            // STATELESS：不创建和使用 Session
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 3. 配置授权规则
            .authorizeHttpRequests(auth -> auth
                // 允许的接口（不需要认证）
                .requestMatchers(
                    "/api/auth/login",       // 登录接口
                    "/api/auth/register",    // 注册接口
                    "/api/vehicles",         // 车辆列表（公开）
                    "/api/vehicles/*",       // 车辆详情（公开）
                    "/api/activities",       // 活动列表（公开）
                    "/api/activities/*",     // 活动详情（公开）
                    "/api/map/**",           // 地图接口（公开）
                    "/swagger-ui.html",      // Swagger UI
                    "/swagger-ui/**",        // Swagger UI 资源
                    "/v3/api-docs/**",       // OpenAPI 文档
                    "/uploads/**"            // 静态文件
                ).permitAll()
                
                // OPTIONS 请求（预检请求）全部允许
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
            )

            // 4. 配置异常处理
            // 未登录时返回 JSON 而不是跳转登录页
            .exceptionHandling(exception -> exception
                // 未认证处理
                .authenticationEntryPoint((request, response, authException) -> {
                    writeUnauthorizedResponse(response, "未登录或登录已过期");
                })
                // 无权限处理
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    writeUnauthorizedResponse(response, "无权限访问");
                })
            )

            // 5. 添加 JWT 过滤器
            // 在 UsernamePasswordAuthenticationFilter 之前执行
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 写入未认证响应
     */
    private void writeUnauthorizedResponse(jakarta.servlet.http.HttpServletResponse response, 
                                           String message) throws IOException {
        response.setStatus(401);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        Result<Void> result = Result.unauthorized(message);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}