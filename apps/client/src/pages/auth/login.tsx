// ========== 导入需要的工具和组件 ==========

// 导入登录表单组件（真正的输入框、按钮都在这个组件里）
// @/ 是项目里的路径别名，代表 src/ 目录
import { LoginForm } from "@/features/auth/components/login-form";

// Helmet 是一个用来修改网页标题的工具
// 比如你打开网页，浏览器标签页上显示的文字就是它控制的
import { Helmet } from "react-helmet-async";

// 导入获取应用名称的函数（比如叫 "Docmost" 或其他名字）
import { getAppName } from "@/lib/config.ts";

// 导入国际化翻译工具（支持多语言，比如中文、英文切换）
import { useTranslation } from "react-i18next";

// ========== 定义页面组件 ==========

// export default 表示这个组件是这个文件的"主产物"
// 其他文件可以 import 它来使用
// LoginPage 是组件的名字（首字母大写，React 组件的命名规范）
export default function LoginPage() {

  // ========== 准备翻译工具 ==========

  // useTranslation() 是一个"钩子"（React Hook）
  // 调用它可以得到翻译函数 t
  // 比如 t("Login") 会根据当前语言返回"登录"或"Login"
  const { t } = useTranslation();

  // ========== 返回页面内容（渲染界面） ==========

  // return 后面的就是这个页面要显示的内容
  // 看起来像 HTML，但其实是 JSX（React 的语法）
  return (
    // <> 是 React 的"空标签"，用来包裹多个元素，不产生实际的 DOM 节点
    <>
      {/* Helmet 部分：设置浏览器标签页的标题 */}
      {/* 最终标题会是 "Login - 应用名" 或 "登录 - 应用名" */}
      <Helmet>
        <title>
          {/* t("Login") 翻译"登录"这个词 */}
          {/* getAppName() 获取应用的名字 */}
          {/* 中间的 - 是连接符 */}
          {t("Login")} - {getAppName()}
        </title>
      </Helmet>

      {/* 真正的登录表单组件 */}
      {/* 里面包含邮箱输入框、密码输入框、登录按钮等 */}
      {/* 这个页面本身只是个"壳"，具体表单逻辑在 LoginForm 组件里 */}
      <LoginForm />
    </>
  );
}