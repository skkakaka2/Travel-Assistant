package com.travel.assistant.modules.user.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应对象
 * 
 * 包含 Token 和用户基本信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "登录响应")
public class LoginVO {

    @Schema(description = "JWT Token")
    private String token;

    @Schema(description = "用户信息")
    private UserVO user;

    /**
     * 快速创建方法
     */
    public static LoginVO of(String token, UserVO user) {
        return new LoginVO(token, user);
    }
}