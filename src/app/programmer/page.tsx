"use client"

import { useState, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import {
  Code, Play, Bug, Bot, ChevronRight, Send,
  FolderOpen, FileCode, FileText, Terminal,
  ChevronDown, ChevronRight as ChevronRightIcon,
  Save, Square, X, Brain, PenTool, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { logMMP } from "@/lib/mmp-logger"

/* ============================================================
   Monaco Editor - 动态导入避免 SSR 问题
   ============================================================ */
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-950 text-gray-400 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        加载编辑器...
      </div>
    </div>
  ),
})

/* ============================================================
   文件树数据
   ============================================================ */
interface FileNode {
  name: string
  type: "folder" | "file"
  children?: FileNode[]
  content?: string
  language?: string
}

const fileTree: FileNode[] = [
  {
    name: "project",
    type: "folder",
    children: [
      { name: "main.py", type: "file", language: "python", content: mainPyContent() },
      { name: "seir_model.py", type: "file", language: "python", content: seirModelContent() },
      { name: "data_processor.py", type: "file", language: "python", content: dataProcessorContent() },
      { name: "visualization.py", type: "file", language: "python", content: visualizationContent() },
      { name: "utils.py", type: "file", language: "python", content: utilsContent() },
      { name: "requirements.txt", type: "file", language: "plaintext", content: requirementsContent() },
    ],
  },
]

function mainPyContent() { return `"""
SEIR-CA 混合传染病传播模型 - 主程序入口
建模手: 张三 | 编程手: 李四 | 竞赛: 2024MCM-C
"""

import numpy as np
import pandas as pd
import json
import os
from datetime import datetime

from seir_model import SEIRCA
from data_processor import load_fisheries_data, preprocess_data
from visualization import plot_seir_curves, plot_spatial_heatmap, plot_parameter_sensitivity
from utils import save_results, setup_logging, Timer

def main():
    """主程序入口"""
    logger = setup_logging()
    timer = Timer()

    # 1. 加载参数配置
    logger.info("Loading SEIR model parameters...")
    with open("data/parameters.json", "r") as f:
        params = json.load(f)

    # 2. 加载并预处理数据
    logger.info("Processing fisheries data (2020-2024)")
    raw_data = load_fisheries_data("data/fisheries_2020_2024.csv")
    processed_data = preprocess_data(raw_data)

    # 3. 初始化模型
    N = params.get("population", 10000)
    beta = params.get("beta", 0.3)
    sigma = params.get("sigma", 0.2)
    gamma = params.get("gamma", 0.1)
    grid_size = params.get("grid_size", 50)

    model = SEIRCA(
        N=N, beta=beta, sigma=sigma, gamma=gamma,
        grid_size=grid_size, coupling_strength=params.get("coupling", 0.1)
    )

    # 4. 运行模拟
    logger.info("Running SEIR-CA simulation...")
    days = params.get("simulation_days", 365)
    t, result = model.simulate(days=days)
    S, E, I, R = result

    # 5. 参数拟合与评估
    logger.info("Fitting model parameters...")
    fitted_params = model.fit_parameters(processed_data)
    r_squared = model.evaluate_fit(processed_data)
    logger.info(f"Model converged. R²={r_squared:.4f}")

    # 6. 生成可视化
    logger.info("Generating visualization...")
    os.makedirs("output", exist_ok=True)
    plot_seir_curves(t, S, E, I, R, save_path="output/seir_curves.png")
    plot_spatial_heatmap(model.grid_state, save_path="output/spatial_heatmap.png")
    plot_parameter_sensitivity(model, save_path="output/sensitivity.png")

    # 7. 保存结果
    results_df = pd.DataFrame({
        "Time": t, "Susceptible": S, "Exposed": E,
        "Infected": I, "Recovered": R
    })
    save_results(results_df, "output/results.csv")
    save_results(fitted_params, "output/fitted_params.json")

    elapsed = timer.elapsed()
    logger.info(f"All done! Results saved to ./output/ (elapsed: {elapsed:.1f}s)")

if __name__ == "__main__":
    main()
` }

function seirModelContent() { return `"""
SEIR-CA 混合传染病传播模型核心模块
结合 SEIR 微分方程与元胞自动机空间扩散
"""

import numpy as np
from scipy.integrate import odeint
from scipy.optimize import minimize
from typing import Tuple, Dict, Optional


class SEIRCA:
    """SEIR-CA 混合模型核心类"""

    def __init__(
        self,
        N: int = 10000,
        beta: float = 0.3,
        sigma: float = 0.2,
        gamma: float = 0.1,
        grid_size: int = 50,
        coupling_strength: float = 0.1,
    ):
        self.N = N
        self.beta = beta
        self.sigma = sigma
        self.gamma = gamma
        self.grid_size = grid_size
        self.coupling_strength = coupling_strength
        self.grid_state = np.random.rand(grid_size, grid_size) * N / (grid_size ** 2)
        self.R0 = beta / gamma  # 基本再生数

    def seir_equations(self, y: np.ndarray, t: np.ndarray) -> list:
        """
        SEIR 微分方程组
        dS/dt = -βSI/N
        dE/dt = βSI/N - σE
        dI/dt = σE - γI
        dR/dt = γI
        """
        S, E, I, R = y
        N = self.N
        dS = -self.beta * S * I / N
        dE = self.beta * S * I / N - self.sigma * E
        dI = self.sigma * E - self.gamma * I
        dR = self.gamma * I
        return [dS, dE, dI, dR]

    def _get_moore_neighbors(self, i: int, j: int) -> np.ndarray:
        """获取 Moore 邻域 (8个相邻元胞)"""
        neighbors = []
        for di in [-1, 0, 1]:
            for dj in [-1, 0, 1]:
                if di == 0 and dj == 0:
                    continue
                ni, nj = (i + di) % self.grid_size, (j + dj) % self.grid_size
                neighbors.append(self.grid_state[ni, nj])
        return np.array(neighbors)

    def ca_step(self) -> np.ndarray:
        """
        元胞自动机空间传播步骤
        使用 Moore 邻域进行空间耦合
        """
        new_state = np.copy(self.grid_state)
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                neighbors = self._get_moore_neighbors(i, j)
                coupling = np.mean(neighbors) * self.coupling_strength
                new_state[i, j] = self.grid_state[i, j] + coupling * 0.1
                new_state[i, j] = max(0, new_state[i, j])
        return new_state

    def simulate(self, days: int = 365) -> Tuple[np.ndarray, Tuple]:
        """
        主模拟循环: SEIR ODE + CA 空间迭代
        """
        t = np.linspace(0, days, days)
        S0, E0, I0, R0 = self.N - 1, 0, 1, 0
        result = odeint(self.seir_equations, [S0, E0, I0, R0], t)

        # CA 空间迭代 (每10个时间步更新一次)
        for step in range(0, days, 10):
            self.grid_state = self.ca_step()

        return t, (result[:, 0], result[:, 1], result[:, 2], result[:, 3])

    def fit_parameters(self, observed_data: pd.DataFrame) -> Dict:
        """使用 scipy.optimize 进行参数拟合"""
        def loss(params):
            self.beta, self.sigma, self.gamma = params
            _, result = self.simulate(days=len(observed_data))
            predicted = result[2]  # Infected
            actual = observed_data["infected"].values
            return np.mean((predicted - actual) ** 2)

        x0 = [self.beta, self.sigma, self.gamma]
        bounds = [(0.01, 1.0), (0.01, 1.0), (0.01, 1.0)]
        result = minimize(loss, x0, method="L-BFGS-B", bounds=bounds)

        self.beta, self.sigma, self.gamma = result.x
        return {"beta": self.beta, "sigma": self.sigma, "gamma": self.gamma}

    def evaluate_fit(self, observed_data: pd.DataFrame) -> float:
        """计算 R² 拟合优度"""
        _, result = self.simulate(days=len(observed_data))
        predicted = result[2]
        actual = observed_data["infected"].values
    ss_res = np.sum((actual - predicted) ** 2)
    ss_tot = np.sum((actual - np.mean(actual)) ** 2)
    return 1 - ss_res / ss_tot
` }

function dataProcessorContent() { return `"""
数据处理模块
负责渔业数据的加载、清洗和预处理
"""

import numpy as np
import pandas as pd
from typing import Optional
from concurrent.futures import ThreadPoolExecutor


def load_fisheries_data(filepath: str) -> pd.DataFrame:
    """
    加载渔业数据 CSV 文件
    支持多格式自动检测 (分隔符、编码)
    """
    try:
        df = pd.read_csv(filepath, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(filepath, encoding="gbk")

    required_columns = ["date", "region", "catch", "temperature", "salinity"]
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    return df


def preprocess_data(
    df: pd.DataFrame,
    fill_method: str = "interpolate",
    normalize: bool = True,
) -> pd.DataFrame:
    """
    数据预处理流水线:
    1. 缺失值处理
    2. 异常值检测与修正
    3. 数据标准化
    4. 特征工程
    """
    df = df.copy()

    # 1. 缺失值处理 (可并行化)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if fill_method == "interpolate":
        df[numeric_cols] = df[numeric_cols].interpolate(method="linear")
        df[numeric_cols] = df[numeric_cols].fillna(method="bfill")
    elif fill_method == "mean":
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    # 2. 异常值检测 (IQR 方法)
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        df[col] = df[col].clip(lower, upper)

    # 3. 数据标准化
    if normalize:
        for col in numeric_cols:
            mean = df[col].mean()
            std = df[col].std()
            if std > 0:
                df[f"{col}_normalized"] = (df[col] - mean) / std

    # 4. 特征工程
    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["season"] = df["month"] % 12 // 3 + 1

    return df


def parallel_preprocess(
    dataframes: list[pd.DataFrame],
    max_workers: int = 4,
) -> list[pd.DataFrame]:
    """并行数据预处理"""
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(preprocess_data, dataframes))
    return results


def compute_statistics(df: pd.DataFrame) -> dict:
    """计算描述性统计"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    stats = {}
    for col in numeric_cols:
        stats[col] = {
            "mean": float(df[col].mean()),
            "std": float(df[col].std()),
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "median": float(df[col].median()),
        }
    return stats
` }

function visualizationContent() { return `"""
可视化模块
生成 SEIR 模型相关的各类图表
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")  # 非交互式后端

# 设置中文字体
plt.rcParams["font.sans-serif"] = ["SimHei", "Arial Unicode MS"]
plt.rcParams["axes.unicode_minus"] = False


def plot_seir_curves(
    t: np.ndarray,
    S: np.ndarray, E: np.ndarray,
    I: np.ndarray, R: np.ndarray,
    save_path: str = "output/seir_curves.png",
):
    """绘制 SEIR 传播曲线图"""
    fig, ax = plt.subplots(figsize=(12, 6))

    ax.plot(t, S, label="Susceptible (S)", color="#06b6d4", linewidth=2)
    ax.plot(t, E, label="Exposed (E)", color="#f59e0b", linewidth=2)
    ax.plot(t, I, label="Infected (I)", color="#ef4444", linewidth=2)
    ax.plot(t, R, label="Recovered (R)", color="#22c55e", linewidth=2)

    ax.set_xlabel("Time (days)", fontsize=12)
    ax.set_ylabel("Population", fontsize=12)
    ax.set_title("SEIR Epidemic Dynamics", fontsize=14, fontweight="bold")
    ax.legend(loc="right", fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_xlim(0, max(t))

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()


def plot_spatial_heatmap(
    grid_state: np.ndarray,
    save_path: str = "output/spatial_heatmap.png",
):
    """绘制空间分布热力图"""
    fig, ax = plt.subplots(figsize=(8, 8))

    im = ax.imshow(grid_state, cmap="YlOrRd", interpolation="bilinear")
    ax.set_title("Spatial Distribution (CA Grid)", fontsize=14, fontweight="bold")
    ax.set_xlabel("Grid X")
    ax.set_ylabel("Grid Y")

    cbar = plt.colorbar(im, ax=ax, shrink=0.8)
    cbar.set_label("Infection Density")

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()


def plot_parameter_sensitivity(
    model,
    save_path: str = "output/sensitivity.png",
):
    """绘制参数敏感性分析图"""
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))

    params = ["beta", "sigma", "gamma"]
    ranges = [np.linspace(0.1, 0.8, 20),
              np.linspace(0.05, 0.5, 20),
              np.linspace(0.05, 0.5, 20)]

    for ax, param, values in zip(axes, params, ranges):
        peak_infections = []
        original_val = getattr(model, param)

        for v in values:
            setattr(model, param, v)
            _, result = model.simulate(days=200)
            peak_infections.append(max(result[2]))

        setattr(model, param, original_val)
        ax.plot(values, peak_infections, "o-", color="#6366f1", linewidth=2)
        ax.set_xlabel(param, fontsize=12)
        ax.set_ylabel("Peak Infections", fontsize=12)
        ax.set_title(f"Sensitivity: {param}", fontsize=12)
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()
` }

function utilsContent() { return `"""
工具函数模块
提供日志、计时、结果保存等通用功能
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Any


def setup_logging(level=logging.INFO) -> logging.Logger:
    """配置日志系统"""
    logger = logging.getLogger("SEIR-CA")
    logger.setLevel(level)

    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(levelname)s] %(message)s",
        datefmt="%H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


class Timer:
    """简易计时器"""

    def __init__(self):
        self._start = time.time()

    def elapsed(self) -> float:
        """返回已用时间(秒)"""
        return time.time() - self._start

    def reset(self):
        """重置计时器"""
        self._start = time.time()


def save_results(data: Any, filepath: str) -> None:
    """
    保存结果到文件
    根据文件扩展名自动选择格式
    """
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)

    if path.suffix == ".csv":
        import pandas as pd
        if isinstance(data, pd.DataFrame):
            data.to_csv(filepath, index=False)
        else:
            pd.DataFrame(data).to_csv(filepath, index=False)
    elif path.suffix == ".json":
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    else:
        raise ValueError(f"Unsupported file format: {path.suffix}")


def format_number(n: float, decimals: int = 4) -> str:
    """格式化数字"""
    if abs(n) < 0.0001:
        return f"{n:.2e}"
    return f"{n:.{decimals}f}"


def compute_r0(beta: float, gamma: float) -> float:
    """计算基本再生数 R0"""
    if gamma == 0:
        return float("inf")
    return beta / gamma
` }

function requirementsContent() { return `# SEIR-CA Model Dependencies
# Python 3.11+

numpy>=1.24.0
pandas>=2.0.0
scipy>=1.10.0
matplotlib>=3.7.0
seaborn>=0.12.0
jupyter>=1.0.0
` }

/* ============================================================
   AI 聊天消息
   ============================================================ */
interface ChatMessage {
  role: "ai" | "user"
  content: string
}

const initialMessages: ChatMessage[] = [
  { role: "ai", content: "检测到 seir_model.py 中有3处可优化点" },
  { role: "ai", content: "建议使用 scipy.optimize 替代手动参数调整" },
  { role: "ai", content: "data_processor.py 的数据清洗逻辑可以并行化" },
]

/* ============================================================
   终端日志
   ============================================================ */
const terminalLogs = [
  "$ python main.py",
  "[INFO] Loading SEIR model parameters...",
  "[INFO] Processing fisheries data (2020-2024)",
  "[INFO] Running SEIR-CA simulation...",
  "[INFO] Iteration 1/100: Loss=0.3421",
  "[INFO] Iteration 50/100: Loss=0.0156",
  "[INFO] Iteration 100/100: Loss=0.0032",
  "[INFO] Model converged. R²=0.947",
  "[INFO] Generating visualization...",
  "[SUCCESS] All done! Results saved to ./output/",
]

/* ============================================================
   文件树组件
   ============================================================ */
function FileTreeItem({
  node,
  depth,
  activeFile,
  onSelectFile,
  expandedFolders,
  toggleFolder,
}: {
  node: FileNode
  depth: number
  activeFile: string
  onSelectFile: (name: string, content: string, language: string) => void
  expandedFolders: Set<string>
  toggleFolder: (name: string) => void
}) {
  const isExpanded = expandedFolders.has(node.name)
  const isActive = activeFile === node.name

  if (node.type === "folder") {
    return (
      <div>
        <button
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded cursor-pointer transition-colors w-full text-left text-gray-400 font-medium hover:bg-gray-800/70"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => toggleFolder(node.name)}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 shrink-0" />
          ) : (
            <ChevronRightIcon className="w-3 h-3 shrink-0" />
          )}
          <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{node.name}/</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeItem
                key={child.name}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const getFileIcon = (name: string) => {
    if (name.endsWith(".py")) return <FileCode className="w-3.5 h-3.5 text-green-400 shrink-0" />
    if (name.endsWith(".txt")) return <FileText className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
    return <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
  }

  return (
    <button
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs rounded cursor-pointer transition-colors w-full text-left",
        isActive
          ? "bg-cyan-900/30 text-cyan-400"
          : "text-gray-500 hover:bg-gray-800/70 hover:text-gray-300"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => onSelectFile(node.name, node.content || "", node.language || "plaintext")}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  )
}

/* ============================================================
   主页面组件
   ============================================================ */
export default function ProgrammerPage() {
  const { showToast } = useToast()
  const [activeFile, setActiveFile] = useState("main.py")
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "main.py": mainPyContent(),
    "seir_model.py": seirModelContent(),
    "data_processor.py": dataProcessorContent(),
    "visualization.py": visualizationContent(),
    "utils.py": utilsContent(),
    "requirements.txt": requirementsContent(),
  })
  const [fileLanguages, setFileLanguages] = useState<Record<string, string>>({
    "main.py": "python",
    "seir_model.py": "python",
    "data_processor.py": "python",
    "visualization.py": "python",
    "utils.py": "python",
    "requirements.txt": "plaintext",
  })
  const [openTabs, setOpenTabs] = useState(["main.py", "seir_model.py", "data_processor.py"])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["project"]))
  const [isRunning, setIsRunning] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages)
  const [chatInput, setChatInput] = useState("")
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [showTerminal, setShowTerminal] = useState(true)

  const handleSelectFile = useCallback((name: string, content: string, language: string) => {
    setActiveFile(name)
    if (!openTabs.includes(name)) {
      setOpenTabs((prev) => [...prev, name])
    }
  }, [openTabs])

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setFileContents((prev) => ({ ...prev, [activeFile]: value }))
    }
  }, [activeFile])

  const handleCloseTab = useCallback((name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== name)
      if (activeFile === name && next.length > 0) {
        setActiveFile(next[next.length - 1])
      }
      return next
    })
  }, [activeFile])

  const toggleFolder = useCallback((name: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const handleRun = useCallback(() => {
    if (isRunning) {
      setIsRunning(false)
      showToast("运行已停止", "warning")
      logMMP({ role: "coder", action: "run_code", description: "手动中断代码运行" })
      return
    }
    setIsRunning(true)
    logMMP({ role: "coder", action: "run_code", description: "运行代码脚本" })
    setTerminalLines([])
    let idx = 0
    const interval = setInterval(() => {
      if (idx < terminalLogs.length) {
        setTerminalLines((prev) => [...prev, terminalLogs[idx]])
        idx++
      } else {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 300)
    showToast("正在运行代码...", "info")
  }, [isRunning, showToast])

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return
    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }])
    setChatInput("")
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", content: "已收到您的消息，正在分析代码..." },
      ])
    }, 800)
  }, [chatInput])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-950 dark:to-cyan-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-cyan-300/30 dark:bg-cyan-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl page-transition">
        {/* 页面头部 */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/25 animate-pulse-glow">
                <Code className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  编程手工作台
                </h1>
                <p className="text-sm text-muted-foreground mt-1">代码实现 · 数据运算 · AI辅助编程</p>
              </div>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md ml-2">
                李四 · 编程手
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <a href="/modeler">
                <Button variant="outline" size="sm" className="gap-1.5 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-800 dark:hover:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400">
                  <Brain className="w-3.5 h-3.5" />
                  前往建模手工作台
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </a>
              <a href="/writer">
                <Button variant="outline" size="sm" className="gap-1.5 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  <PenTool className="w-3.5 h-3.5" />
                  前往论文手工作台
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* IDE 工作区 */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700">
            {/* 文件标签栏 */}
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
              <div className="flex gap-1.5 mr-3 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              {openTabs.map((tab) => (
                <div
                  key={tab}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-lg transition-all cursor-pointer shrink-0",
                    activeFile === tab
                      ? "bg-gray-900 text-cyan-400 border-t-2 border-cyan-400 font-medium"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border-t-2 border-transparent"
                  )}
                  onClick={() => setActiveFile(tab)}
                >
                  <FileCode className="w-3 h-3" />
                  {tab}
                  <button
                    className="ml-1 hover:text-gray-200"
                    onClick={(e) => handleCloseTab(tab, e)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {/* 操作按钮 */}
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1"
                onClick={handleRun}
              >
                {isRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isRunning ? "停止" : "运行"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-yellow-400 hover:bg-gray-800 text-xs h-7 px-3 gap-1"
                onClick={() => { showToast("调试模式已启动", "info"); logMMP({ role: "coder", action: "debug", description: "进入调试模式" }) }}
              >
                <Bug className="w-3 h-3" />
                调试
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-800 text-xs h-7 px-3 gap-1"
                onClick={() => { showToast("文件已保存", "success"); logMMP({ role: "coder", action: "save", description: "保存代码文件" }) }}
              >
                <Save className="w-3 h-3" />
                保存
              </Button>
            </div>
          </div>

          {/* 状态栏 */}
          <div className="flex items-center justify-between px-4 py-1 bg-gray-800/80 border-b border-gray-700/50 text-[10px]">
            <div className="flex items-center gap-3 text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                AI辅助: 开启
              </span>
              <span>|</span>
              <span>Python 3.11</span>
              <span>|</span>
              <span>{activeFile}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <span>UTF-8</span>
              <span>|</span>
              <span>LF</span>
            </div>
          </div>

          {/* IDE 主体: 三栏布局 */}
          <div className="flex" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
            {/* 左栏: 文件树 */}
            <div className="w-56 bg-gray-900 text-gray-300 border-r border-gray-700/50 shrink-0 overflow-y-auto">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 border-b border-gray-800">
                <FolderOpen className="w-3.5 h-3.5" />
                资源管理器
              </div>
              <div className="p-2">
                {fileTree.map((node) => (
                  <FileTreeItem
                    key={node.name}
                    node={node}
                    depth={0}
                    activeFile={activeFile}
                    onSelectFile={handleSelectFile}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                  />
                ))}
              </div>
            </div>

            {/* 中栏: Monaco Editor */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 bg-gray-950">
                <MonacoEditor
                  height="100%"
                  language={fileLanguages[activeFile] || "python"}
                  theme="vs-dark"
                  value={fileContents[activeFile] || ""}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    tabSize: 4,
                    insertSpaces: true,
                  }}
                />
              </div>

              {/* 底部终端 */}
              {showTerminal && (
                <div className="border-t border-gray-700 bg-gray-950 shrink-0" style={{ height: "200px" }}>
                  <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800/80 border-b border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] text-gray-400 font-medium">终端输出</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRunning && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-900/50 text-amber-400 border-amber-700/50 h-4">
                          运行中...
                        </Badge>
                      )}
                      {!isRunning && terminalLines.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-900/50 text-emerald-400 border-emerald-700/50 h-4">
                          运行成功
                        </Badge>
                      )}
                      <button
                        className="text-gray-500 hover:text-gray-300 text-xs"
                        onClick={() => setShowTerminal(false)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 font-mono text-xs space-y-0.5 overflow-y-auto h-[calc(100%-32px)]">
                    {terminalLines.length === 0 && !isRunning && (
                      <div className="text-gray-600">
                        <span className="text-cyan-400">$</span> 点击&quot;运行&quot;按钮执行代码...
                      </div>
                    )}
                    {terminalLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          line.startsWith("$") ? "text-cyan-400 mb-1" :
                          line.startsWith("[SUCCESS]") ? "text-emerald-400 font-semibold" :
                          line.startsWith("[ERROR]") ? "text-red-400" :
                          line.startsWith("[WARN]") ? "text-amber-400" :
                          "text-gray-400"
                        )}
                      >
                        {line}
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="animate-pulse">处理中...</span>
                      </div>
                    )}
                    {!isRunning && terminalLines.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-gray-500">
                        <span className="text-cyan-400">$</span>
                        <span className="animate-pulse">_</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 终端关闭时的底部按钮栏 */}
              {!showTerminal && (
                <div className="border-t border-gray-700 bg-gray-800/80 px-4 py-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-emerald-400 hover:bg-gray-700 text-xs h-7 px-3 gap-1"
                    onClick={() => { setShowTerminal(true); handleRun() }}
                  >
                    <Play className="w-3 h-3" />
                    运行
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-yellow-400 hover:bg-gray-700 text-xs h-7 px-3 gap-1"
                    onClick={() => { setShowTerminal(true); showToast("调试模式已启动", "info") }}
                  >
                    <Bug className="w-3 h-3" />
                    调试
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-cyan-400 hover:bg-gray-700 text-xs h-7 px-3 gap-1"
                    onClick={() => { setShowTerminal(true) }}
                  >
                    <Terminal className="w-3 h-3" />
                    终端
                  </Button>
                </div>
              )}
            </div>

            {/* 右栏: AI助手面板 + 终端输出 */}
            <div className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-700/50 shrink-0 flex flex-col">
              {/* AI 助手聊天区 */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-gray-700/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">AI编程助手</span>
                    <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-auto">
                      GPT-4
                    </Badge>
                  </div>
                </div>

                {/* 聊天消息 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "ai" && (
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed",
                          msg.role === "ai"
                            ? "bg-gray-700/50 text-gray-200 border border-gray-600/30"
                            : "bg-cyan-600/30 text-cyan-100 border border-cyan-500/30"
                        )}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-5 h-5 rounded bg-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 输入框 */}
                <div className="p-3 border-t border-gray-700/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                      placeholder="向AI助手提问..."
                      className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                    <Button
                      size="icon-xs"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shrink-0"
                      onClick={handleSendChat}
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
