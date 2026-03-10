package com.travel.assistant.modules.trip.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.utils.UserContextHolder;
import com.travel.assistant.modules.map.service.MapService;
import com.travel.assistant.modules.map.vo.RouteResult;
import com.travel.assistant.modules.trip.dto.CreateTripRequest;
import com.travel.assistant.modules.trip.entity.Trip;
import com.travel.assistant.modules.trip.mapper.TripMapper;
import com.travel.assistant.modules.trip.service.TripService;
import com.travel.assistant.modules.trip.vo.TripVO;
import com.travel.assistant.modules.vehicle.entity.Vehicle;
import com.travel.assistant.modules.vehicle.mapper.VehicleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 行程服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripMapper tripMapper;
    private final VehicleMapper vehicleMapper;
    private final MapService mapService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TripVO createTrip(CreateTripRequest request) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = new Trip();
        trip.setUserId(userId);
        trip.setTitle(request.getTitle());
        trip.setVehicleId(request.getVehicleId());
        trip.setStartLocation(request.getStartLocation());
        trip.setStartLongitude(request.getStartLongitude());
        trip.setStartLatitude(request.getStartLatitude());
        trip.setEndLocation(request.getEndLocation());
        trip.setEndLongitude(request.getEndLongitude());
        trip.setEndLatitude(request.getEndLatitude());
        trip.setStatus(0);

        // 如果有坐标，调用地图API计算路线
        if (request.getStartLongitude() != null && request.getEndLongitude() != null) {
            try {
                RouteResult route = mapService.routePlanning(
                        request.getStartLongitude(), request.getStartLatitude(),
                        request.getEndLongitude(), request.getEndLatitude());
                
                BigDecimal distance = new BigDecimal(route.getDistance())
                        .divide(new BigDecimal(1000), 2, RoundingMode.HALF_UP);
                Integer duration = route.getDuration() / 60;
                
                trip.setDistance(distance);
                trip.setDuration(duration);
            } catch (Exception e) {
                log.warn("路线规划失败，跳过距离计算: {}", e.getMessage());
            }
        }

        tripMapper.insert(trip);
        log.info("创建行程成功: tripId={}, userId={}", trip.getId(), userId);

        return convertToVO(trip);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TripVO updateTrip(Long id, CreateTripRequest request) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = tripMapper.selectById(id);
        if (trip == null || !trip.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.TRIP_NOT_FOUND);
        }

        if (trip.getStatus() != 0) {
            throw new BusinessException("只能修改未开始的行程");
        }

        trip.setTitle(request.getTitle());
        trip.setVehicleId(request.getVehicleId());
        trip.setStartLocation(request.getStartLocation());
        trip.setStartLongitude(request.getStartLongitude());
        trip.setStartLatitude(request.getStartLatitude());
        trip.setEndLocation(request.getEndLocation());
        trip.setEndLongitude(request.getEndLongitude());
        trip.setEndLatitude(request.getEndLatitude());

        if (request.getStartLongitude() != null && request.getEndLongitude() != null) {
            try {
                RouteResult route = mapService.routePlanning(
                        request.getStartLongitude(), request.getStartLatitude(),
                        request.getEndLongitude(), request.getEndLatitude());
                
                BigDecimal distance = new BigDecimal(route.getDistance())
                        .divide(new BigDecimal(1000), 2, RoundingMode.HALF_UP);
                Integer duration = route.getDuration() / 60;
                
                trip.setDistance(distance);
                trip.setDuration(duration);
            } catch (Exception e) {
                log.warn("路线规划失败: {}", e.getMessage());
            }
        }

        tripMapper.updateById(trip);
        log.info("更新行程成功: tripId={}", id);

        return convertToVO(trip);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTrip(Long id) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = tripMapper.selectById(id);
        if (trip == null || !trip.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.TRIP_NOT_FOUND);
        }

        tripMapper.deleteById(id);
        log.info("删除行程成功: tripId={}", id);
    }

    @Override
    public TripVO getTrip(Long id) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = tripMapper.selectById(id);
        if (trip == null || !trip.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.TRIP_NOT_FOUND);
        }

        return convertToVO(trip);
    }

    @Override
    public Page<TripVO> getTripList(Integer page, Integer size, Integer status) {
        Long userId = UserContextHolder.getUserId();

        Page<Trip> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Trip> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Trip::getUserId, userId);
        if (status != null) {
            queryWrapper.eq(Trip::getStatus, status);
        }
        queryWrapper.orderByDesc(Trip::getCreatedAt);

        Page<Trip> tripPage = tripMapper.selectPage(pageParam, queryWrapper);

        Page<TripVO> voPage = new Page<>(tripPage.getCurrent(), tripPage.getSize(), tripPage.getTotal());
        List<TripVO> voList = tripPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TripVO startTrip(Long id) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = tripMapper.selectById(id);
        if (trip == null || !trip.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.TRIP_NOT_FOUND);
        }

        if (trip.getStatus() != 0) {
            throw new BusinessException(ErrorCode.TRIP_ALREADY_ENDED, "行程已开始或已结束");
        }

        trip.setStatus(1);
        trip.setStartTime(LocalDateTime.now());
        tripMapper.updateById(trip);

        log.info("开始行程: tripId={}", id);
        return convertToVO(trip);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TripVO endTrip(Long id) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = tripMapper.selectById(id);
        if (trip == null || !trip.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.TRIP_NOT_FOUND);
        }

        if (trip.getStatus() != 1) {
            throw new BusinessException(ErrorCode.TRIP_NOT_STARTED, "行程未开始");
        }

        trip.setStatus(2);
        trip.setEndTime(LocalDateTime.now());
        tripMapper.updateById(trip);

        log.info("结束行程: tripId={}", id);
        return convertToVO(trip);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelTrip(Long id) {
        Long userId = UserContextHolder.getUserId();

        Trip trip = tripMapper.selectById(id);
        if (trip == null || !trip.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.TRIP_NOT_FOUND);
        }

        if (trip.getStatus() == 2) {
            throw new BusinessException(ErrorCode.TRIP_ALREADY_ENDED, "已完成的行程不能取消");
        }

        trip.setStatus(3);
        tripMapper.updateById(trip);

        log.info("取消行程: tripId={}", id);
    }

    private TripVO convertToVO(Trip trip) {
        TripVO vo = new TripVO();
        BeanUtils.copyProperties(trip, vo);

        if (trip.getVehicleId() != null) {
            Vehicle vehicle = vehicleMapper.selectById(trip.getVehicleId());
            if (vehicle != null) {
                vo.setVehicleModel(vehicle.getModel());
            }
        }

        vo.setStatusDesc(getStatusDesc(trip.getStatus()));
        return vo;
    }

    private String getStatusDesc(Integer status) {
        switch (status) {
            case 0: return "未开始";
            case 1: return "进行中";
            case 2: return "已完成";
            case 3: return "已取消";
            default: return "未知";
        }
    }
}