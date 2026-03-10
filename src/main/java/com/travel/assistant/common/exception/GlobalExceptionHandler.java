package com.travel.assistant.common.exception;

import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * 
 * 使用 @RestControllerAdvice 注解，对所有 Controller 的异常进行统一处理
 * 这样就不需要在每个 Controller 中写 try-catch 了
 * 
 * 工作原理：
 * 1. Controller 抛出异常
 * 2. Spring 捕获异常
 * 3. 根据异常类型找到对应的 @ExceptionHandler 方法
 * 4. 执行方法，返回统一格式的错误响应
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     * 这是我们自己抛出的异常，返回具体的错误信息
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常（@Valid 注解校验失败）
     * 
     * 当请求参数使用 @Valid 注解校验时，如果校验失败会抛出此异常
     * 我们提取所有的错误信息返回给前端
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e) {
        // 获取所有字段的错误信息
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return Result.error(ErrorCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 处理参数绑定异常
     * 
     * 当请求参数绑定到对象时出错（如类型转换失败）
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBindException(BindException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数绑定失败: {}", message);
        return Result.error(ErrorCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 处理缺少请求参数异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleMissingParamException(MissingServletRequestParameterException e) {
        String message = "缺少必要参数: " + e.getParameterName();
        log.warn(message);
        return Result.error(ErrorCode.BAD_REQUEST.getCode(), message);
    }

    /**
     * 处理请求方法不支持异常
     * 
     * 如：接口只支持 POST，但前端发送了 GET 请求
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public Result<Void> handleMethodNotAllowedException(HttpRequestMethodNotSupportedException e) {
        String message = "不支持的请求方法: " + e.getMethod();
        log.warn(message);
        return Result.error(ErrorCode.METHOD_NOT_ALLOWED.getCode(), message);
    }

    /**
     * 处理 404 异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFoundException(NoHandlerFoundException e) {
        log.warn("资源不存在: {}", e.getRequestURL());
        return Result.notFound("请求的资源不存在");
    }

    /**
     * 处理其他未捕获的异常
     * 
     * 这是兜底处理，防止异常直接暴露给用户
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e) {
        // 记录完整的异常堆栈，方便排查问题
        log.error("系统异常", e);
        return Result.serverError("系统繁忙，请稍后重试");
    }
}