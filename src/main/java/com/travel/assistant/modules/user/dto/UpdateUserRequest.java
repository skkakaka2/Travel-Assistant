package com.travel.assistant.modules.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新用户信息请求参数
 */
@Data
@Schema(description = "更新用户信息请求参数")
public class UpdateUserRequest {

    @Size(max = 50, message = "昵称最多50个字符")
    @Schema(description = "昵称", example = "新昵称")
    private String nickname;

    @Size(max = 20, message = "手机号最多20个字符")
    @Schema(description = "手机号", example = "13800138000")
    private String phone;

    @Size(max = 100, message = "邮箱最多100个字符")
    @Schema(description = "邮箱", example = "test@example.com")
    private String email;
}