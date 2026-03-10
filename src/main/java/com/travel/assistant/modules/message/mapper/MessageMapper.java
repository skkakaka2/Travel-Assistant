package com.travel.assistant.modules.message.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.message.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 站内信 Mapper 接口
 */
@Mapper
public interface MessageMapper extends BaseMapper<Message> {

    /**
     * 统计未读消息数量
     */
    @Select("SELECT COUNT(*) FROM t_message WHERE user_id = #{userId} AND is_read = 0 AND deleted = 0")
    Integer countUnread(Long userId);

    /**
     * 标记所有消息为已读
     */
    @Update("UPDATE t_message SET is_read = 1 WHERE user_id = #{userId} AND is_read = 0 AND deleted = 0")
    int markAllAsRead(Long userId);
}