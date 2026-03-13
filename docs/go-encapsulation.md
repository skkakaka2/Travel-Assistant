# Go 封装方式对比

## 1. 结构体方法（当前实现）

```go
type PasswordUtilsType struct{}

var PasswordUtils *PasswordUtilsType

func init() {
    PasswordUtils = &PasswordUtilsType{}
}

func (p *PasswordUtilsType) EncodePassword(password string) string {
    // ...
}
```

**优点:**
- 符合面向对象思想
- 可以维护状态（如果有需要）
- 便于依赖注入和测试

**缺点:**
- 对于纯工具函数略显冗余
- 需要初始化

## 2. 包级函数（Go 推荐风格）

```go
func EncodePassword(password string) string {
    // ...
}

func ComparePassword(hashedPassword, password string) bool {
    // ...
}
```

**优点:**
- 简洁，符合 Go 习惯
- 无需初始化
- 调用简单：`config.EncodePassword("pwd")`

**缺点:**
- 无法维护状态
- 不便于 mock 测试（但可以用接口解决）

## 3. 接口抽象（适合复杂场景）

```go
type PasswordEncoder interface {
    Encode(password string) string
    Compare(hashedPassword, password string) bool
}

type BcryptEncoder struct{}

func (b *BcryptEncoder) Encode(password string) string {
    // ...
}
```

**优点:**
- 易于测试（可以 mock）
- 支持多种实现
- 符合依赖注入原则

**缺点:**
- 代码量稍多
- 对于简单场景过度设计

## 建议

对于密码工具这种**无状态的纯函数**，推荐使用**方式2（包级函数）**，更符合 Go 的简洁哲学。

如果需要支持多种加密算法或便于测试，可以使用**方式3（接口抽象）**。

当前的**方式1（结构体方法）**也可以工作，但对这种场景来说稍显冗余。