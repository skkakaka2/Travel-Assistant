package com.travel.assistant.modules.user.service;

import com.travel.assistant.modules.user.dto.HomeLocationRequest;
import com.travel.assistant.modules.user.dto.LoginRequest;
import com.travel.assistant.modules.user.dto.RegisterRequest;
import com.travel.assistant.modules.user.dto.UpdateUserRequest;
import com.travel.assistant.modules.user.vo.HomeLocationVO;
import com.travel.assistant.modules.user.vo.LoginVO;
import com.travel.assistant.modules.user.vo.UserVO;

import java.util.List;

/**
 * 用户服务接口
 * 
 * 定义用户模块的业务方法
 * 
 * 分层架构：
 * Controller -> Service -> Mapper
 * - Controller：接收请求，调用 Service，返回响应
 * - Service：处理业务逻辑
 * - Mapper：数据库操作
 */
public interface UserService {

    /**
     * 用户注册
     * @param request 注册请求参数
     * @return 用户信息
     */
    UserVO register(RegisterRequest request);

    /**
     * 用户登录
     * @param request 登录请求参数
     * @return 登录响应（Token + 用户信息）
     */
    LoginVO login(LoginRequest request);

    /**
     * 获取当前用户信息
     * @return 用户信息
     */
    UserVO getCurrentUser();

    /**
     * 更新用户信息
     * @param request 更新请求参数
     * @return 更新后的用户信息
     */
    UserVO updateUserInfo(UpdateUserRequest request);

    /**
     * 更新用户头像
     * @param avatarUrl 头像URL
     */
    void updateAvatar(String avatarUrl);

    /**
     * 获取用户的家庭位置列表
     * @return 家庭位置列表
     */
    List<HomeLocationVO> getHomeLocations();

    /**
     * 添加家庭位置
     * @param request 位置请求参数
     * @return 位置信息
     */
    HomeLocationVO addHomeLocation(HomeLocationRequest request);

    /**
     * 更新家庭位置
     * @param id 位置ID
     * @param request 位置请求参数
     * @return 位置信息
     */
    HomeLocationVO updateHomeLocation(Long id, HomeLocationRequest request);

    /**
     * 删除家庭位置
     * @param id 位置ID
     */
    void deleteHomeLocation(Long id);

    /**
     * 设置默认家庭位置
     * @param id 位置ID
     */
    void setDefaultHomeLocation(Long id);

    /**
     * 绑定车辆
     * @param vehicleId 车辆ID
     */
    void bindVehicle(Long vehicleId);

    /**
     * 解绑车辆
     * @param vehicleId 车辆ID
     */
    void unbindVehicle(Long vehicleId);

    /**
     * 设置默认车辆
     * @param vehicleId 车辆ID
     */
    void setDefaultVehicle(Long vehicleId);
}