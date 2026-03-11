package com.travel.assistant;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 旅行助手应用主入口
 *
 * 注解说明：
 * @SpringBootApplication: Spring Boot 应用核心注解，包含三个注解的组合：
 *   - @SpringBootConfiguration: 表示这是一个配置类
 *   - @EnableAutoConfiguration: 启用自动配置
 *   - @ComponentScan: 自动扫描当前包及子包下的组件
 *
 * @MapperScan: 扫描 MyBatis Mapper 接口，不用在每个 Mapper 上加 @Mapper 注解
 */
@SpringBootApplication
@MapperScan("com.travel.assistant.modules.*.mapper")
public class TravelAssistantApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelAssistantApplication.class, args);
    }
}
