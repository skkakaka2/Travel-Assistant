package com.travel.assistant.common.config;

import com.travel.assistant.common.utils.UserContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 用户上下文清理拦截器
 * 
 * 在请求结束后清理 ThreadLocal，防止内存泄漏
 * 
 * 为什么需要这个？
 * ThreadLocal 是线程本地变量，线程池中的线程会被复用
 * 如果不清理，下次请求可能会读到上一个请求的用户信息
 */
@Slf4j
@Component
public class UserContextCleanupInterceptor implements HandlerInterceptor {

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        // 请求结束后清理用户上下文
        UserContextHolder.clear();
    }
}