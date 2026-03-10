package com.travel.assistant.modules.user.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户信息返回对象
 * 
 * VO (View Object)：视图对象
 * 用于返回给前端的数据，可以控制返回哪些字段
 * 比如不返回密码等敏感信息
 */
@Data
@Schema(description = "用户信息")
public class UserVO {

    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "昵称")
    private String nickname;

    @Schema(description = "头像URL")
    private String avatar;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "状态：0禁用 1正常")
    private Integer status;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}