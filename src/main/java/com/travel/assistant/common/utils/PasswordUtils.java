package com.travel.assistant.common.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 密码工具类
 * 
 * 使用 BCrypt 算法对密码进行加密和验证
 * 
 * 为什么用 BCrypt？
 * 1. 安全性高：每次加密结果不同（包含随机盐值）
 * 2. 防彩虹表攻击：即使两个用户密码相同，加密结果也不同
 * 3. 可配置强度：通过 cost 参数控制计算复杂度
 * 
 * 示例：
 * 原始密码：123456
 * 加密结果1：$2a$10$xxxxx...（每次都不同）
 * 加密结果2：$2a$10$yyyyy...（每次都不同）
 * 但都可以正确验证原始密码
 */
@Component
public class PasswordUtils {

    /**
     * BCrypt 加密器
     * 
     * BCryptPasswordEncoder 是 Spring Security 提供的加密类
     * 参数 10 表示加密强度（cost），范围 4-31，越大越安全但越慢
     */
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    /**
     * 加密密码
     * 
     * @param rawPassword 原始密码（明文）
     * @return 加密后的密码（密文）
     */
    public String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码
     * 
     * @param rawPassword 原始密码（用户输入的明文）
     * @param encodedPassword 加密后的密码（数据库中存储的密文）
     * @return true=密码正确，false=密码错误
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}