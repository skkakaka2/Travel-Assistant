package com.travel.assistant.modules.expense.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.expense.dto.ExpenseRequest;
import com.travel.assistant.modules.expense.service.ExpenseService;
import com.travel.assistant.modules.expense.vo.ExpenseStatisticsVO;
import com.travel.assistant.modules.expense.vo.ExpenseVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 费用控制器
 */
@Tag(name = "费用接口", description = "费用管理相关接口")
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @Operation(summary = "创建费用记录")
    public Result<ExpenseVO> createExpense(@Valid @RequestBody ExpenseRequest request) {
        ExpenseVO expense = expenseService.createExpense(request);
        return Result.success(expense);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新费用记录")
    public Result<ExpenseVO> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        ExpenseVO expense = expenseService.updateExpense(id, request);
        return Result.success(expense);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除费用记录")
    public Result<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取费用详情")
    public Result<ExpenseVO> getExpense(@PathVariable Long id) {
        ExpenseVO expense = expenseService.getExpense(id);
        return Result.success(expense);
    }

    @GetMapping
    @Operation(summary = "获取费用列表")
    public Result<Page<ExpenseVO>> getExpenseList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) Long tripId) {
        Page<ExpenseVO> expensePage = expenseService.getExpenseList(page, size, type, tripId);
        return Result.success(expensePage);
    }

    @GetMapping("/statistics")
    @Operation(summary = "获取费用统计")
    public Result<ExpenseStatisticsVO> getStatistics() {
        ExpenseStatisticsVO statistics = expenseService.getStatistics();
        return Result.success(statistics);
    }

    @GetMapping("/statistics/period")
    @Operation(summary = "获取时间段费用统计")
    public Result<ExpenseStatisticsVO> getStatisticsByPeriod(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime start,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime end) {
        ExpenseStatisticsVO statistics = expenseService.getStatisticsByPeriod(start, end);
        return Result.success(statistics);
    }
}