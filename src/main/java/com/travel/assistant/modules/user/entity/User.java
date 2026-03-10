package com.travel.assistant.modules.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户实体类
 * 
 * 对应数据库表 t_user
 * 
 * 注解说明：
 * @TableName：指定数据库表名
 * @EqualsAndHashCode：Lombok 生成 equals 和 hashCode 方法
 *   - callSuper = true：调用父类的 equals 和 hashCode
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_user")
public class User extends BaseEntity {

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码（加密存储）
     */
    private String password;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 状态：0禁用 1正常
     */
    private Integer status;
}