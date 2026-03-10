package com.travel.assistant.modules.activity.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 活动参与实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_activity_participant")
public class ActivityParticipant extends BaseEntity {

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 参与时间
     */
    private LocalDateTime joinTime;

    /**
     * 状态：0已退出 1已参与
     */
    private Integer status;
}