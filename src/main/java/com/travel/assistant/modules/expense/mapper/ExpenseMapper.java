package com.travel.assistant.modules.expense.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travel.assistant.modules.expense.entity.Expense;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 费用 Mapper 接口
 */
@Mapper
public interface ExpenseMapper extends BaseMapper<Expense> {

    /**
     * 按类型统计费用
     */
    @Select("SELECT type, SUM(amount) as amount FROM t_expense " +
            "WHERE user_id = #{userId} AND deleted = 0 " +
            "GROUP BY type")
    List<Map<String, Object>> sumByType(Long userId);

    /**
     * 统计总费用
     */
    @Select("SELECT SUM(amount) FROM t_expense " +
            "WHERE user_id = #{userId} AND deleted = 0")
    BigDecimal sumTotal(Long userId);

    /**
     * 统计费用笔数
     */
    @Select("SELECT COUNT(*) FROM t_expense " +
            "WHERE user_id = #{userId} AND deleted = 0")
    Integer countByUser(Long userId);
}