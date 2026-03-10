package com.travel.assistant.modules.vehicle.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户绑定的车辆信息
 * 
 * 包含车辆信息和绑定状态
 */
@Data
@Schema(description = "用户绑定的车辆信息")
public class UserVehicleVO {

    @Schema(description = "绑定ID")
    private Long bindId;

    @Schema(description = "车辆ID")
    private Long vehicleId;

    @Schema(description = "车辆型号")
    private String model;

    @Schema(description = "百公里油耗(L)")
    private BigDecimal fuelConsumption;

    @Schema(description = "是否默认车辆")
    private Boolean isDefault;

    @Schema(description = "绑定时间")
    private LocalDateTime bindTime;
}