package com.travel.assistant.modules.activity.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 活动实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_activity")
public class Activity extends BaseEntity {

    /**
     * 创建者ID
     */
    private Long creatorId;

    /**
     * 活动标题
     */
    private String title;

    /**
     * 活动描述
     */
    private String description;

    /**
     * 活动地点
     */
    private String location;

    /**
     * 经度
     */
    private BigDecimal longitude;

    /**
     * 纬度
     */
    private BigDecimal latitude;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 最大参与人数
     */
    private Integer maxParticipants;

    /**
     * 当前参与人数
     */
    private Integer currentParticipants;

    /**
     * 状态：0已取消 1进行中 2已结束
     */
    private Integer status;
}