package com.travel.assistant.modules.message.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 消息返回对象
 */
@Data
@Schema(description = "消息信息")
public class MessageVO {

    @Schema(description = "消息ID")
    private Long id;

    @Schema(description = "消息标题")
    private String title;

    @Schema(description = "消息内容")
    private String content;

    @Schema(description = "消息类型")
    private Integer type;

    @Schema(description = "消息类型描述")
    private String typeDesc;

    @Schema(description = "是否已读")
    private Boolean isRead;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}