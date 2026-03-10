package com.travel.assistant.common.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具类
 * 
 * JWT (JSON Web Token) 是一种用于身份认证的令牌
 * 
 * 认证流程：
 * 1. 用户登录 -> 服务端验证 -> 生成 JWT 返回给前端
 * 2. 前端保存 JWT（通常在 localStorage）
 * 3. 后续请求在 Header 中携带 JWT：Authorization: Bearer <token>
 * 4. 服务端验证 JWT，获取用户信息
 * 
 * JWT 结构：Header.Payload.Signature
 * - Header：算法和令牌类型
 * - Payload：用户数据（用户ID、用户名等）
 * - Signature：签名，防止数据被篡改
 */
@Slf4j
@Component
public class JwtUtils {

    /**
     * JWT 密钥（从配置文件读取）
     */
    @Value("${app.jwt.secret}")
    private String secret;

    /**
     * JWT 过期时间（小时）
     */
    @Value("${app.jwt.expiration}")
    private Integer expiration;

    /**
     * 生成密钥对象
     * 
     * HMAC-SHA 算法要求密钥至少 256 位（32 字节）
     * 使用 Keys.hmacShaKeyFor 可以自动处理密钥长度
     */
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 JWT Token
     * 
     * @param userId 用户ID
     * @param username 用户名
     * @return JWT 字符串
     */
    public String generateToken(Long userId, String username) {
        // 自定义载荷（存储在 token 中的数据）
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);

        // 计算过期时间
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration * 60 * 60 * 1000L);

        // 构建 JWT
        return Jwts.builder()
                // 设置载荷
                .claims(claims)
                // 设置签发时间
                .issuedAt(now)
                // 设置过期时间
                .expiration(expirationDate)
                // 使用密钥签名
                .signWith(getSecretKey())
                // 生成字符串
                .compact();
    }

    /**
     * 解析 JWT Token
     * 
     * @param token JWT 字符串
     * @return 载荷数据（包含用户信息）
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    // 设置验证签名使用的密钥
                    .verifyWith(getSecretKey())
                    .build()
                    // 解析 token
                    .parseSignedClaims(token)
                    // 获取载荷
                    .getPayload();
        } catch (Exception e) {
            log.error("JWT 解析失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从 Token 中获取用户ID
     */
    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        if (claims != null) {
            return claims.get("userId", Long.class);
        }
        return null;
    }

    /**
     * 从 Token 中获取用户名
     */
    public String getUsername(String token) {
        Claims claims = parseToken(token);
        if (claims != null) {
            return claims.get("username", String.class);
        }
        return null;
    }

    /**
     * 验证 Token 是否有效
     * 
     * @param token JWT 字符串
     * @return true=有效，false=无效
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            if (claims == null) {
                return false;
            }
            // 检查是否过期
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            log.error("JWT 验证失败: {}", e.getMessage());
            return false;
        }
    }
}