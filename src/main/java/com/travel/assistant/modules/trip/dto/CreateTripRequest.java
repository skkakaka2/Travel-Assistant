package com.travel.assistant.modules.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 创建行程请求参数
 */
@Data
@Schema(description = "创建行程请求参数")
public class CreateTripRequest {

    @Size(max = 100, message = "行程标题最多100个字符")
    @Schema(description = "行程标题", example = "周末郊游")
    private String title;

    private Long vehicleId;

    @NotBlank(message = "起点不能为空")
    @Schema(description = "起点名称", example = "北京市海淀区中关村")
    private String startLocation;

    @DecimalMin(value = "-180.0", message = "经度范围错误")
    @DecimalMax(value = "180.0", message = "经度范围错误")
    @Schema(description = "起点经度")
    private BigDecimal startLongitude;

    @DecimalMin(value = "-90.0", message = "纬度范围错误")
    @DecimalMax(value = "90.0", message = "纬度范围错误")
    @Schema(description = "起点纬度")
    private BigDecimal startLatitude;

    @NotBlank(message = "终点不能为空")
    @Schema(description = "终点名称", example = "北京市朝阳区望京")
    private String endLocation;

    @DecimalMin(value = "-180.0", message = "经度范围错误")
    @DecimalMax(value = "180.0", message = "经度范围错误")
    @Schema(description = "终点经度")
    private BigDecimal endLongitude;

    @DecimalMin(value = "-90.0", message = "纬度范围错误")
    @DecimalMax(value = "90.0", message = "纬度范围错误")
    @Schema(description = "终点纬度")
    private BigDecimal endLatitude;
}