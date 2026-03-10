package com.travel.assistant.modules.expense.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.modules.expense.dto.ExpenseRequest;
import com.travel.assistant.modules.expense.vo.ExpenseStatisticsVO;
import com.travel.assistant.modules.expense.vo.ExpenseVO;

import java.time.LocalDateTime;

/**
 * 费用服务接口
 */
public interface ExpenseService {

    /**
     * 创建费用记录
     */
    ExpenseVO createExpense(ExpenseRequest request);

    /**
     * 更新费用记录
     */
    ExpenseVO updateExpense(Long id, ExpenseRequest request);

    /**
     * 删除费用记录
     */
    void deleteExpense(Long id);

    /**
     * 获取费用详情
     */
    ExpenseVO getExpense(Long id);

    /**
     * 分页获取费用列表
     */
    Page<ExpenseVO> getExpenseList(Integer page, Integer size, Integer type, Long tripId);

    /**
     * 获取费用统计
     */
    ExpenseStatisticsVO getStatistics();

    /**
     * 获取指定时间段的费用统计
     */
    ExpenseStatisticsVO getStatisticsByPeriod(LocalDateTime start, LocalDateTime end);
}