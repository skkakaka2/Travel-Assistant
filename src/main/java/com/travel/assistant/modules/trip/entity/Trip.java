package com.travel.assistant.modules.trip.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 行程实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_trip")
public class Trip extends BaseEntity {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 车辆ID
     */
    private Long vehicleId;

    /**
     * 行程标题
     */
    private String title;

    /**
     * 起点名称
     */
    private String startLocation;

    /**
     * 终点名称
     */
    private String endLocation;

    /**
     * 旅行人数
     */
    private Integer travelersCount;

    /**
     * 状态：0未开始 1进行中 2已完成 3已取消
     */
    private Integer status;

    /**
     * 实际开始时间
     */
    private LocalDateTime startTime;

    /**
     * 实际结束时间
     */
    private LocalDateTime endTime;
}