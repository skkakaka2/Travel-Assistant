package com.travel.assistant.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.user.entity.UserVehicle;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户车辆绑定 Mapper 接口
 */
@Mapper
public interface UserVehicleMapper extends BaseMapper<UserVehicle> {
}