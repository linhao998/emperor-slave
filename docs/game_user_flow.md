```mermaid
flowchart LR
    A([进入])
    B[首页]
    C[开始游戏]
    D[对局流程]
    E[结算]
    F{是否再来一局？}

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    F -- 是 --> C
    F -- 否 --> B
```