package com.travel.assistant.modules.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.activity.entity.ActivityParticipant;
import org.apache.ibatis.annotations.Mapper;

/**
 * 活动参与 Mapper 接口
 */
@Mapper
public interface ActivityParticipantMapper extends BaseMapper<ActivityParticipant> {
}