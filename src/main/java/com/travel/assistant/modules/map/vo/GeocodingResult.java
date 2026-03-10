package com.travel.assistant.modules.map.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 地理编码结果
 */
@Data
@Schema(description = "地理编码结果")
public class GeocodingResult {

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "置信度")
    private Integer confidence;

    @Schema(description = "解析级别")
    private String level;
}