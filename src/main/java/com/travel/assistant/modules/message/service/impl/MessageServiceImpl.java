package com.travel.assistant.modules.message.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.utils.UserContextHolder;
import com.travel.assistant.modules.message.entity.Message;
import com.travel.assistant.modules.message.mapper.MessageMapper;
import com.travel.assistant.modules.message.service.MessageService;
import com.travel.assistant.modules.message.vo.MessageVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 站内信服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageMapper messageMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void sendMessage(Long userId, String title, String content, Integer type) {
        Message message = new Message();
        message.setUserId(userId);
        message.setTitle(title);
        message.setContent(content);
        message.setType(type != null ? type : 1);
        message.setIsRead(0);

        messageMapper.insert(message);
        log.info("发送消息成功: userId={}, title={}", userId, title);
    }

    @Override
    public void sendSystemMessage(Long userId, String title, String content) {
        sendMessage(userId, title, content, 1);
    }

    @Override
    public MessageVO getMessage(Long id) {
        Long userId = UserContextHolder.getUserId();

        Message message = messageMapper.selectById(id);
        if (message == null || !message.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "消息不存在");
        }

        return convertToVO(message);
    }

    @Override
    public Page<MessageVO> getMessageList(Integer page, Integer size, Integer isRead) {
        Long userId = UserContextHolder.getUserId();

        Page<Message> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Message::getUserId, userId);
        if (isRead != null) {
            queryWrapper.eq(Message::getIsRead, isRead);
        }
        queryWrapper.orderByDesc(Message::getCreatedAt);

        Page<Message> messagePage = messageMapper.selectPage(pageParam, queryWrapper);

        Page<MessageVO> voPage = new Page<>(messagePage.getCurrent(), messagePage.getSize(), messagePage.getTotal());
        List<MessageVO> voList = messagePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public Integer getUnreadCount() {
        Long userId = UserContextHolder.getUserId();
        return messageMapper.countUnread(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAsRead(Long id) {
        Long userId = UserContextHolder.getUserId();

        Message message = messageMapper.selectById(id);
        if (message == null || !message.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "消息不存在");
        }

        if (message.getIsRead() == 0) {
            message.setIsRead(1);
            messageMapper.updateById(message);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAllAsRead() {
        Long userId = UserContextHolder.getUserId();
        messageMapper.markAllAsRead(userId);
        log.info("标记所有消息已读: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMessage(Long id) {
        Long userId = UserContextHolder.getUserId();

        Message message = messageMapper.selectById(id);
        if (message == null || !message.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "消息不存在");
        }

        messageMapper.deleteById(id);
        log.info("删除消息: messageId={}", id);
    }

    private MessageVO convertToVO(Message message) {
        MessageVO vo = new MessageVO();
        BeanUtils.copyProperties(message, vo);
        vo.setIsRead(message.getIsRead() == 1);
        vo.setTypeDesc(getTypeDesc(message.getType()));
        return vo;
    }

    private String getTypeDesc(Integer type) {
        switch (type) {
            case 1: return "系统通知";
            case 2: return "活动通知";
            default: return "其他";
        }
    }
}