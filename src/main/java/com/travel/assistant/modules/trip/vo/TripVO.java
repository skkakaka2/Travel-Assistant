package com.travel.assistant.modules.trip.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 行程返回对象
 */
@Data
@Schema(description = "行程信息")
public class TripVO {

    @Schema(description = "行程ID")
    private Long id;

    @Schema(description = "行程标题")
    private String title;

    @Schema(description = "车辆ID")
    private Long vehicleId;

    @Schema(description = "车辆型号")
    private String vehicleModel;

    @Schema(description = "起点名称")
    private String startLocation;

    @Schema(description = "起点经度")
    private BigDecimal startLongitude;

    @Schema(description = "起点纬度")
    private BigDecimal startLatitude;

    @Schema(description = "终点名称")
    private String endLocation;

    @Schema(description = "终点经度")
    private BigDecimal endLongitude;

    @Schema(description = "终点纬度")
    private BigDecimal endLatitude;

    @Schema(description = "行程距离（公里）")
    private BigDecimal distance;

    @Schema(description = "行程时长（分钟）")
    private Integer duration;

    @Schema(description = "状态：0未开始 1进行中 2已完成 3已取消")
    private Integer status;

    @Schema(description = "状态描述")
    private String statusDesc;

    @Schema(description = "实际开始时间")
    private LocalDateTime startTime;

    @Schema(description = "实际结束时间")
    private LocalDateTime endTime;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}