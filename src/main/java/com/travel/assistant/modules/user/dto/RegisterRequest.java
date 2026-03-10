package com.travel.assistant.modules.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 注册请求参数
 * 
 * DTO (Data Transfer Object)：数据传输对象
 * 用于接收前端传来的参数，与数据库实体区分开
 * 
 * 注解说明：
 * @Schema：OpenAPI 文档注解，描述字段含义
 * @NotBlank：验证注解，字段不能为空
 * @Size：验证注解，限制字符串长度
 */
@Data
@Schema(description = "注册请求参数")
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度为3-20个字符")
    @Schema(description = "用户名", example = "testuser")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度为6-20个字符")
    @Schema(description = "密码", example = "123456")
    private String password;

    @Size(max = 50, message = "昵称最多50个字符")
    @Schema(description = "昵称", example = "测试用户")
    private String nickname;

    @Size(max = 20, message = "手机号最多20个字符")
    @Schema(description = "手机号", example = "13800138000")
    private String phone;
}