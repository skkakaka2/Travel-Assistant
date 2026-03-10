package com.travel.assistant.modules.vehicle.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.vehicle.dto.VehicleRequest;
import com.travel.assistant.modules.vehicle.service.VehicleService;
import com.travel.assistant.modules.vehicle.vo.UserVehicleVO;
import com.travel.assistant.modules.vehicle.vo.VehicleVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 车辆控制器
 */
@Tag(name = "车辆接口", description = "车辆管理相关接口")
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * 创建车辆
     */
    @PostMapping
    @Operation(summary = "创建车辆", description = "创建新的车辆信息")
    public Result<VehicleVO> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleVO vehicle = vehicleService.createVehicle(request);
        return Result.success(vehicle);
    }

    /**
     * 更新车辆信息
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新车辆", description = "更新指定车辆的信息")
    public Result<VehicleVO> updateVehicle(
            @Parameter(description = "车辆ID") @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleVO vehicle = vehicleService.updateVehicle(id, request);
        return Result.success(vehicle);
    }

    /**
     * 删除车辆
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除车辆", description = "删除指定的车辆")
    public Result<Void> deleteVehicle(
            @Parameter(description = "车辆ID") @PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return Result.success();
    }

    /**
     * 获取车辆详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取车辆详情", description = "根据ID获取车辆详细信息")
    public Result<VehicleVO> getVehicle(
            @Parameter(description = "车辆ID") @PathVariable Long id) {
        VehicleVO vehicle = vehicleService.getVehicle(id);
        return Result.success(vehicle);
    }

    /**
     * 分页获取车辆列表
     */
    @GetMapping
    @Operation(summary = "获取车辆列表", description = "分页获取车辆列表，支持按型号搜索")
    public Result<Page<VehicleVO>> getVehicleList(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "车辆型号") @RequestParam(required = false) String model) {
        Page<VehicleVO> vehiclePage = vehicleService.getVehicleList(page, size, model);
        return Result.success(vehiclePage);
    }

    /**
     * 获取当前用户绑定的车辆列表
     */
    @GetMapping("/bound")
    @Operation(summary = "获取绑定车辆", description = "获取当前用户绑定的所有车辆")
    public Result<List<UserVehicleVO>> getUserVehicles() {
        List<UserVehicleVO> vehicles = vehicleService.getUserVehicles();
        return Result.success(vehicles);
    }
}