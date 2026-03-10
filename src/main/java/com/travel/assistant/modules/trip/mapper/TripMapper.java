package com.travel.assistant.modules.trip.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.trip.entity.Trip;
import org.apache.ibatis.annotations.Mapper;

/**
 * 行程 Mapper 接口
 */
@Mapper
public interface TripMapper extends BaseMapper<Trip> {
}