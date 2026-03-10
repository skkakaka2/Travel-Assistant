package com.travel.assistant.modules.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 家庭位置实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_home_location")
public class HomeLocation extends BaseEntity {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 位置名称
     */
    private String name;

    /**
     * 详细地址
     */
    private String address;

    /**
     * 经度
     */
    private BigDecimal longitude;

    /**
     * 纬度
     */
    private BigDecimal latitude;

    /**
     * 是否默认：0否 1是
     */
    private Integer isDefault;
}