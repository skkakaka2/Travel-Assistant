package com.travel.assistant.modules.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 添加/更新家庭位置请求参数
 */
@Data
@Schema(description = "家庭位置请求参数")
public class HomeLocationRequest {

    @Size(max = 100, message = "位置名称最多100个字符")
    @Schema(description = "位置名称", example = "家")
    private String name;

    @Size(max = 255, message = "地址最多255个字符")
    @NotBlank(message = "地址不能为空")
    @Schema(description = "详细地址", example = "北京市海淀区中关村大街1号")
    private String address;

    @DecimalMin(value = "-180.0", message = "经度范围错误")
    @DecimalMax(value = "180.0", message = "经度范围错误")
    @Schema(description = "经度", example = "116.397128")
    private BigDecimal longitude;

    @DecimalMin(value = "-90.0", message = "纬度范围错误")
    @DecimalMax(value = "90.0", message = "纬度范围错误")
    @Schema(description = "纬度", example = "39.916527")
    private BigDecimal latitude;

    @Schema(description = "是否设为默认", example = "false")
    private Boolean isDefault;
}