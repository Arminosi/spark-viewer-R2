![](https://spark.lucko.me/assets/banner.png)

# spark-viewer

[spark](https://github.com/lucko/spark) is a performance profiling plugin/mod for Minecraft clients, servers, and proxies.

This repository contains the website & viewer for spark, written using [Next.js](https://nextjs.org/)/[React](https://reactjs.org)/[Typescript](https://www.typescriptlang.org/).

The website contains:

-   a brief **homepage**
-   **downloads** page which serves direct links to the latest release
-   **documentation**, although this is managed in a [separate repository](https://github.com/lucko/spark-docs)
-   a **viewer** web-app for spark data, which has modes for:
    -   viewing the output from the spark **profiler**
    -   viewing the output from spark **heap dump** summaries

### Viewer

The viewer component of the website reads data from [bytebin](https://github.com/lucko/bytebin) (content storage service) and [bytesocks](https://github.com/lucko/bytesocks) (WebSocket server). It then renders this data as an interactive viewer in which the user can interpret and analyse their results.

The profile viewer renders the data as an expandable call stack tree, with support for applying deobfuscation mappings, searching, bookmarks and viewing as a flame graph.

The heap dump summary viewer renders a histogram of the classes occupying the most memory at the time when the data was collected.

### Selfhosting

#### Configuring URLs

To configure the URLs used by the application, you have to pass them as environment variables when building the application.
In the special case of using Docker, you have to pass them as build arguments.

For more information, see [`env.ts`](src/env.ts) and the [`Dockerfile`](Dockerfile).

![](https://spark.lucko.me/assets/banner.png)

# spark-viewer

[spark](https://github.com/lucko/spark) is a performance profiling plugin/mod for Minecraft clients, servers, and proxies.

This repository contains the website & viewer for spark, written using [Next.js](https://nextjs.org/)/[React](https://reactjs.org)/[Typescript](https://www.typescriptlang.org/).

The website contains:

-   a brief **homepage**
-   **downloads** page which serves direct links to the latest release
-   **documentation**, although this is managed in a [separate repository](https://github.com/lucko/spark-docs)
-   a **viewer** web-app for spark data, which has modes for:
        -   viewing the output from the spark **profiler**
        -   viewing the output from spark **heap dump** summaries

### Viewer

The viewer component of the website reads data from [bytebin](https://github.com/lucko/bytebin) (content storage service) and [bytesocks](https://github.com/lucko/bytesocks) (WebSocket server). It then renders this data as an interactive viewer in which the user can interpret and analyse their results.

The profile viewer renders the data as an expandable call stack tree, with support for applying deobfuscation mappings, searching, bookmarks and viewing as a flame graph.

The heap dump summary viewer renders a histogram of the classes occupying the most memory at the time when the data was collected.

### Selfhosting

#### Configuring URLs

To configure the URLs used by the application, you have to pass them as environment variables when building the application.
In the special case of using Docker, you have to pass them as build arguments.

For more information, see [`env.ts`](src/env.ts) and the [`Dockerfile`](Dockerfile).

### Contributions

Yes please! - but please open an issue or ping me on [Discord](https://discord.gg/PAGT2fu) (so we can discuss your idea) before working on a big change!

### License

spark is free & open source. It is released under the terms of the GNU GPLv3 license. Please see [`LICENSE.txt`](LICENSE.txt) for more information.

spark is a fork of [WarmRoast](https://github.com/sk89q/WarmRoast), which was also [licensed using the GPLv3](https://github.com/sk89q/WarmRoast/blob/3fe5e5517b1c529d95cf9f43fd8420c66db0092a/src/main/java/com/sk89q/warmroast/WarmRoast.java#L1-L17).

---

## 中文说明（简体中文）

此仓库包含 `spark` 的网站和可视化查看器，使用 Next.js + React + TypeScript 编写。

- 运行 / 开发：

```bash
npm install
npm run dev
```

- 构建生产版本：

```bash
npm run build
```

- 生成 protobuf TypeScript 文件：仓库使用 `protoc` 将 `proto/spark.proto` 编译为 TypeScript，生成的文件默认输出到 `src/viewer/proto/spark_pb.ts`。构建脚本已包含该步骤（`npm run proto`）。

### 修改远程 API 地址

如果你需要修改远程服务（例如 bytebin、bytesocks、API、缩略图服务等）的地址，请编辑 `src/env.ts` 中的环境变量或在构建/运行时通过环境变量覆盖：

- 客户端环境变量（用于浏览器）：
    - `NEXT_PUBLIC_SPARK_BASE_URL`：网站/缩略图基础 URL（用于生成缩略图/OG 标签）
    - `NEXT_PUBLIC_SPARK_BYTEBIN_URL`：bytebin 内容存储服务 URL（用于下载报告）
    - `NEXT_PUBLIC_SPARK_BYTESOCKS_URL`：bytesocks WebSocket 地址（用于实时 sampler）
    - `NEXT_PUBLIC_SPARK_MAPPINGS_URL`：映射服务 URL（可选）
    - `NEXT_PUBLIC_SPARK_API_URL`：主 API 地址（例如用于部分 RPC）
    - `NEXT_PUBLIC_SPARK_MONITOR_URL`：自制远程API地址（使用worker修改这个）

