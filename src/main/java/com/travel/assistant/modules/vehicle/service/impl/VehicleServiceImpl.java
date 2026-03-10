package com.travel.assistant.modules.vehicle.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.utils.UserContextHolder;
import com.travel.assistant.modules.user.entity.UserVehicle;
import com.travel.assistant.modules.user.mapper.UserVehicleMapper;
import com.travel.assistant.modules.vehicle.dto.VehicleRequest;
import com.travel.assistant.modules.vehicle.entity.Vehicle;
import com.travel.assistant.modules.vehicle.mapper.VehicleMapper;
import com.travel.assistant.modules.vehicle.service.VehicleService;
import com.travel.assistant.modules.vehicle.vo.UserVehicleVO;
import com.travel.assistant.modules.vehicle.vo.VehicleVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 车辆服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleMapper vehicleMapper;
    private final UserVehicleMapper userVehicleMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public VehicleVO createVehicle(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setModel(request.getModel());
        vehicle.setFuelConsumption(request.getFuelConsumption());

        vehicleMapper.insert(vehicle);
        log.info("创建车辆成功: vehicleId={}, model={}", vehicle.getId(), vehicle.getModel());

        return convertToVO(vehicle);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public VehicleVO updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleMapper.selectById(id);
        if (vehicle == null) {
            throw new BusinessException(ErrorCode.VEHICLE_NOT_FOUND);
        }

        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }
        if (request.getFuelConsumption() != null) {
            vehicle.setFuelConsumption(request.getFuelConsumption());
        }

        vehicleMapper.updateById(vehicle);
        log.info("更新车辆成功: vehicleId={}", id);

        return convertToVO(vehicle);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleMapper.selectById(id);
        if (vehicle == null) {
            throw new BusinessException(ErrorCode.VEHICLE_NOT_FOUND);
        }

        // 检查是否有用户绑定了该车辆
        LambdaQueryWrapper<UserVehicle> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserVehicle::getVehicleId, id);
        long bindCount = userVehicleMapper.selectCount(queryWrapper);
        if (bindCount > 0) {
            throw new BusinessException("该车辆已被用户绑定，无法删除");
        }

        vehicleMapper.deleteById(id);
        log.info("删除车辆成功: vehicleId={}", id);
    }

    @Override
    public VehicleVO getVehicle(Long id) {
        Vehicle vehicle = vehicleMapper.selectById(id);
        if (vehicle == null) {
            throw new BusinessException(ErrorCode.VEHICLE_NOT_FOUND);
        }
        return convertToVO(vehicle);
    }

    @Override
    public Page<VehicleVO> getVehicleList(Integer page, Integer size, String model) {
        // 创建分页对象
        Page<Vehicle> pageParam = new Page<>(page, size);

        // 构建查询条件
        LambdaQueryWrapper<Vehicle> queryWrapper = new LambdaQueryWrapper<>();
        if (model != null && !model.isEmpty()) {
            queryWrapper.like(Vehicle::getModel, model);
        }
        queryWrapper.orderByDesc(Vehicle::getCreatedAt);

        // 执行分页查询
        Page<Vehicle> vehiclePage = vehicleMapper.selectPage(pageParam, queryWrapper);

        // 转换为 VO 分页对象
        Page<VehicleVO> voPage = new Page<>(vehiclePage.getCurrent(), vehiclePage.getSize(), vehiclePage.getTotal());
        List<VehicleVO> voList = vehiclePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public List<UserVehicleVO> getUserVehicles() {
        Long userId = UserContextHolder.getUserId();

        // 查询用户绑定的车辆ID列表
        LambdaQueryWrapper<UserVehicle> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserVehicle::getUserId, userId)
                   .orderByDesc(UserVehicle::getIsDefault)
                   .orderByDesc(UserVehicle::getBindTime);

        List<UserVehicle> userVehicles = userVehicleMapper.selectList(queryWrapper);

        // 关联查询车辆信息
        return userVehicles.stream()
                .map(uv -> {
                    Vehicle vehicle = vehicleMapper.selectById(uv.getVehicleId());
                    if (vehicle != null) {
                        UserVehicleVO vo = new UserVehicleVO();
                        vo.setBindId(uv.getId());
                        vo.setVehicleId(vehicle.getId());
                        vo.setModel(vehicle.getModel());
                        vo.setFuelConsumption(vehicle.getFuelConsumption());
                        vo.setIsDefault(uv.getIsDefault() == 1);
                        vo.setBindTime(uv.getBindTime());
                        return vo;
                    }
                    return null;
                })
                .filter(vo -> vo != null)
                .collect(Collectors.toList());
    }

    /**
     * 将 Vehicle 实体转换为 VehicleVO
     */
    private VehicleVO convertToVO(Vehicle vehicle) {
        VehicleVO vo = new VehicleVO();
        BeanUtils.copyProperties(vehicle, vo);
        return vo;
    }
}