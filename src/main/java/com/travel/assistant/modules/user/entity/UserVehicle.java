package com.travel.assistant.modules.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 用户车辆绑定实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_user_vehicle")
public class UserVehicle extends BaseEntity {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 车辆ID
     */
    private Long vehicleId;

    /**
     * 是否默认车辆：0否 1是
     */
    private Integer isDefault;

    /**
     * 绑定时间
     */
    private LocalDateTime bindTime;
}