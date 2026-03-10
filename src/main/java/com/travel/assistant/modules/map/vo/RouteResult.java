package com.travel.assistant.modules.map.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 路线规划结果
 */
@Data
@Schema(description = "路线规划结果")
public class RouteResult {

    @Schema(description = "总距离（米）")
    private Integer distance;

    @Schema(description = "总时间（秒）")
    private Integer duration;

    @Schema(description = "起点名称")
    private String originName;

    @Schema(description = "终点名称")
    private String destinationName;
}