package com.travel.assistant.modules.expense.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 费用返回对象
 */
@Data
@Schema(description = "费用信息")
public class ExpenseVO {

    @Schema(description = "费用ID")
    private Long id;

    @Schema(description = "关联行程ID")
    private Long tripId;

    @Schema(description = "行程标题")
    private String tripTitle;

    @Schema(description = "费用类型")
    private Integer type;

    @Schema(description = "费用类型描述")
    private String typeDesc;

    @Schema(description = "金额")
    private BigDecimal amount;

    @Schema(description = "描述")
    private String description;

    @Schema(description = "费用时间")
    private LocalDateTime expenseTime;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}