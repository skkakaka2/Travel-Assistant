package com.travel.assistant.modules.vehicle.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 车辆返回对象
 */
@Data
@Schema(description = "车辆信息")
public class VehicleVO {

    @Schema(description = "车辆ID")
    private Long id;

    @Schema(description = "车辆型号")
    private String model;

    @Schema(description = "百公里油耗(L)")
    private BigDecimal fuelConsumption;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}