package com.travel.assistant.common.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus 配置
 * 
 * MyBatis-Plus 是 MyBatis 的增强工具
 * 提供了很多便捷功能，最常用的是分页插件
 */
@Configuration
public class MyBatisPlusConfig {

    /**
     * 配置 MyBatis-Plus 拦截器
     * 
     * 这里主要配置分页插件
     * 使用分页插件后，查询时只需要调用 selectPage 方法
     * MyBatis-Plus 会自动处理分页逻辑
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加分页插件
        // DbType.MYSQL：指定数据库类型为 MySQL
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        
        // 设置单页最大记录数（防止一次查询太多数据）
        paginationInterceptor.setMaxLimit(100L);
        
        // 溢出总页数后是否进行处理
        // true：返回第一页
        // false：继续请求
        paginationInterceptor.setOverflow(false);
        
        interceptor.addInnerInterceptor(paginationInterceptor);
        
        return interceptor;
    }
}