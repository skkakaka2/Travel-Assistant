package com.travel.assistant.modules.vehicle.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.vehicle.entity.Vehicle;
import org.apache.ibatis.annotations.Mapper;

/**
 * 车辆 Mapper 接口
 */
@Mapper
public interface VehicleMapper extends BaseMapper<Vehicle> {
}