package com.travel.assistant.modules.user.controller;

import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.user.dto.HomeLocationRequest;
import com.travel.assistant.modules.user.dto.UpdateUserRequest;
import com.travel.assistant.modules.user.service.UserService;
import com.travel.assistant.modules.user.vo.HomeLocationVO;
import com.travel.assistant.modules.user.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户控制器
 * 
 * 处理用户信息、家庭位置、车辆绑定等接口
 */
@Tag(name = "用户接口", description = "用户信息、家庭位置、车辆绑定相关接口")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ==================== 用户信息 ====================

    /**
     * 获取当前用户信息
     */
    @GetMapping("/profile")
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    public Result<UserVO> getProfile() {
        UserVO user = userService.getCurrentUser();
        return Result.success(user);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/profile")
    @Operation(summary = "更新用户信息", description = "更新当前用户的昵称、手机号、邮箱等信息")
    public Result<UserVO> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        UserVO user = userService.updateUserInfo(request);
        return Result.success(user);
    }

    /**
     * 更新用户头像
     * 
     * @param avatarUrl 头像URL（由文件上传接口返回）
     */
    @PutMapping("/avatar")
    @Operation(summary = "更新头像", description = "更新当前用户的头像")
    public Result<Void> updateAvatar(
            @Parameter(description = "头像URL") @RequestParam String avatarUrl) {
        userService.updateAvatar(avatarUrl);
        return Result.success();
    }

    // ==================== 家庭位置 ====================

    /**
     * 获取家庭位置列表
     */
    @GetMapping("/home-locations")
    @Operation(summary = "获取家庭位置列表", description = "获取当前用户的所有家庭位置")
    public Result<List<HomeLocationVO>> getHomeLocations() {
        List<HomeLocationVO> locations = userService.getHomeLocations();
        return Result.success(locations);
    }

    /**
     * 添加家庭位置
     */
    @PostMapping("/home-locations")
    @Operation(summary = "添加家庭位置", description = "添加新的家庭位置")
    public Result<HomeLocationVO> addHomeLocation(@Valid @RequestBody HomeLocationRequest request) {
        HomeLocationVO location = userService.addHomeLocation(request);
        return Result.success(location);
    }

    /**
     * 更新家庭位置
     */
    @PutMapping("/home-locations/{id}")
    @Operation(summary = "更新家庭位置", description = "更新指定的家庭位置信息")
    public Result<HomeLocationVO> updateHomeLocation(
            @Parameter(description = "位置ID") @PathVariable Long id,
            @Valid @RequestBody HomeLocationRequest request) {
        HomeLocationVO location = userService.updateHomeLocation(id, request);
        return Result.success(location);
    }

    /**
     * 删除家庭位置
     */
    @DeleteMapping("/home-locations/{id}")
    @Operation(summary = "删除家庭位置", description = "删除指定的家庭位置")
    public Result<Void> deleteHomeLocation(
            @Parameter(description = "位置ID") @PathVariable Long id) {
        userService.deleteHomeLocation(id);
        return Result.success();
    }

    /**
     * 设置默认家庭位置
     */
    @PutMapping("/home-locations/{id}/default")
    @Operation(summary = "设置默认家庭位置", description = "将指定的家庭位置设为默认")
    public Result<Void> setDefaultHomeLocation(
            @Parameter(description = "位置ID") @PathVariable Long id) {
        userService.setDefaultHomeLocation(id);
        return Result.success();
    }

    // ==================== 车辆绑定 ====================

    /**
     * 绑定车辆
     */
    @PostMapping("/vehicles/{vehicleId}")
    @Operation(summary = "绑定车辆", description = "将指定车辆绑定到当前用户")
    public Result<Void> bindVehicle(
            @Parameter(description = "车辆ID") @PathVariable Long vehicleId) {
        userService.bindVehicle(vehicleId);
        return Result.success();
    }

    /**
     * 解绑车辆
     */
    @DeleteMapping("/vehicles/{vehicleId}")
    @Operation(summary = "解绑车辆", description = "解除当前用户与指定车辆的绑定")
    public Result<Void> unbindVehicle(
            @Parameter(description = "车辆ID") @PathVariable Long vehicleId) {
        userService.unbindVehicle(vehicleId);
        return Result.success();
    }

    /**
     * 设置默认车辆
     */
    @PutMapping("/vehicles/{vehicleId}/default")
    @Operation(summary = "设置默认车辆", description = "将指定车辆设为当前用户的默认车辆")
    public Result<Void> setDefaultVehicle(
            @Parameter(description = "车辆ID") @PathVariable Long vehicleId) {
        userService.setDefaultVehicle(vehicleId);
        return Result.success();
    }
}