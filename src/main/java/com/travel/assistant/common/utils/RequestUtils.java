package com.travel.assistant.common.utils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * HTTP 请求工具类
 */
@Component
public class RequestUtils {

    /**
     * 从请求头中获取 JWT Token
     * 
     * 请求头格式：Authorization: Bearer <token>
     * 
     * @param request HTTP 请求对象
     * @return Token 字符串，如果没有则返回 null
     */
    public String getTokenFromRequest(HttpServletRequest request) {
        // 获取 Authorization 请求头
        String bearerToken = request.getHeader("Authorization");
        
        // 检查是否以 "Bearer " 开头
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // 提取 Token（去掉 "Bearer " 前缀）
            return bearerToken.substring(7);
        }
        
        return null;
    }

    /**
     * 获取客户端真实 IP 地址
     * 
     * 考虑了代理服务器的情况
     * 
     * @param request HTTP 请求对象
     * @return IP 地址
     */
    public String getClientIp(HttpServletRequest request) {
        // 优先从代理头获取
        String ip = request.getHeader("X-Forwarded-For");
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            // 直接连接时使用 RemoteAddr
            ip = request.getRemoteAddr();
        }
        
        // X-Forwarded-For 可能包含多个 IP，取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }
}