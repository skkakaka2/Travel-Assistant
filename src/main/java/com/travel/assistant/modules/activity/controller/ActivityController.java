package com.travel.assistant.modules.activity.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.activity.dto.ActivityRequest;
import com.travel.assistant.modules.activity.service.ActivityService;
import com.travel.assistant.modules.activity.vo.ActivityVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 活动控制器
 */
@Tag(name = "活动接口", description = "活动管理相关接口")
@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    @Operation(summary = "创建活动")
    public Result<ActivityVO> createActivity(@Valid @RequestBody ActivityRequest request) {
        ActivityVO activity = activityService.createActivity(request);
        return Result.success(activity);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新活动")
    public Result<ActivityVO> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request) {
        ActivityVO activity = activityService.updateActivity(id, request);
        return Result.success(activity);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除活动")
    public Result<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取活动详情")
    public Result<ActivityVO> getActivity(@PathVariable Long id) {
        ActivityVO activity = activityService.getActivity(id);
        return Result.success(activity);
    }

    @GetMapping
    @Operation(summary = "获取活动列表")
    public Result<Page<ActivityVO>> getActivityList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        Page<ActivityVO> activityPage = activityService.getActivityList(page, size, keyword, status);
        return Result.success(activityPage);
    }

    @GetMapping("/my/created")
    @Operation(summary = "获取我创建的活动")
    public Result<List<ActivityVO>> getMyCreatedActivities() {
        List<ActivityVO> activities = activityService.getMyCreatedActivities();
        return Result.success(activities);
    }

    @GetMapping("/my/joined")
    @Operation(summary = "获取我参与的活动")
    public Result<List<ActivityVO>> getMyJoinedActivities() {
        List<ActivityVO> activities = activityService.getMyJoinedActivities();
        return Result.success(activities);
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "参加活动")
    public Result<ActivityVO> joinActivity(@PathVariable Long id) {
        ActivityVO activity = activityService.joinActivity(id);
        return Result.success(activity);
    }

    @PostMapping("/{id}/quit")
    @Operation(summary = "退出活动")
    public Result<ActivityVO> quitActivity(@PathVariable Long id) {
        ActivityVO activity = activityService.quitActivity(id);
        return Result.success(activity);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "取消活动")
    public Result<Void> cancelActivity(@PathVariable Long id) {
        activityService.cancelActivity(id);
        return Result.success();
    }
}