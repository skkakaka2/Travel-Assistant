package com.travel.assistant.modules.trip.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.trip.dto.CreateTripRequest;
import com.travel.assistant.modules.trip.service.TripService;
import com.travel.assistant.modules.trip.vo.TripVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 行程控制器
 */
@Tag(name = "行程接口", description = "行程管理相关接口")
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    /**
     * 创建行程
     */
    @PostMapping
    @Operation(summary = "创建行程", description = "创建新的行程")
    public Result<TripVO> createTrip(@Valid @RequestBody CreateTripRequest request) {
        TripVO trip = tripService.createTrip(request);
        return Result.success(trip);
    }

    /**
     * 更新行程
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新行程", description = "更新指定行程信息")
    public Result<TripVO> updateTrip(
            @Parameter(description = "行程ID") @PathVariable Long id,
            @Valid @RequestBody CreateTripRequest request) {
        TripVO trip = tripService.updateTrip(id, request);
        return Result.success(trip);
    }

    /**
     * 删除行程
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除行程", description = "删除指定的行程")
    public Result<Void> deleteTrip(
            @Parameter(description = "行程ID") @PathVariable Long id) {
        tripService.deleteTrip(id);
        return Result.success();
    }

    /**
     * 获取行程详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取行程详情", description = "根据ID获取行程详细信息")
    public Result<TripVO> getTrip(
            @Parameter(description = "行程ID") @PathVariable Long id) {
        TripVO trip = tripService.getTrip(id);
        return Result.success(trip);
    }

    /**
     * 分页获取行程列表
     */
    @GetMapping
    @Operation(summary = "获取行程列表", description = "分页获取当前用户的行程列表")
    public Result<Page<TripVO>> getTripList(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "状态筛选") @RequestParam(required = false) Integer status) {
        Page<TripVO> tripPage = tripService.getTripList(page, size, status);
        return Result.success(tripPage);
    }

    /**
     * 开始行程
     */
    @PostMapping("/{id}/start")
    @Operation(summary = "开始行程", description = "开始指定的行程")
    public Result<TripVO> startTrip(
            @Parameter(description = "行程ID") @PathVariable Long id) {
        TripVO trip = tripService.startTrip(id);
        return Result.success(trip);
    }

    /**
     * 结束行程
     */
    @PostMapping("/{id}/end")
    @Operation(summary = "结束行程", description = "结束指定的行程")
    public Result<TripVO> endTrip(
            @Parameter(description = "行程ID") @PathVariable Long id) {
        TripVO trip = tripService.endTrip(id);
        return Result.success(trip);
    }

    /**
     * 取消行程
     */
    @PostMapping("/{id}/cancel")
    @Operation(summary = "取消行程", description = "取消指定的行程")
    public Result<Void> cancelTrip(
            @Parameter(description = "行程ID") @PathVariable Long id) {
        tripService.cancelTrip(id);
        return Result.success();
    }
}