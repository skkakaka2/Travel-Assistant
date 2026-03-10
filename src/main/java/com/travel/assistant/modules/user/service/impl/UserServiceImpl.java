package com.travel.assistant.modules.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.utils.JwtUtils;
import com.travel.assistant.common.utils.PasswordUtils;
import com.travel.assistant.common.utils.UserContextHolder;
import com.travel.assistant.modules.user.dto.HomeLocationRequest;
import com.travel.assistant.modules.user.dto.LoginRequest;
import com.travel.assistant.modules.user.dto.RegisterRequest;
import com.travel.assistant.modules.user.dto.UpdateUserRequest;
import com.travel.assistant.modules.user.entity.HomeLocation;
import com.travel.assistant.modules.user.entity.User;
import com.travel.assistant.modules.user.entity.UserVehicle;
import com.travel.assistant.modules.user.mapper.HomeLocationMapper;
import com.travel.assistant.modules.user.mapper.UserMapper;
import com.travel.assistant.modules.user.mapper.UserVehicleMapper;
import com.travel.assistant.modules.user.service.UserService;
import com.travel.assistant.modules.user.vo.HomeLocationVO;
import com.travel.assistant.modules.user.vo.LoginVO;
import com.travel.assistant.modules.user.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户服务实现类
 * 
 * @Service：标记这是一个服务类，Spring 会自动创建实例
 * @Transactional：事务管理，方法执行出错时自动回滚
 * @RequiredArgsConstructor：Lombok 生成构造函数，用于依赖注入
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final HomeLocationMapper homeLocationMapper;
    private final UserVehicleMapper userVehicleMapper;
    private final PasswordUtils passwordUtils;
    private final JwtUtils jwtUtils;

    // ==================== 认证相关 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO register(RegisterRequest request) {
        // 1. 检查用户名是否已存在
        // LambdaQueryWrapper 是 MyBatis-Plus 的查询条件构造器
        // 相当于 SQL：SELECT * FROM t_user WHERE username = ? AND deleted = 0
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, request.getUsername());
        
        User existUser = userMapper.selectOne(queryWrapper);
        if (existUser != null) {
            throw new BusinessException(ErrorCode.USER_EXISTS);
        }

        // 2. 检查手机号是否已存在
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            LambdaQueryWrapper<User> phoneQuery = new LambdaQueryWrapper<>();
            phoneQuery.eq(User::getPhone, request.getPhone());
            if (userMapper.selectCount(phoneQuery) > 0) {
                throw new BusinessException(ErrorCode.PHONE_EXISTS);
            }
        }

        // 3. 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        // 密码加密存储
        user.setPassword(passwordUtils.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setPhone(request.getPhone());
        user.setStatus(1);  // 默认正常状态

        // 4. 保存到数据库
        userMapper.insert(user);
        
        log.info("用户注册成功: userId={}, username={}", user.getId(), user.getUsername());

        // 5. 返回用户信息（不包含密码）
        return convertToVO(user);
    }

    @Override
    public LoginVO login(LoginRequest request) {
        // 1. 根据用户名查询用户
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, request.getUsername());
        User user = userMapper.selectOne(queryWrapper);

        // 2. 检查用户是否存在
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 3. 检查账号状态
        if (user.getStatus() == 0) {
            throw new BusinessException(ErrorCode.USER_DISABLED);
        }

        // 4. 验证密码
        if (!passwordUtils.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_ERROR);
        }

        // 5. 生成 Token
        String token = jwtUtils.generateToken(user.getId(), user.getUsername());

        // 6. 返回 Token 和用户信息
        UserVO userVO = convertToVO(user);
        log.info("用户登录成功: userId={}, username={}", user.getId(), user.getUsername());
        
        return LoginVO.of(token, userVO);
    }

    // ==================== 用户信息相关 ====================

    @Override
    public UserVO getCurrentUser() {
        // 从上下文获取当前用户ID
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        return convertToVO(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO updateUserInfo(UpdateUserRequest request) {
        Long userId = UserContextHolder.getUserId();
        User user = userMapper.selectById(userId);
        
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 更新字段（只更新非空字段）
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getPhone() != null) {
            // 检查手机号是否被其他用户使用
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getPhone, request.getPhone())
                       .ne(User::getId, userId);
            if (userMapper.selectCount(queryWrapper) > 0) {
                throw new BusinessException(ErrorCode.PHONE_EXISTS);
            }
            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        userMapper.updateById(user);
        log.info("更新用户信息成功: userId={}", userId);

        return convertToVO(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAvatar(String avatarUrl) {
        Long userId = UserContextHolder.getUserId();
        
        User user = new User();
        user.setId(userId);
        user.setAvatar(avatarUrl);
        
        userMapper.updateById(user);
        log.info("更新用户头像成功: userId={}", userId);
    }

    // ==================== 家庭位置相关 ====================

    @Override
    public List<HomeLocationVO> getHomeLocations() {
        Long userId = UserContextHolder.getUserId();

        // 查询用户的所有家庭位置
        LambdaQueryWrapper<HomeLocation> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(HomeLocation::getUserId, userId)
                   .orderByDesc(HomeLocation::getIsDefault)
                   .orderByDesc(HomeLocation::getCreatedAt);

        List<HomeLocation> locations = homeLocationMapper.selectList(queryWrapper);
        
        // 转换为 VO 列表
        return locations.stream()
                .map(this::convertHomeLocationToVO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HomeLocationVO addHomeLocation(HomeLocationRequest request) {
        Long userId = UserContextHolder.getUserId();

        HomeLocation location = new HomeLocation();
        location.setUserId(userId);
        location.setName(request.getName());
        location.setAddress(request.getAddress());
        location.setLongitude(request.getLongitude());
        location.setLatitude(request.getLatitude());

        // 如果设置为默认，先取消其他默认位置
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultHomeLocation(userId);
            location.setIsDefault(1);
        } else {
            location.setIsDefault(0);
        }

        homeLocationMapper.insert(location);
        log.info("添加家庭位置成功: userId={}, locationId={}", userId, location.getId());

        return convertHomeLocationToVO(location);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HomeLocationVO updateHomeLocation(Long id, HomeLocationRequest request) {
        Long userId = UserContextHolder.getUserId();

        // 查询位置是否存在且属于当前用户
        HomeLocation location = homeLocationMapper.selectById(id);
        if (location == null || !location.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "位置不存在");
        }

        // 更新字段
        if (request.getName() != null) {
            location.setName(request.getName());
        }
        if (request.getAddress() != null) {
            location.setAddress(request.getAddress());
        }
        if (request.getLongitude() != null) {
            location.setLongitude(request.getLongitude());
        }
        if (request.getLatitude() != null) {
            location.setLatitude(request.getLatitude());
        }
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultHomeLocation(userId);
            location.setIsDefault(1);
        }

        homeLocationMapper.updateById(location);
        log.info("更新家庭位置成功: userId={}, locationId={}", userId, id);

        return convertHomeLocationToVO(location);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteHomeLocation(Long id) {
        Long userId = UserContextHolder.getUserId();

        // 查询位置是否存在且属于当前用户
        HomeLocation location = homeLocationMapper.selectById(id);
        if (location == null || !location.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "位置不存在");
        }

        homeLocationMapper.deleteById(id);
        log.info("删除家庭位置成功: userId={}, locationId={}", userId, id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefaultHomeLocation(Long id) {
        Long userId = UserContextHolder.getUserId();

        // 查询位置是否存在且属于当前用户
        HomeLocation location = homeLocationMapper.selectById(id);
        if (location == null || !location.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "位置不存在");
        }

        // 先取消其他默认位置
        clearDefaultHomeLocation(userId);

        // 设置当前为默认
        location.setIsDefault(1);
        homeLocationMapper.updateById(location);
        log.info("设置默认家庭位置成功: userId={}, locationId={}", userId, id);
    }

    /**
     * 取消用户的所有默认家庭位置
     */
    private void clearDefaultHomeLocation(Long userId) {
        LambdaUpdateWrapper<HomeLocation> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(HomeLocation::getUserId, userId)
                    .eq(HomeLocation::getIsDefault, 1)
                    .set(HomeLocation::getIsDefault, 0);
        homeLocationMapper.update(null, updateWrapper);
    }

    // ==================== 车辆绑定相关 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void bindVehicle(Long vehicleId) {
        Long userId = UserContextHolder.getUserId();

        // 检查是否已绑定
        LambdaQueryWrapper<UserVehicle> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserVehicle::getUserId, userId)
                   .eq(UserVehicle::getVehicleId, vehicleId);
        if (userVehicleMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException(ErrorCode.VEHICLE_BOUND);
        }

        // 创建绑定关系
        UserVehicle userVehicle = new UserVehicle();
        userVehicle.setUserId(userId);
        userVehicle.setVehicleId(vehicleId);
        userVehicle.setBindTime(LocalDateTime.now());
        userVehicle.setIsDefault(0);

        userVehicleMapper.insert(userVehicle);
        log.info("绑定车辆成功: userId={}, vehicleId={}", userId, vehicleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unbindVehicle(Long vehicleId) {
        Long userId = UserContextHolder.getUserId();

        // 删除绑定关系
        LambdaQueryWrapper<UserVehicle> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserVehicle::getUserId, userId)
                   .eq(UserVehicle::getVehicleId, vehicleId);
        
        int deleted = userVehicleMapper.delete(queryWrapper);
        if (deleted == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "未绑定该车辆");
        }
        
        log.info("解绑车辆成功: userId={}, vehicleId={}", userId, vehicleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefaultVehicle(Long vehicleId) {
        Long userId = UserContextHolder.getUserId();

        // 检查是否已绑定该车辆
        LambdaQueryWrapper<UserVehicle> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserVehicle::getUserId, userId)
                   .eq(UserVehicle::getVehicleId, vehicleId);
        UserVehicle userVehicle = userVehicleMapper.selectOne(queryWrapper);
        
        if (userVehicle == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "未绑定该车辆");
        }

        // 先取消其他默认车辆
        LambdaUpdateWrapper<UserVehicle> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(UserVehicle::getUserId, userId)
                    .eq(UserVehicle::getIsDefault, 1)
                    .set(UserVehicle::getIsDefault, 0);
        userVehicleMapper.update(null, updateWrapper);

        // 设置当前为默认
        userVehicle.setIsDefault(1);
        userVehicleMapper.updateById(userVehicle);
        log.info("设置默认车辆成功: userId={}, vehicleId={}", userId, vehicleId);
    }

    // ==================== 工具方法 ====================

    /**
     * 将 User 实体转换为 UserVO
     * 
     * BeanUtils.copyProperties：Spring 提供的属性复制工具
     * 会自动将同名属性从源对象复制到目标对象
     */
    private UserVO convertToVO(User user) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        return vo;
    }

    /**
     * 将 HomeLocation 实体转换为 HomeLocationVO
     */
    private HomeLocationVO convertHomeLocationToVO(HomeLocation location) {
        HomeLocationVO vo = new HomeLocationVO();
        BeanUtils.copyProperties(location, vo);
        vo.setIsDefault(location.getIsDefault() == 1);
        return vo;
    }
}