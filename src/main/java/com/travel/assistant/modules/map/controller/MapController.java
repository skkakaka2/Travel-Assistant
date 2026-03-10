package com.travel.assistant.modules.map.controller;

import com.travel.assistant.common.result.Result;
import com.travel.assistant.modules.map.service.MapService;
import com.travel.assistant.modules.map.vo.GeocodingResult;
import com.travel.assistant.modules.map.vo.RouteResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * 地图控制器
 */
@Tag(name = "地图接口", description = "百度地图相关接口")
@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    /**
     * 地理编码（地址转坐标）
     */
    @GetMapping("/geocode")
    @Operation(summary = "地理编码", description = "将地址转换为经纬度坐标")
    public Result<GeocodingResult> geocode(
            @Parameter(description = "地址") @RequestParam String address) {
        GeocodingResult result = mapService.geocoding(address);
        return Result.success(result);
    }

    /**
     * 逆地理编码（坐标转地址）
     */
    @GetMapping("/reverse-geocode")
    @Operation(summary = "逆地理编码", description = "将经纬度坐标转换为地址")
    public Result<String> reverseGeocode(
            @Parameter(description = "经度") @RequestParam BigDecimal longitude,
            @Parameter(description = "纬度") @RequestParam BigDecimal latitude) {
        String address = mapService.reverseGeocoding(longitude, latitude);
        return Result.success(address);
    }

    /**
     * 路线规划
     */
    @GetMapping("/route")
    @Operation(summary = "路线规划", description = "计算两点之间的驾车路线")
    public Result<RouteResult> route(
            @Parameter(description = "起点经度") @RequestParam BigDecimal originLongitude,
            @Parameter(description = "起点纬度") @RequestParam BigDecimal originLatitude,
            @Parameter(description = "终点经度") @RequestParam BigDecimal destinationLongitude,
            @Parameter(description = "终点纬度") @RequestParam BigDecimal destinationLatitude) {
        RouteResult result = mapService.routePlanning(
                originLongitude, originLatitude, 
                destinationLongitude, destinationLatitude);
        return Result.success(result);
    }
}