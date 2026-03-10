package com.travel.assistant.modules.activity.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 活动返回对象
 */
@Data
@Schema(description = "活动信息")
public class ActivityVO {

    @Schema(description = "活动ID")
    private Long id;

    @Schema(description = "创建者ID")
    private Long creatorId;

    @Schema(description = "创建者昵称")
    private String creatorNickname;

    @Schema(description = "活动标题")
    private String title;

    @Schema(description = "活动描述")
    private String description;

    @Schema(description = "活动地点")
    private String location;

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "最大参与人数")
    private Integer maxParticipants;

    @Schema(description = "当前参与人数")
    private Integer currentParticipants;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "状态描述")
    private String statusDesc;

    @Schema(description = "当前用户是否已参加")
    private Boolean joined;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}