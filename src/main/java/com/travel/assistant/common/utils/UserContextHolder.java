package com.travel.assistant.common.utils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 用户上下文工具类
 * 
 * 用于在任意位置获取当前登录用户的信息
 * 
 * 工作原理：
 * Spring 的 RequestContextHolder 可以获取当前请求的上下文
 * 我们在请求拦截器中解析 JWT 并存储用户信息到 ThreadLocal
 * 然后在任何地方都可以通过这个类获取
 */
public class UserContextHolder {

    /**
     * ThreadLocal 存储当前用户ID
     * ThreadLocal 是线程本地变量，每个线程独立存储，互不影响
     */
    private static final ThreadLocal<Long> userIdHolder = new ThreadLocal<>();

    /**
     * ThreadLocal 存储当前用户名
     */
    private static final ThreadLocal<String> usernameHolder = new ThreadLocal<>();

    /**
     * 设置当前用户信息（由拦截器调用）
     */
    public static void setUser(Long userId, String username) {
        userIdHolder.set(userId);
        usernameHolder.set(username);
    }

    /**
     * 获取当前用户ID
     */
    public static Long getUserId() {
        return userIdHolder.get();
    }

    /**
     * 获取当前用户名
     */
    public static String getUsername() {
        return usernameHolder.get();
    }

    /**
     * 判断当前是否已登录
     */
    public static boolean isLoggedIn() {
        return userIdHolder.get() != null;
    }

    /**
     * 清除用户信息（请求结束时调用，防止内存泄漏）
     */
    public static void clear() {
        userIdHolder.remove();
        usernameHolder.remove();
    }

    /**
     * 获取当前 HTTP 请求对象
     * 
     * 可以在任意位置获取当前请求，而不需要通过参数传递
     */
    public static HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}