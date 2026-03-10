package com.travel.assistant.modules.expense.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.utils.UserContextHolder;
import com.travel.assistant.modules.expense.dto.ExpenseRequest;
import com.travel.assistant.modules.expense.entity.Expense;
import com.travel.assistant.modules.expense.mapper.ExpenseMapper;
import com.travel.assistant.modules.expense.service.ExpenseService;
import com.travel.assistant.modules.expense.vo.ExpenseStatisticsVO;
import com.travel.assistant.modules.expense.vo.ExpenseVO;
import com.travel.assistant.modules.trip.entity.Trip;
import com.travel.assistant.modules.trip.mapper.TripMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 费用服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseMapper expenseMapper;
    private final TripMapper tripMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExpenseVO createExpense(ExpenseRequest request) {
        Long userId = UserContextHolder.getUserId();

        Expense expense = new Expense();
        BeanUtils.copyProperties(request, expense);
        expense.setUserId(userId);
        if (expense.getExpenseTime() == null) {
            expense.setExpenseTime(LocalDateTime.now());
        }

        expenseMapper.insert(expense);
        log.info("创建费用记录成功: expenseId={}, userId={}", expense.getId(), userId);

        return convertToVO(expense);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExpenseVO updateExpense(Long id, ExpenseRequest request) {
        Long userId = UserContextHolder.getUserId();

        Expense expense = expenseMapper.selectById(id);
        if (expense == null || !expense.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "费用记录不存在");
        }

        if (request.getTripId() != null) expense.setTripId(request.getTripId());
        if (request.getType() != null) expense.setType(request.getType());
        if (request.getAmount() != null) expense.setAmount(request.getAmount());
        if (request.getDescription() != null) expense.setDescription(request.getDescription());
        if (request.getExpenseTime() != null) expense.setExpenseTime(request.getExpenseTime());

        expenseMapper.updateById(expense);
        log.info("更新费用记录成功: expenseId={}", id);

        return convertToVO(expense);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteExpense(Long id) {
        Long userId = UserContextHolder.getUserId();

        Expense expense = expenseMapper.selectById(id);
        if (expense == null || !expense.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "费用记录不存在");
        }

        expenseMapper.deleteById(id);
        log.info("删除费用记录成功: expenseId={}", id);
    }

    @Override
    public ExpenseVO getExpense(Long id) {
        Long userId = UserContextHolder.getUserId();

        Expense expense = expenseMapper.selectById(id);
        if (expense == null || !expense.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "费用记录不存在");
        }

        return convertToVO(expense);
    }

    @Override
    public Page<ExpenseVO> getExpenseList(Integer page, Integer size, Integer type, Long tripId) {
        Long userId = UserContextHolder.getUserId();

        Page<Expense> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Expense> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Expense::getUserId, userId);
        if (type != null) {
            queryWrapper.eq(Expense::getType, type);
        }
        if (tripId != null) {
            queryWrapper.eq(Expense::getTripId, tripId);
        }
        queryWrapper.orderByDesc(Expense::getExpenseTime);

        Page<Expense> expensePage = expenseMapper.selectPage(pageParam, queryWrapper);

        Page<ExpenseVO> voPage = new Page<>(expensePage.getCurrent(), expensePage.getSize(), expensePage.getTotal());
        List<ExpenseVO> voList = expensePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public ExpenseStatisticsVO getStatistics() {
        Long userId = UserContextHolder.getUserId();
        return calculateStatistics(userId);
    }

    @Override
    public ExpenseStatisticsVO getStatisticsByPeriod(LocalDateTime start, LocalDateTime end) {
        Long userId = UserContextHolder.getUserId();

        // 这里简化处理，可以扩展按时间段统计
        return calculateStatistics(userId);
    }

    private ExpenseStatisticsVO calculateStatistics(Long userId) {
        ExpenseStatisticsVO vo = new ExpenseStatisticsVO();

        // 获取总金额
        BigDecimal total = expenseMapper.sumTotal(userId);
        vo.setTotalAmount(total != null ? total : BigDecimal.ZERO);

        // 获取费用笔数
        vo.setCount(expenseMapper.countByUser(userId));

        // 按类型统计
        List<Map<String, Object>> typeStats = expenseMapper.sumByType(userId);
        for (Map<String, Object> stat : typeStats) {
            Integer type = (Integer) stat.get("type");
            BigDecimal amount = (BigDecimal) stat.get("amount");
            switch (type) {
                case 1: vo.setFuelAmount(amount); break;
                case 2: vo.setTollAmount(amount); break;
                case 3: vo.setParkingAmount(amount); break;
                case 4: vo.setMaintenanceAmount(amount); break;
                case 5: vo.setOtherAmount(amount); break;
            }
        }

        // 初始化为0
        if (vo.getFuelAmount() == null) vo.setFuelAmount(BigDecimal.ZERO);
        if (vo.getTollAmount() == null) vo.setTollAmount(BigDecimal.ZERO);
        if (vo.getParkingAmount() == null) vo.setParkingAmount(BigDecimal.ZERO);
        if (vo.getMaintenanceAmount() == null) vo.setMaintenanceAmount(BigDecimal.ZERO);
        if (vo.getOtherAmount() == null) vo.setOtherAmount(BigDecimal.ZERO);

        return vo;
    }

    private ExpenseVO convertToVO(Expense expense) {
        ExpenseVO vo = new ExpenseVO();
        BeanUtils.copyProperties(expense, vo);

        // 获取行程标题
        if (expense.getTripId() != null) {
            Trip trip = tripMapper.selectById(expense.getTripId());
            if (trip != null) {
                vo.setTripTitle(trip.getTitle());
            }
        }

        // 类型描述
        vo.setTypeDesc(getTypeDesc(expense.getType()));

        return vo;
    }

    private String getTypeDesc(Integer type) {
        switch (type) {
            case 1: return "油费";
            case 2: return "过路费";
            case 3: return "停车费";
            case 4: return "维修费";
            case 5: return "其他";
            default: return "未知";
        }
    }
}