package com.travel.assistant.modules.message.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.message.service.MessageService;
import com.travel.assistant.modules.message.vo.MessageVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 站内信控制器
 */
@Tag(name = "站内信接口", description = "消息通知相关接口")
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{id}")
    @Operation(summary = "获取消息详情")
    public Result<MessageVO> getMessage(@PathVariable Long id) {
        MessageVO message = messageService.getMessage(id);
        return Result.success(message);
    }

    @GetMapping
    @Operation(summary = "获取消息列表")
    public Result<Page<MessageVO>> getMessageList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer isRead) {
        Page<MessageVO> messagePage = messageService.getMessageList(page, size, isRead);
        return Result.success(messagePage);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "获取未读消息数量")
    public Result<Integer> getUnreadCount() {
        Integer count = messageService.getUnreadCount();
        return Result.success(count);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "标记消息已读")
    public Result<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return Result.success();
    }

    @PutMapping("/read-all")
    @Operation(summary = "标记所有消息已读")
    public Result<Void> markAllAsRead() {
        messageService.markAllAsRead();
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除消息")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return Result.success();
    }
}