package com.travel.assistant.modules.activity.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.travel.assistant.modules.activity.dto.ActivityRequest;
import com.travel.assistant.modules.activity.vo.ActivityVO;

import java.util.List;

/**
 * 活动服务接口
 */
public interface ActivityService {

    /**
     * 创建活动
     */
    ActivityVO createActivity(ActivityRequest request);

    /**
     * 更新活动
     */
    ActivityVO updateActivity(Long id, ActivityRequest request);

    /**
     * 删除活动
     */
    void deleteActivity(Long id);

    /**
     * 获取活动详情
     */
    ActivityVO getActivity(Long id);

    /**
     * 分页获取活动列表
     */
    Page<ActivityVO> getActivityList(Integer page, Integer size, String keyword, Integer status);

    /**
     * 获取我创建的活动
     */
    List<ActivityVO> getMyCreatedActivities();

    /**
     * 获取我参与的活动
     */
    List<ActivityVO> getMyJoinedActivities();

    /**
     * 参加活动
     */
    ActivityVO joinActivity(Long id);

    /**
     * 退出活动
     */
    ActivityVO quitActivity(Long id);

    /**
     * 取消活动
     */
    void cancelActivity(Long id);
}