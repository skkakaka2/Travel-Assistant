package com.travel.assistant.modules.user.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 家庭位置返回对象
 */
@Data
@Schema(description = "家庭位置信息")
public class HomeLocationVO {

    @Schema(description = "位置ID")
    private Long id;

    @Schema(description = "位置名称")
    private String name;

    @Schema(description = "详细地址")
    private String address;

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "是否默认")
    private Boolean isDefault;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}