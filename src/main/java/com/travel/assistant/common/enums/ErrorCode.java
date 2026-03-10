package com.travel.assistant.common.enums;

import lombok.Getter;

/**
 * 错误码枚举
 * 
 * 统一管理所有错误码，方便维护
 * 命名规则：模块_错误类型
 */
@Getter
public enum ErrorCode {

    // ==================== 通用错误 (1xxx) ====================
    
    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    // ==================== 用户模块错误 (2xxx) ====================
    
    USER_NOT_FOUND(2001, "用户不存在"),
    USER_EXISTS(2002, "用户名已存在"),
    PASSWORD_ERROR(2003, "密码错误"),
    PHONE_EXISTS(2004, "手机号已注册"),
    OLD_PASSWORD_ERROR(2005, "原密码错误"),
    USER_DISABLED(2006, "账号已被禁用"),

    // ==================== 车辆模块错误 (3xxx) ====================
    
    VEHICLE_NOT_FOUND(3001, "车辆不存在"),
    VEHICLE_BOUND(3002, "该车辆已被绑定"),

    // ==================== 行程模块错误 (4xxx) ====================
    
    TRIP_NOT_FOUND(4001, "行程不存在"),
    TRIP_ALREADY_ENDED(4002, "行程已结束"),
    TRIP_NOT_STARTED(4003, "行程未开始"),

    // ==================== 活动模块错误 (5xxx) ====================
    
    ACTIVITY_NOT_FOUND(5001, "活动不存在"),
    ACTIVITY_FULL(5002, "活动人数已满"),
    ALREADY_JOINED(5003, "已参加该活动"),
    NOT_JOINED(5004, "未参加该活动"),
    ACTIVITY_ENDED(5005, "活动已结束"),

    // ==================== 文件模块错误 (6xxx) ====================
    
    FILE_EMPTY(6001, "文件不能为空"),
    FILE_TOO_LARGE(6002, "文件大小超过限制"),
    FILE_TYPE_ERROR(6003, "文件类型不支持"),
    FILE_UPLOAD_ERROR(6004, "文件上传失败"),

    // ==================== 地图模块错误 (7xxx) ====================
    
    MAP_API_ERROR(7001, "地图服务调用失败"),
    ADDRESS_NOT_FOUND(7002, "地址解析失败");

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 错误信息
     */
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}