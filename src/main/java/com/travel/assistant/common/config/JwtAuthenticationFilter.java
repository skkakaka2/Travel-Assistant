package com.travel.assistant.common.config;

import com.travel.assistant.common.utils.JwtUtils;
import com.travel.assistant.common.utils.RequestUtils;
import com.travel.assistant.common.utils.UserContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import org.springframework.lang.NonNull;

/**
 * JWT 认证过滤器
 * 
 * 这个过滤器会在每个请求到达 Controller 之前执行
 * 作用是从请求头中提取 JWT，验证并设置用户身份
 * 
 * 认证流程：
 * 1. 从请求头获取 Token
 * 2. 验证 Token 有效性
 * 3. 解析 Token 获取用户信息
 * 4. 将用户信息存入 SecurityContext（Spring Security 的上下文）
 * 5. 将用户信息存入 UserContextHolder（方便业务代码获取）
 * 
 * OncePerRequestFilter：确保每个请求只执行一次
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final RequestUtils requestUtils;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 1. 从请求头获取 Token
            String token = requestUtils.getTokenFromRequest(request);

            // 2. 验证 Token 并解析用户信息
            if (StringUtils.hasText(token) && jwtUtils.validateToken(token)) {
                // 获取用户信息
                Long userId = jwtUtils.getUserId(token);
                String username = jwtUtils.getUsername(token);

                if (userId != null && username != null) {
                    // 3. 创建认证对象
                    // 参数：用户信息、凭证（密码，这里不需要）、权限列表
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,  // principal：主要信息，这里存用户ID
                                    null,    // credentials：凭证，JWT 认证不需要
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                    // 4. 存入 SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // 5. 存入 UserContextHolder，方便业务代码获取
                    UserContextHolder.setUser(userId, username);
                    
                    log.debug("用户认证成功: userId={}, username={}", userId, username);
                }
            }
        } catch (Exception e) {
            log.error("JWT 认证失败: {}", e.getMessage());
        }

        // 继续执行后续过滤器和 Controller
        filterChain.doFilter(request, response);
    }
}