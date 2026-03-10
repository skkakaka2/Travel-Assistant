package com.travel.assistant.modules.map.service.impl;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.modules.map.service.MapService;
import com.travel.assistant.modules.map.vo.GeocodingResult;
import com.travel.assistant.modules.map.vo.RouteResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * 百度地图服务实现类
 * 
 * 调用百度地图 Web API 进行地理编码和路线规划
 * 
 * API 文档：
 * - 地理编码：https://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-geocoding
 * - 路线规划：https://lbsyun.baidu.com/index.php?title=webapi/direction
 */
@Slf4j
@Service
public class BaiduMapServiceImpl implements MapService {

    @Value("${app.baidu-map.ak}")
    private String ak;

    @Value("${app.baidu-map.geocoding-url}")
    private String geocodingUrl;

    @Value("${app.baidu-map.reverse-geocoding-url}")
    private String reverseGeocodingUrl;

    @Value("${app.baidu-map.direction-url}")
    private String directionUrl;

    @Override
    public GeocodingResult geocoding(String address) {
        try {
            // 构建请求 URL
            // 输出格式为 JSON
            String url = geocodingUrl + "?address=" + address + "&output=json&ak=" + ak;
            
            log.debug("调用百度地图地理编码API: address={}", address);
            
            // 发送 HTTP GET 请求
            String response = HttpUtil.get(url);
            JSONObject json = JSONUtil.parseObj(response);

            // 检查返回状态
            if (json.getInt("status") != 0) {
                log.error("百度地图地理编码失败: {}", response);
                throw new BusinessException(ErrorCode.MAP_API_ERROR, "地址解析失败");
            }

            // 解析结果
            JSONObject location = json.getJSONObject("result").getJSONObject("location");
            GeocodingResult result = new GeocodingResult();
            result.setLongitude(location.getBigDecimal("lng"));
            result.setLatitude(location.getBigDecimal("lat"));
            result.setConfidence(json.getJSONObject("result").getInt("confidence"));
            result.setLevel(json.getJSONObject("result").getStr("level"));

            log.debug("地理编码成功: address={}, lng={}, lat={}", 
                    address, result.getLongitude(), result.getLatitude());
            
            return result;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("调用百度地图API异常", e);
            throw new BusinessException(ErrorCode.MAP_API_ERROR, "地图服务调用失败");
        }
    }

    @Override
    public String reverseGeocoding(BigDecimal longitude, BigDecimal latitude) {
        try {
            // 构建请求 URL
            // location 格式：纬度,经度
            String location = latitude + "," + longitude;
            String url = reverseGeocodingUrl + "?location=" + location + "&output=json&ak=" + ak;
            
            log.debug("调用百度地图逆地理编码API: location={}", location);
            
            // 发送请求
            String response = HttpUtil.get(url);
            JSONObject json = JSONUtil.parseObj(response);

            // 检查状态
            if (json.getInt("status") != 0) {
                log.error("百度地图逆地理编码失败: {}", response);
                throw new BusinessException(ErrorCode.MAP_API_ERROR, "坐标解析失败");
            }

            // 获取格式化地址
            String formattedAddress = json.getJSONObject("result").getStr("formatted_address");
            
            log.debug("逆地理编码成功: location={}, address={}", location, formattedAddress);
            
            return formattedAddress;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("调用百度地图API异常", e);
            throw new BusinessException(ErrorCode.MAP_API_ERROR, "地图服务调用失败");
        }
    }

    @Override
    public RouteResult routePlanning(BigDecimal originLongitude, BigDecimal originLatitude,
                                     BigDecimal destinationLongitude, BigDecimal destinationLatitude) {
        try {
            // 构建请求 URL
            // origin 和 destination 格式：经度,纬度
            String origin = originLongitude + "," + originLatitude;
            String destination = destinationLongitude + "," + destinationLatitude;
            String url = directionUrl + "?origin=" + origin + "&destination=" + destination + "&output=json&ak=" + ak;
            
            log.debug("调用百度地图路线规划API: origin={}, destination={}", origin, destination);
            
            // 发送请求
            String response = HttpUtil.get(url);
            JSONObject json = JSONUtil.parseObj(response);

            // 检查状态
            if (json.getInt("status") != 0) {
                log.error("百度地图路线规划失败: {}", response);
                throw new BusinessException(ErrorCode.MAP_API_ERROR, "路线规划失败");
            }

            // 解析结果
            JSONObject result = json.getJSONObject("result");
            JSONObject routes = result.getJSONArray("routes").getJSONObject(0);
            
            RouteResult routeResult = new RouteResult();
            routeResult.setDistance(routes.getInt("distance"));  // 单位：米
            routeResult.setDuration(routes.getInt("duration"));  // 单位：秒
            routeResult.setOriginName(result.getStr("origin"));
            routeResult.setDestinationName(result.getStr("destination"));

            log.debug("路线规划成功: distance={}米, duration={}秒", 
                    routeResult.getDistance(), routeResult.getDuration());
            
            return routeResult;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("调用百度地图API异常", e);
            throw new BusinessException(ErrorCode.MAP_API_ERROR, "地图服务调用失败");
        }
    }
}