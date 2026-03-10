package com.travel.assistant.modules.expense.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 费用统计返回对象
 */
@Data
@Schema(description = "费用统计")
public class ExpenseStatisticsVO {

    @Schema(description = "总金额")
    private BigDecimal totalAmount;

    @Schema(description = "油费总额")
    private BigDecimal fuelAmount;

    @Schema(description = "过路费总额")
    private BigDecimal tollAmount;

    @Schema(description = "停车费总额")
    private BigDecimal parkingAmount;

    @Schema(description = "维修费总额")
    private BigDecimal maintenanceAmount;

    @Schema(description = "其他费用总额")
    private BigDecimal otherAmount;

    @Schema(description = "费用笔数")
    private Integer count;
}