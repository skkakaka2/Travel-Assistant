package com.travel.assistant.modules.vehicle.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 车辆请求参数
 */
@Data
@Schema(description = "车辆请求参数")
public class VehicleRequest {

    @NotBlank(message = "车辆型号不能为空")
    @Size(max = 100, message = "车辆型号最多100个字符")
    @Schema(description = "车辆型号", example = "丰田卡罗拉 2023款")
    private String model;

    @DecimalMin(value = "0", message = "油耗不能为负数")
    @Schema(description = "百公里油耗(L)", example = "7.5")
    private BigDecimal fuelConsumption;
}