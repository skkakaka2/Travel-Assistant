package com.travel.assistant.modules.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.activity.entity.Activity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 活动 Mapper 接口
 */
@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {
}