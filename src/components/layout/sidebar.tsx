"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Workflow,
  BookOpen,
  FolderOpen,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Brain,
  Code,
  PenTool,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  getCurrentTeam,
  getTeamMemberByName,
  getTriHandRoleLabel,
} from "@/lib/teams-storage";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "个人主页", href: "/dashboard", icon: LayoutDashboard },
  { label: "系统概览", href: "/", icon: Home },
  { label: "团队组建", href: "/team", icon: Users },
  { label: "新手引导", href: "/guide", icon: Workflow },
  {
    label: "协作工作流",
    href: "/workflow",
    icon: Workflow,
    children: [
      { label: "建模手工作台", href: "/modeler", icon: Brain },
      { label: "编程手工作台", href: "/programmer", icon: Code },
      { label: "论文手工作台", href: "/writer", icon: PenTool },
    ],
  },
  { label: "知识库", href: "/knowledge", icon: BookOpen },
  { label: "工作空间", href: "/workspace", icon: FolderOpen },
  { label: "MMP文件", href: "/mmp", icon: FileText },
  { label: "能力Card", href: "/card", icon: Award },
];

function NavItemComponent({ item, isActive, isCollapsed }: { item: NavItem; isActive: boolean; isCollapsed: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
        isCollapsed && "justify-center px-2",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-foreground"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg transition-all duration-200",
          isCollapsed ? "size-9" : "size-8",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-white/10 text-sidebar-foreground/72 group-hover:bg-white/15 group-hover:text-sidebar-foreground"
        )}
      >
        <Icon className="size-4" />
      </div>
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {!isCollapsed && isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function NavGroup({
  item,
  pathname,
  isCollapsed,
}: {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;
  const childActive = item.children?.some((c) => pathname === c.href) ?? false;
  const selfActive = pathname === item.href;
  const anyActive = childActive || selfActive;
  const [open, setOpen] = useState(anyActive);
  const isOpen = open || anyActive;

  if (isCollapsed) {
    // 折叠态：把父项做为 hub 链接显示
    return (
      <NavItemComponent
        item={item}
        isActive={anyActive}
        isCollapsed
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={isOpen}
        className={cn(
          "group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
          anyActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-foreground"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-lg size-8 transition-all",
            anyActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-white/10 text-sidebar-foreground/72 group-hover:bg-white/15 group-hover:text-sidebar-foreground"
          )}
        >
          <Icon className="size-4" />
        </div>
        <span className="truncate flex-1">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-current/70 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 space-y-1 border-l border-white/15 pl-3">
          <Link
            href={item.href}
            className={cn(
              "flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
              selfActive
                ? "bg-white/15 text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/65 hover:bg-white/10 hover:text-sidebar-foreground"
            )}
          >
            <div className="size-1.5 rounded-full bg-current opacity-50" />
            工作流总览
          </Link>
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const active = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
                  active
                    ? "bg-white/15 text-sidebar-foreground font-medium"
                    : "text-sidebar-foreground/65 hover:bg-white/10 hover:text-sidebar-foreground"
                )}
              >
                <ChildIcon className="size-3.5" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [teamVersion, setTeamVersion] = useState(0);

  const displayName = user?.displayName || "队员";
  const initials = displayName.slice(0, 1).toUpperCase();
  const roleLabel = useMemo(() => {
    const currentTeam = getCurrentTeam();
    const currentMember = getTeamMemberByName(currentTeam, displayName);
    return getTriHandRoleLabel(currentMember?.role);
  }, [displayName, pathname, teamVersion]);

  useEffect(() => {
    const handleTeamChange = () => setTeamVersion((version) => version + 1);
    window.addEventListener("cmam-current-team-change", handleTeamChange);
    return () => window.removeEventListener("cmam-current-team-change", handleTeamChange);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Logo区域 */}
      <Link href="/" className={cn(
        "flex min-h-[76px] cursor-pointer items-center border-b border-white/15 px-4 py-4 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
        isCollapsed ? "justify-center px-2" : "gap-3"
      )}>
        {isCollapsed ? (
          <Image
            src="/logo.svg"
            alt="CMAMSys"
            width={36}
            height={40}
            className="brightness-0 invert transition-transform hover:scale-105"
            priority
          />
        ) : (
          <Image
            src="/logo-withtext.svg"
            alt="CMAMSys - 数学建模协作系统"
            width={140}
            height={62}
            className="brightness-0 invert transition-transform hover:scale-[1.02]"
            priority
          />
        )}
      </Link>

      {/* 导航区域 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="主导航">
        <div className="space-y-1">
          {navItems.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <NavGroup
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                />
              );
            }
            return (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </div>
      </nav>

      {/* 折叠按钮 */}
      <div className="hidden border-t border-white/15 px-3 py-3 lg:flex">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={isCollapsed ? "展开侧栏" : "收起侧栏"}
          className="w-full justify-center text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4 mr-2" />
              <span className="text-xs">收起侧栏</span>
            </>
          )}
        </Button>
      </div>

      {/* 用户信息 */}
      <div className={cn(
        "border-t border-white/15 px-3 py-4",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3 rounded-xl bg-white/10 p-2.5 ring-1 ring-white/10",
          isCollapsed && "p-2"
        )}>
          <Avatar size={isCollapsed ? "default" : "lg"}>
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
                <span className="text-[11px] text-sidebar-foreground/62 truncate">
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={logout}
                title="退出登录"
                aria-label="退出登录"
                className="min-h-9 min-w-9 rounded-lg p-1.5 text-sidebar-foreground/65 transition-colors hover:bg-red-500/15 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50"
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* 桌面端侧边栏 */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-sidebar-border transition-all duration-300 ease-in-out",
          "bg-sidebar text-sidebar-foreground",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      {/* 移动端遮罩 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 移动端侧边栏 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute right-2 top-4 z-10">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMobileOpen(false)}
            aria-label="关闭导航"
            className="text-sidebar-foreground/72 hover:bg-white/10 hover:text-sidebar-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
        <SidebarContent
          isCollapsed={false}
          onToggle={() => setIsMobileOpen(false)}
        />
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0 bg-[var(--dashboard-bg)]">
        {/* 移动端顶部栏 */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-card/90 backdrop-blur-xl px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMobileOpen(true)}
            aria-label="打开导航"
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="CMAMSys"
              width={28}
              height={31}
              priority
            />
            <span className="text-sm font-bold gradient-text">CMAMSys</span>
          </Link>
        </header>

        {/* 页面内容 */}
        <div className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
