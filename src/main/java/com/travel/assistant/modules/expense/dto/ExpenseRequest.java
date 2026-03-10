package com.travel.assistant.modules.expense.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 费用请求参数
 */
@Data
@Schema(description = "费用请求参数")
public class ExpenseRequest {

    @Schema(description = "关联行程ID")
    private Long tripId;

    @NotNull(message = "费用类型不能为空")
    @Schema(description = "费用类型：1油费 2过路费 3停车费 4维修费 5其他")
    private Integer type;

    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0", message = "金额不能为负数")
    @Schema(description = "金额")
    private BigDecimal amount;

    @Schema(description = "描述")
    private String description;

    @Schema(description = "费用时间")
    private LocalDateTime expenseTime;
}