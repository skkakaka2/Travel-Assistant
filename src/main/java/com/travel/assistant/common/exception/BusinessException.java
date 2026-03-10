package com.travel.assistant.common.exception;

import com.travel.assistant.common.enums.ErrorCode;
import lombok.Getter;

/**
 * 业务异常类
 * 
 * 当业务逻辑出现错误时，抛出这个异常
 * 全局异常处理器会捕获并返回统一格式的错误响应
 * 
 * 使用示例：
 * throw new BusinessException(ErrorCode.USER_NOT_FOUND);
 * throw new BusinessException("自定义错误信息");
 */
@Getter
public class BusinessException extends RuntimeException {

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 使用错误码枚举创建异常
     * @param errorCode 错误码枚举
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }

    /**
     * 使用错误码枚举和自定义消息创建异常
     * @param errorCode 错误码枚举
     * @param message 自定义错误消息
     */
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.code = errorCode.getCode();
    }

    /**
     * 使用自定义错误码和消息创建异常
     * @param code 错误码
     * @param message 错误消息
     */
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    /**
     * 使用默认错误码 400 和自定义消息创建异常
     * @param message 错误消息
     */
    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }
}