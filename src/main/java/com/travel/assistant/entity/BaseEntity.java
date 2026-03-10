package com.travel.assistant.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 实体基类
 * 
 * 包含所有表的公共字段
 * 
 * 注解说明：
 * @Data：Lombok 自动生成 getter/setter/toString/equals/hashCode
 * 
 * 字段注解：
 * @TableId：主键
 *   - type = IdType.AUTO：数据库自增
 * @TableField：字段配置
 *   - fill = FieldFill.INSERT：插入时自动填充
 *   - fill = FieldFill.INSERT_UPDATE：插入和更新时自动填充
 */
@Data
public class BaseEntity implements Serializable {

    /**
     * 主键 ID（数据库自增）
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除标记
     * 0：未删除
     * 1：已删除
     */
    @TableLogic
    private Integer deleted;
}