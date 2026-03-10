package com.travel.assistant.modules.expense.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 费用实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_expense")
public class Expense extends BaseEntity {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 关联行程ID
     */
    private Long tripId;

    /**
     * 费用类型：1油费 2过路费 3停车费 4维修费 5其他
     */
    private Integer type;

    /**
     * 金额
     */
    private BigDecimal amount;

    /**
     * 描述
     */
    private String description;

    /**
     * 费用时间
     */
    private LocalDateTime expenseTime;
}