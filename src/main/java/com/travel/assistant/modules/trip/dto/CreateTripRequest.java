package com.travel.assistant.modules.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

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

    @NotBlank(message = "终点不能为空")
    @Schema(description = "终点名称", example = "北京市朝阳区望京")
    private String endLocation;
}