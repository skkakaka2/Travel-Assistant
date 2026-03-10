package com.travel.assistant.modules.vehicle.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.modules.vehicle.dto.VehicleRequest;
import com.travel.assistant.modules.vehicle.vo.UserVehicleVO;
import com.travel.assistant.modules.vehicle.vo.VehicleVO;

import java.util.List;

/**
 * 车辆服务接口
 */
public interface VehicleService {

    /**
     * 创建车辆
     * @param request 车辆请求参数
     * @return 车辆信息
     */
    VehicleVO createVehicle(VehicleRequest request);

    /**
     * 更新车辆信息
     * @param id 车辆ID
     * @param request 车辆请求参数
     * @return 车辆信息
     */
    VehicleVO updateVehicle(Long id, VehicleRequest request);

    /**
     * 删除车辆
     * @param id 车辆ID
     */
    void deleteVehicle(Long id);

    /**
     * 获取车辆详情
     * @param id 车辆ID
     * @return 车辆信息
     */
    VehicleVO getVehicle(Long id);

    /**
     * 分页获取车辆列表
     * @param page 页码
     * @param size 每页数量
     * @param model 车辆型号（模糊搜索）
     * @return 车辆分页数据
     */
    Page<VehicleVO> getVehicleList(Integer page, Integer size, String model);

    /**
     * 获取当前用户绑定的车辆列表
     * @return 绑定的车辆列表
     */
    List<UserVehicleVO> getUserVehicles();
}