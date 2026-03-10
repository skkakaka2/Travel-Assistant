package com.travel.assistant.modules.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 创建/更新活动请求参数
 */
@Data
@Schema(description = "活动请求参数")
public class ActivityRequest {

    @NotBlank(message = "活动标题不能为空")
    @Size(max = 100, message = "标题最多100个字符")
    @Schema(description = "活动标题", example = "周末自驾游")
    private String title;

    @Schema(description = "活动描述", example = "一起去郊区烧烤")
    private String description;

    @Schema(description = "活动地点", example = "北京市怀柔区雁栖湖")
    private String location;

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "最大参与人数", example = "20")
    private Integer maxParticipants;
}