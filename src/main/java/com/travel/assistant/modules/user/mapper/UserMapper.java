package com.travel.assistant.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 Mapper 接口
 * 
 * 继承 MyBatis-Plus 的 BaseMapper
 * 自动拥有常用的 CRUD 方法，不需要写 SQL
 * 
 * 常用方法：
 * - insert(entity)：插入
 * - updateById(entity)：根据ID更新
 * - deleteById(id)：根据ID删除
 * - selectById(id)：根据ID查询
 * - selectList(wrapper)：条件查询列表
 * - selectPage(page, wrapper)：分页查询
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    // 如果有复杂查询，可以在这里定义方法，然后在 XML 中写 SQL
    // 例如：
    // @Select("SELECT * FROM t_user WHERE phone = #{phone}")
    // User selectByPhone(@Param("phone") String phone);
}