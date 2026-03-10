package com.travel.assistant.modules.message.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.travel.assistant.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 站内信实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_message")
public class Message extends BaseEntity {

    /**
     * 接收用户ID
     */
    private Long userId;

    /**
     * 消息标题
     */
    private String title;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 消息类型：1系统通知 2活动通知 3其他
     */
    private Integer type;

    /**
     * 是否已读：0未读 1已读
     */
    private Integer isRead;
}