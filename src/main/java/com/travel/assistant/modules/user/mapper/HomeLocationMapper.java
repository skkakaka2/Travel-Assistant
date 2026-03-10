package com.travel.assistant.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.user.entity.HomeLocation;
import org.apache.ibatis.annotations.Mapper;

/**
 * 家庭位置 Mapper 接口
 */
@Mapper
public interface HomeLocationMapper extends BaseMapper<HomeLocation> {
}