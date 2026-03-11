package com.travel.assistant.common.result;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

/**
 * 统一返回结果类
 * 
 * 所有 API 接口都返回这个统一格式，方便前端处理
 * 
 * 结构示例：
 * 成功：{"code": 200, "message": "success", "data": {...}}
 * 失败：{"code": 400, "message": "参数错误", "data": null}
 * 
 * @param <T> 返回的数据类型
 */
@Data
// 当数据为 null 时不序列化到 JSON 中
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> {

    /**
     * 状态码
     * 200 成功，其他为失败
     */
    private Integer code;

    /**
     * 提示信息
     */
    private String message;

    /**
     * 返回的数据
     */
    private T data;

    /**
     * 总页数
     */
    private Long total;

    /**
     * 当前页数
     */
    private Long page;

    /**
     * 每页条数
     */
    private Long size;

    // ==================== 私有构造方法 ====================

    private Result() {
    }

    private Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    private Result(Integer code, String message, T data, Long total, Long page, Long size) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.total = total;
        this.page = page;
        this.size = size;
    }

    // ==================== 静态工厂方法 ====================

    /**
     * 成功返回（无数据）
     */
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }

    /**
     * 成功返回（有数据）
     * 
     * @param data 返回的数据
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    /**
     * 成功返回（自定义消息）
     * 
     * @param message 提示信息
     * @param data    返回的数据
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }

    /**
     * 失败返回
     * 
     * @param code    错误码
     * @param message 错误信息
     */
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }

    /**
     * 失败返回（默认 400 错误码）
     * 
     * @param message 错误信息
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(400, message, null);
    }

    // ==================== 常见的 HTTP 状态码快捷方法 ====================

    /**
     * 404 - 资源未找到
     */
    public static <T> Result<T> notFound(String message) {
        return new Result<>(404, message, null);
    }

    /**
     * 401 - 未授权（未登录）
     */
    public static <T> Result<T> unauthorized(String message) {
        return new Result<>(401, message, null);
    }

    /**
     * 403 - 禁止访问（无权限）
     */
    public static <T> Result<T> forbidden(String message) {
        return new Result<>(403, message, null);
    }

    /**
     * 500 - 服务器内部错误
     */
    public static <T> Result<T> serverError(String message) {
        return new Result<>(500, message, null);
    }
}