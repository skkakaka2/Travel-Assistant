package com.travel.assistant.modules.trip.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.modules.trip.dto.CreateTripRequest;
import com.travel.assistant.modules.trip.vo.TripVO;

/**
 * 行程服务接口
 */
public interface TripService {

    /**
     * 创建行程
     * @param request 请求参数
     * @return 行程信息
     */
    TripVO createTrip(CreateTripRequest request);

    /**
     * 更新行程
     * @param id 行程ID
     * @param request 请求参数
     * @return 行程信息
     */
    TripVO updateTrip(Long id, CreateTripRequest request);

    /**
     * 删除行程
     * @param id 行程ID
     */
    void deleteTrip(Long id);

    /**
     * 获取行程详情
     * @param id 行程ID
     * @return 行程信息
     */
    TripVO getTrip(Long id);

    /**
     * 分页获取行程列表
     * @param page 页码
     * @param size 每页数量
     * @param status 状态筛选
     * @return 分页数据
     */
    Page<TripVO> getTripList(Integer page, Integer size, Integer status);

    /**
     * 开始行程
     * @param id 行程ID
     * @return 行程信息
     */
    TripVO startTrip(Long id);

    /**
     * 结束行程
     * @param id 行程ID
     * @return 行程信息
     */
    TripVO endTrip(Long id);

    /**
     * 取消行程
     * @param id 行程ID
     */
    void cancelTrip(Long id);
}