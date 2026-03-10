package com.travel.assistant.modules.map.service;

import com.travel.assistant.modules.map.vo.GeocodingResult;
import com.travel.assistant.modules.map.vo.RouteResult;

import java.math.BigDecimal;

/**
 * 地图服务接口
 * 
 * 封装百度地图 API 调用
 */
public interface MapService {

    /**
     * 地理编码：地址转坐标
     * @param address 地址字符串
     * @return 坐标信息
     */
    GeocodingResult geocoding(String address);

    /**
     * 逆地理编码：坐标转地址
     * @param longitude 经度
     * @param latitude 纬度
     * @return 地址字符串
     */
    String reverseGeocoding(BigDecimal longitude, BigDecimal latitude);

    /**
     * 路线规划
     * @param originLongitude 起点经度
     * @param originLatitude 起点纬度
     * @param destinationLongitude 终点经度
     * @param destinationLatitude 终点纬度
     * @return 路线信息
     */
    RouteResult routePlanning(BigDecimal originLongitude, BigDecimal originLatitude,
                             BigDecimal destinationLongitude, BigDecimal destinationLatitude);
}