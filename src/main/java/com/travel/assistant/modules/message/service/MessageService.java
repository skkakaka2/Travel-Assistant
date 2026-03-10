package com.travel.assistant.modules.message.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.modules.message.vo.MessageVO;

/**
 * 站内信服务接口
 */
public interface MessageService {

    /**
     * 发送消息
     */
    void sendMessage(Long userId, String title, String content, Integer type);

    /**
     * 发送系统消息
     */
    void sendSystemMessage(Long userId, String title, String content);

    /**
     * 获取消息详情
     */
    MessageVO getMessage(Long id);

    /**
     * 分页获取消息列表
     */
    Page<MessageVO> getMessageList(Integer page, Integer size, Integer isRead);

    /**
     * 获取未读消息数量
     */
    Integer getUnreadCount();

    /**
     * 标记消息为已读
     */
    void markAsRead(Long id);

    /**
     * 标记所有消息为已读
     */
    void markAllAsRead();

    /**
     * 删除消息
     */
    void deleteMessage(Long id);
}