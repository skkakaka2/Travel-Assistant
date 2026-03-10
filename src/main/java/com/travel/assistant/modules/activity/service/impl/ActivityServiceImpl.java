package com.travel.assistant.modules.activity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.utils.UserContextHolder;
import com.travel.assistant.modules.activity.dto.ActivityRequest;
import com.travel.assistant.modules.activity.entity.Activity;
import com.travel.assistant.modules.activity.entity.ActivityParticipant;
import com.travel.assistant.modules.activity.mapper.ActivityMapper;
import com.travel.assistant.modules.activity.mapper.ActivityParticipantMapper;
import com.travel.assistant.modules.activity.service.ActivityService;
import com.travel.assistant.modules.activity.vo.ActivityVO;
import com.travel.assistant.modules.user.entity.User;
import com.travel.assistant.modules.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 活动服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityMapper activityMapper;
    private final ActivityParticipantMapper participantMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ActivityVO createActivity(ActivityRequest request) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = new Activity();
        BeanUtils.copyProperties(request, activity);
        activity.setCreatorId(userId);
        activity.setStatus(1);
        activity.setCurrentParticipants(0);

        activityMapper.insert(activity);
        log.info("创建活动成功: activityId={}, creatorId={}", activity.getId(), userId);

        return convertToVO(activity, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ActivityVO updateActivity(Long id, ActivityRequest request) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = activityMapper.selectById(id);
        if (activity == null) {
            throw new BusinessException(ErrorCode.ACTIVITY_NOT_FOUND);
        }
        if (!activity.getCreatorId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "只能修改自己创建的活动");
        }

        BeanUtils.copyProperties(request, activity);
        activityMapper.updateById(activity);
        log.info("更新活动成功: activityId={}", id);

        return convertToVO(activity, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteActivity(Long id) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = activityMapper.selectById(id);
        if (activity == null) {
            throw new BusinessException(ErrorCode.ACTIVITY_NOT_FOUND);
        }
        if (!activity.getCreatorId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "只能删除自己创建的活动");
        }

        activityMapper.deleteById(id);
        log.info("删除活动成功: activityId={}", id);
    }

    @Override
    public ActivityVO getActivity(Long id) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = activityMapper.selectById(id);
        if (activity == null) {
            throw new BusinessException(ErrorCode.ACTIVITY_NOT_FOUND);
        }

        return convertToVO(activity, userId);
    }

    @Override
    public Page<ActivityVO> getActivityList(Integer page, Integer size, String keyword, Integer status) {
        Long userId = UserContextHolder.getUserId();

        Page<Activity> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Activity> queryWrapper = new LambdaQueryWrapper<>();
        
        if (keyword != null && !keyword.isEmpty()) {
            queryWrapper.like(Activity::getTitle, keyword)
                       .or()
                       .like(Activity::getLocation, keyword);
        }
        if (status != null) {
            queryWrapper.eq(Activity::getStatus, status);
        }
        queryWrapper.orderByDesc(Activity::getCreatedAt);

        Page<Activity> activityPage = activityMapper.selectPage(pageParam, queryWrapper);

        Page<ActivityVO> voPage = new Page<>(activityPage.getCurrent(), activityPage.getSize(), activityPage.getTotal());
        List<ActivityVO> voList = activityPage.getRecords().stream()
                .map(a -> convertToVO(a, userId))
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public List<ActivityVO> getMyCreatedActivities() {
        Long userId = UserContextHolder.getUserId();

        LambdaQueryWrapper<Activity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Activity::getCreatorId, userId)
                   .orderByDesc(Activity::getCreatedAt);

        List<Activity> activities = activityMapper.selectList(queryWrapper);
        return activities.stream()
                .map(a -> convertToVO(a, userId))
                .collect(Collectors.toList());
    }

    @Override
    public List<ActivityVO> getMyJoinedActivities() {
        Long userId = UserContextHolder.getUserId();

        // 查询参与的活动
        LambdaQueryWrapper<ActivityParticipant> pQuery = new LambdaQueryWrapper<>();
        pQuery.eq(ActivityParticipant::getUserId, userId)
              .eq(ActivityParticipant::getStatus, 1);
        List<ActivityParticipant> participants = participantMapper.selectList(pQuery);

        return participants.stream()
                .map(p -> {
                    Activity activity = activityMapper.selectById(p.getActivityId());
                    if (activity != null) {
                        return convertToVO(activity, userId);
                    }
                    return null;
                })
                .filter(vo -> vo != null)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ActivityVO joinActivity(Long id) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = activityMapper.selectById(id);
        if (activity == null) {
            throw new BusinessException(ErrorCode.ACTIVITY_NOT_FOUND);
        }
        if (activity.getStatus() != 1) {
            throw new BusinessException(ErrorCode.ACTIVITY_ENDED, "活动已结束或已取消");
        }

        // 检查是否已参加
        LambdaQueryWrapper<ActivityParticipant> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ActivityParticipant::getActivityId, id)
                   .eq(ActivityParticipant::getUserId, userId);
        ActivityParticipant exist = participantMapper.selectOne(queryWrapper);
        if (exist != null && exist.getStatus() == 1) {
            throw new BusinessException(ErrorCode.ALREADY_JOINED);
        }

        // 检查人数限制
        if (activity.getMaxParticipants() != null && 
            activity.getCurrentParticipants() >= activity.getMaxParticipants()) {
            throw new BusinessException(ErrorCode.ACTIVITY_FULL);
        }

        // 创建或更新参与记录
        if (exist != null) {
            exist.setStatus(1);
            exist.setJoinTime(LocalDateTime.now());
            participantMapper.updateById(exist);
        } else {
            ActivityParticipant participant = new ActivityParticipant();
            participant.setActivityId(id);
            participant.setUserId(userId);
            participant.setJoinTime(LocalDateTime.now());
            participant.setStatus(1);
            participantMapper.insert(participant);
        }

        // 更新参与人数
        activity.setCurrentParticipants(activity.getCurrentParticipants() + 1);
        activityMapper.updateById(activity);

        log.info("参加活动成功: activityId={}, userId={}", id, userId);
        return convertToVO(activity, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ActivityVO quitActivity(Long id) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = activityMapper.selectById(id);
        if (activity == null) {
            throw new BusinessException(ErrorCode.ACTIVITY_NOT_FOUND);
        }

        // 查找参与记录
        LambdaQueryWrapper<ActivityParticipant> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ActivityParticipant::getActivityId, id)
                   .eq(ActivityParticipant::getUserId, userId)
                   .eq(ActivityParticipant::getStatus, 1);
        ActivityParticipant participant = participantMapper.selectOne(queryWrapper);
        
        if (participant == null) {
            throw new BusinessException(ErrorCode.NOT_JOINED);
        }

        // 更新状态为退出
        participant.setStatus(0);
        participantMapper.updateById(participant);

        // 更新参与人数
        if (activity.getCurrentParticipants() > 0) {
            activity.setCurrentParticipants(activity.getCurrentParticipants() - 1);
            activityMapper.updateById(activity);
        }

        log.info("退出活动成功: activityId={}, userId={}", id, userId);
        return convertToVO(activity, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelActivity(Long id) {
        Long userId = UserContextHolder.getUserId();

        Activity activity = activityMapper.selectById(id);
        if (activity == null) {
            throw new BusinessException(ErrorCode.ACTIVITY_NOT_FOUND);
        }
        if (!activity.getCreatorId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "只能取消自己创建的活动");
        }

        activity.setStatus(0);
        activityMapper.updateById(activity);

        log.info("取消活动成功: activityId={}", id);
    }

    private ActivityVO convertToVO(Activity activity, Long currentUserId) {
        ActivityVO vo = new ActivityVO();
        BeanUtils.copyProperties(activity, vo);

        // 获取创建者信息
        User creator = userMapper.selectById(activity.getCreatorId());
        if (creator != null) {
            vo.setCreatorNickname(creator.getNickname());
        }

        // 状态描述
        vo.setStatusDesc(getStatusDesc(activity.getStatus()));

        // 检查当前用户是否已参加
        if (currentUserId != null) {
            LambdaQueryWrapper<ActivityParticipant> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(ActivityParticipant::getActivityId, activity.getId())
                       .eq(ActivityParticipant::getUserId, currentUserId)
                       .eq(ActivityParticipant::getStatus, 1);
            vo.setJoined(participantMapper.selectCount(queryWrapper) > 0);
        }

        return vo;
    }

    private String getStatusDesc(Integer status) {
        switch (status) {
            case 0: return "已取消";
            case 1: return "进行中";
            case 2: return "已结束";
            default: return "未知";
        }
    }
}