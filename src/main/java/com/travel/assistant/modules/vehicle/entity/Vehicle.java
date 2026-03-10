package com.travel.assistant.modules.vehicle.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 车辆实体类
 * 
 * 只包含两个业务字段：
 * - model：车辆型号
 * - fuelConsumption：百公里油耗
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_vehicle")
public class Vehicle extends BaseEntity {

    /**
     * 车辆型号
     */
    private String model;

    /**
     * 百公里油耗(L)
     */
    private BigDecimal fuelConsumption;
}