package com.travel.assistant.modules.user.controller;

import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.user.dto.LoginRequest;
import com.travel.assistant.modules.user.dto.RegisterRequest;
import com.travel.assistant.modules.user.service.UserService;
import com.travel.assistant.modules.user.vo.LoginVO;
import com.travel.assistant.modules.user.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 
 * 处理注册、登录等认证相关接口
 * 
 * 注解说明：
 * 
 * @RestController：标记这是一个 RESTful 控制器
 *                        相当于 @Controller + @ResponseBody
 *                        所有方法返回值都会自动转为 JSON
 * @RequestMapping：定义接口路径前缀
 * @Tag：OpenAPI 文档标签，用于分组
 * @RequiredArgsConstructor：Lombok 生成构造函数，用于依赖注入
 */
@Tag(name = "认证接口", description = "用户注册、登录等认证相关接口")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * 用户注册
     * 
     * @PostMapping：处理 POST 请求
     * @RequestBody：将请求体 JSON 转为 Java 对象
     * @Valid：启用参数校验
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "创建新用户账号")
    public Result<UserVO> register(@Valid @RequestBody RegisterRequest request) {
        UserVO user = userService.register(request);
        return Result.success(user);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "验证用户名密码，返回 Token")
    public Result<LoginVO> login(@RequestBody @Valid LoginRequest request) {
        LoginVO loginVO = userService.login(request);
        return Result.success(loginVO);
    }
}