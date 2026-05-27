"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Brain, Code, PenTool, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth, UserRole } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const roleOptions: {
  value: UserRole;
  label: string;
  desc: string;
  icon: React.ElementType;
  tone: string;
}[] = [
  {
    value: "modeler",
    label: "建模手",
    desc: "题意解析",
    icon: Brain,
    tone: "bg-chart-1/10 text-chart-1",
  },
  {
    value: "coder",
    label: "编程手",
    desc: "模型实现",
    icon: Code,
    tone: "bg-chart-2/10 text-chart-2",
  },
  {
    value: "writer",
    label: "论文手",
    desc: "成果表达",
    icon: PenTool,
    tone: "bg-chart-4/10 text-chart-4",
  },
  {
    value: "undecided",
    label: "暂未确定",
    desc: "稍后分工",
    icon: HelpCircle,
    tone: "bg-muted text-muted-foreground",
  },
];

const formInputClass =
  "h-11 rounded-xl border-border/70 bg-background/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25";
const errorTextClass = "mt-1.5 text-xs font-medium text-destructive";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 登录表单
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // 注册表单
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
    role: "undecided" as UserRole,
  });

  // 表单错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!loginForm.username.trim()) {
      newErrors.username = "请输入用户名";
    }
    if (!loginForm.password.trim()) {
      newErrors.password = "请输入密码";
    } else if (loginForm.password.length < 6) {
      newErrors.password = "密码长度至少6位";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!registerForm.username.trim()) {
      newErrors.username = "请输入用户名";
    }
    if (!registerForm.email.trim()) {
      newErrors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }
    if (!registerForm.displayName.trim()) {
      newErrors.displayName = "请输入显示名称";
    }
    if (!registerForm.password.trim()) {
      newErrors.password = "请输入密码";
    } else if (registerForm.password.length < 6) {
      newErrors.password = "密码长度至少6位";
    }
    if (!registerForm.confirmPassword.trim()) {
      newErrors.confirmPassword = "请确认密码";
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "两次密码输入不一致";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await login(loginForm.username, loginForm.password);
    setIsLoading(false);

    if (success) {
      showToast("登录成功，欢迎回来！", "success");
      router.push("/dashboard");
    } else {
      showToast("登录失败，请检查用户名和密码", "warning");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await register(
      registerForm.username,
      registerForm.email,
      registerForm.password,
      registerForm.displayName,
      registerForm.role
    );
    setIsLoading(false);

    if (success) {
      showToast("注册成功，欢迎加入 CMAMSys！", "success");
      router.push("/dashboard");
    } else {
      showToast("注册失败，请稍后重试", "warning");
    }
  };

  const handleForgotPassword = () => {
    showToast("密码重置邮件已发送", "info");
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden gradient-bg-mesh px-4 py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-chart-5/10 blur-3xl animate-float" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      </div>

      <section className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="absolute inset-x-8 top-32 -z-10 h-56 rounded-[2rem] bg-primary/10 blur-2xl" />
        <div className="absolute inset-x-2 top-20 -z-20 h-72 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-card/20 to-chart-2/10 blur-3xl" />

        <div className="mb-5 text-center">
          <Image
            src="/logo-withtext.svg"
            alt="CMAMSys"
            width={168}
            height={76}
            className="mx-auto mb-3"
            priority
          />
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="size-3.5" />
            AI 驱动的数学建模协作入口
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {activeTab === "login" ? "欢迎回来" : "加入 CMAMSys"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            围绕建模、编程、论文三手分工，统一管理团队协作与 MMP 复盘。
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {roleOptions.slice(0, 3).map((role) => {
            const Icon = role.icon;
            return (
              <span
                key={role.value}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-card/55 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                <Icon className="size-3.5 text-primary" />
                {role.label}
              </span>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/50 bg-card/75 shadow-[0_18px_56px_rgba(49,46,129,0.10)] ring-1 ring-white/40 backdrop-blur-2xl">
          <div className="px-5 py-5 sm:px-6">
            <div className="mb-5 grid rounded-2xl bg-muted/60 p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  aria-pressed={activeTab === "login"}
                  onClick={() => {
                    setActiveTab("login");
                    setErrors({});
                  }}
                  className={cn(
                    "min-h-10 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    activeTab === "login"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )}
                >
                  登录
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === "register"}
                  onClick={() => {
                    setActiveTab("register");
                    setErrors({});
                  }}
                  className={cn(
                    "min-h-10 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    activeTab === "register"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )}
                >
                  注册
                </button>
              </div>
            </div>

            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    用户名
                  </label>
                  <Input
                    placeholder="请输入用户名"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    className={formInputClass}
                  />
                  {errors.username && (
                    <p className={errorTextClass}>{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    密码
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className={cn(formInputClass, "pr-11")}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className={errorTextClass}>{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border text-primary accent-primary focus:ring-primary/30"
                    />
                    记住我
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="min-h-10 rounded-lg px-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  >
                    忘记密码？
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-bg h-11 w-full rounded-xl text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      用户名
                    </label>
                    <Input
                      placeholder="请输入用户名"
                      value={registerForm.username}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, username: e.target.value })
                      }
                      className={formInputClass}
                    />
                    {errors.username && (
                      <p className={errorTextClass}>{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      显示名称
                    </label>
                    <Input
                      placeholder="请输入显示名称"
                      value={registerForm.displayName}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          displayName: e.target.value,
                        })
                      }
                      className={formInputClass}
                    />
                    {errors.displayName && (
                      <p className={errorTextClass}>{errors.displayName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    邮箱
                  </label>
                  <Input
                    type="email"
                    placeholder="请输入邮箱"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    className={formInputClass}
                  />
                  {errors.email && (
                    <p className={errorTextClass}>{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    选择你的角色
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      const active = registerForm.role === role.value;
                      return (
                        <button
                          type="button"
                          key={role.value}
                          aria-pressed={active}
                          onClick={() =>
                            setRegisterForm({ ...registerForm, role: role.value })
                          }
                          className={cn(
                            "min-h-16 rounded-2xl border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            active
                              ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                              : "border-border/70 bg-background/65 text-foreground hover:border-primary/25 hover:bg-primary/5"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-full",
                                active ? "bg-primary text-primary-foreground" : role.tone
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">
                                {role.label}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {role.desc}
                              </span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      密码
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="至少6位"
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          })
                        }
                        className={cn(formInputClass, "pr-11")}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "隐藏密码" : "显示密码"}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className={errorTextClass}>{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      确认密码
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="请再次输入"
                        value={registerForm.confirmPassword}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={cn(formInputClass, "pr-11")}
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className={errorTextClass}>{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-bg h-11 w-full rounded-xl text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    "注册"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          CMAMSys · AI 驱动的数学建模全流程协作工具
        </p>
      </section>
    </main>
  );
}
