"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Sparkles,
  FileText,
  Award,
  Trophy,
  BookOpen,
  Lightbulb,
  X,
  GraduationCap,
  Star,
  Target,
  TrendingUp,
  Brain,
  Cpu,
  BarChart3,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ============================================================
   知识库数据接口
   ============================================================ */
interface KnowledgeItem {
  id: string
  title: string
  description: string
  tags: string[]
  year: string
  competition: string
  award: string
  category: string
  content: string
}

/* ============================================================
   假数据 - 18条记录
   ============================================================ */
const knowledgeItems: KnowledgeItem[] = [
  {
    id: "1",
    title: "2024 MCM A题 特等奖论文框架",
    description: "基于深度强化学习的交通信号灯优化方案，论文结构清晰，模型创新性强。采用时空图卷积网络处理交通流数据，结合DRL进行信号控制优化。",
    tags: ["MCM", "A题", "深度学习", "交通优化"],
    year: "2024",
    competition: "MCM",
    award: "特等奖",
    category: "机器学习",
    content: "该论文针对城市交通信号灯优化问题，提出了一种基于深度强化学习(DRL)与时空图卷积网络(STGCN)的联合优化框架。论文结构包含：问题分析、数据预处理、模型构建（DRL-STGCN）、实验验证、灵敏度分析、结论与展望。模型创新点在于将交通网络建模为动态图结构，利用STGCN捕获空间依赖性，DRL处理时间序列决策。实验在真实交通数据集上验证了模型的有效性，平均等待时间降低了23.5%。论文图表精美，代码规范，是MCM论文写作的优秀范例。",
  },
  {
    id: "2",
    title: "2023 CUMCM A题 国家一等奖论文结构",
    description: "高温作业专用服装设计优化模型，灵敏度分析详尽，图表精美。采用热传导方程建模，遗传算法优化。",
    tags: ["CUMCM", "A题", "热传导", "优化算法"],
    year: "2023",
    competition: "CUMCM",
    award: "一等奖",
    category: "微分方程",
    content: "该论文研究高温作业专用服装的热防护性能优化问题。建立了多层热传导方程模型，考虑了服装各层材料的热物性参数。采用有限差分法进行数值求解，利用遗传算法对服装层厚进行多目标优化。灵敏度分析部分详细讨论了环境温度、内层温度阈值等参数对最优解的影响。论文包含丰富的可视化图表，包括温度分布热力图、优化过程收敛曲线等。代码实现完整，注释规范。",
  },
  {
    id: "3",
    title: "2024 ICM D题 Outstanding Winner",
    description: "可持续水资源管理政策评估，多准则决策分析框架完整。结合系统动力学与层次分析法进行综合评价。",
    tags: ["ICM", "D题", "水资源", "决策分析"],
    year: "2024",
    competition: "ICM",
    award: "特等奖",
    category: "统计分析",
    content: "该论文针对可持续水资源管理政策评估问题，构建了基于系统动力学(SD)与层次分析法(AHP)的综合评价框架。首先建立水资源系统的SD模型，模拟不同政策情景下的水资源供需动态变化；然后利用AHP确定各评价指标的权重；最后通过TOPSIS方法对政策方案进行排序。模型考虑了气候变化、人口增长、经济发展等多个因素，具有较强的现实指导意义。论文结构严谨，逻辑清晰，是ICM论文的优秀范例。",
  },
  {
    id: "4",
    title: "2023 MCM B题 Meritorious Winner",
    description: "全球海洋塑料污染预测与治理策略，时空数据分析深入。采用随机扩散模型与图论方法。",
    tags: ["MCM", "B题", "环境建模", "图论"],
    year: "2023",
    competition: "MCM",
    award: "一等奖",
    category: "图论",
    content: "该论文研究全球海洋塑料污染的传播预测与治理策略优化问题。建立了基于洋流数据的塑料粒子随机扩散模型，利用图论方法构建海洋区域网络，分析塑料污染的传播路径与聚集区域。提出了基于关键节点识别的治理策略优化方法。模型在多个数据集上进行了验证，预测精度达到85%以上。论文创新性地将图论与随机过程相结合，为海洋污染治理提供了新的思路。",
  },
  {
    id: "5",
    title: "SEIR传染病模型优化方法",
    description: "改进的SEIR模型，引入时变参数和空间扩散项，适用于COVID-19等传染病建模。包含贝叶斯参数估计方法。",
    tags: ["SEIR", "传染病", "时变参数", "贝叶斯"],
    year: "2024",
    competition: "MCM",
    award: "一等奖",
    category: "微分方程",
    content: "该方法在经典SEIR模型基础上进行了三项重要改进：（1）引入时变传染率β(t)，使其能够反映防控措施对传播动力学的影响；（2）添加空间扩散项，利用元胞自动机(CA)处理地理空间异质性；（3）采用贝叶斯MCMC方法进行参数估计，提供参数的后验分布而非点估计。该方法已在多个传染病数据集上验证，拟合优度R²均超过0.9。代码基于Python实现，使用scipy.integrate.odeint求解ODE系统。",
  },
  {
    id: "6",
    title: "元胞自动机在交通流中的应用",
    description: "基于Nagel-Schreckenberg模型的交通流元胞自动机仿真，含多车道扩展和信号灯控制模块。",
    tags: ["元胞自动机", "交通流", "仿真模拟"],
    year: "2023",
    competition: "CUMCM",
    award: "二等奖",
    category: "图论",
    content: "该方法实现了基于Nagel-Schreckenberg(NaSch)模型的交通流元胞自动机仿真系统。核心功能包括：单车道/多车道交通流模拟、信号灯控制策略、车辆换道规则、拥堵波传播分析。模型采用周期性边界条件，支持自定义道路长度、车辆密度、最大速度等参数。仿真结果与实测数据对比，验证了模型的有效性。代码结构清晰，易于扩展，适合作为交通建模的基础框架。",
  },
  {
    id: "7",
    title: "图神经网络预测模型",
    description: "利用GNN进行社交网络传播预测，含GCN和GAT两种架构对比。适用于信息传播、流行病预测等场景。",
    tags: ["GNN", "社交网络", "传播预测", "深度学习"],
    year: "2024",
    competition: "MCM",
    award: "特等奖",
    category: "机器学习",
    content: "该方法利用图神经网络(GNN)进行社交网络中的信息传播预测。实现了两种主流GNN架构：图卷积网络(GCN)和图注意力网络(GAT)，并在多个真实社交网络数据集上进行了对比实验。模型输入为网络拓扑结构和节点特征，输出为节点在未来时间步的激活概率。实验结果表明GAT在捕获长距离依赖方面优于GCN，而GCN在计算效率上更具优势。代码基于PyTorch Geometric实现，包含完整的数据预处理、训练和评估流程。",
  },
  {
    id: "8",
    title: "多目标优化遗传算法",
    description: "NSGA-II多目标遗传算法实现，支持Pareto前沿可视化和约束处理。适用于工程优化、资源分配等场景。",
    tags: ["NSGA-II", "多目标优化", "遗传算法", "Pareto"],
    year: "2023",
    competition: "CUMCM",
    award: "一等奖",
    category: "优化算法",
    content: "该方法实现了经典的NSGA-II多目标遗传算法，支持以下功能：（1）任意数量的优化目标；（2）等式和不等式约束处理；（3）实数编码和二进制编码；（4）Pareto前沿可视化；（5）多种交叉和变异算子。算法采用快速非支配排序和拥挤度距离计算，保证了Pareto前沿的多样性和收敛性。代码包含多个测试函数（ZDT、DTLZ系列）和实际应用案例，文档完善，接口友好。",
  },
  {
    id: "9",
    title: "时间序列ARIMA预测",
    description: "ARIMA/SARIMA时间序列预测完整流程，含ADF检验、模型定阶和残差分析。适用于经济、气象等预测场景。",
    tags: ["ARIMA", "时间序列", "统计分析", "预测"],
    year: "2024",
    competition: "MCM",
    award: "二等奖",
    category: "统计分析",
    content: "该方法提供了ARIMA/SARIMA时间序列预测的完整流程，包括：（1）数据探索性分析（趋势、季节性、平稳性检验）；（2）ADF单位根检验确定差分阶数d；（3）ACF/PACF图辅助确定p和q；（4）AIC/BIC准则自动定阶；（5）模型参数估计与诊断检验；（6）残差分析（Ljung-Box检验、正态性检验）；（7）滚动预测与模型评估。代码基于statsmodels库实现，包含详细的注释和示例数据。",
  },
  {
    id: "10",
    title: "2024 CUMCM B题 国家二等奖",
    description: "无人机协同路径规划优化模型，采用蚁群算法与A*算法结合。路径规划与任务分配联合优化。",
    tags: ["CUMCM", "B题", "路径规划", "蚁群算法"],
    year: "2024",
    competition: "CUMCM",
    award: "二等奖",
    category: "优化算法",
    content: "该论文研究多无人机协同路径规划问题，提出了蚁群算法(ACO)与A*算法相结合的混合优化策略。首先利用A*算法生成初始可行路径，然后通过ACO进行全局优化。模型同时考虑了路径长度、能耗、避障和任务完成时间等多个目标。论文的创新点在于设计了自适应信息素更新策略，提高了算法的收敛速度和解质量。实验在多种场景下验证了算法的有效性。",
  },
  {
    id: "11",
    title: "2023 ICM E题 Meritorious Winner",
    description: "全球粮食安全评估与预测模型，结合主成分分析与随机森林。多维度指标体系构建方法值得借鉴。",
    tags: ["ICM", "E题", "粮食安全", "随机森林"],
    year: "2023",
    competition: "ICM",
    award: "一等奖",
    category: "统计分析",
    content: "该论文构建了全球粮食安全综合评估与预测模型。首先通过主成分分析(PCA)从50多个指标中提取10个主成分，构建了粮食安全指数；然后利用随机森林(RF)模型对各国粮食安全等级进行分类预测；最后基于LSTM网络进行时间序列预测。论文详细介绍了指标体系的构建方法、数据标准化策略和模型选择过程。可视化部分包含世界地图热力图、雷达图和时间序列预测图等。",
  },
  {
    id: "12",
    title: "蒙特卡洛模拟在金融中的应用",
    description: "基于蒙特卡洛方法的期权定价与风险度量模型。包含几何布朗运动模拟和VaR计算。",
    tags: ["蒙特卡洛", "金融建模", "期权定价", "风险管理"],
    year: "2024",
    competition: "MCM",
    award: "一等奖",
    category: "统计分析",
    content: "该方法实现了基于蒙特卡洛模拟的金融衍生品定价与风险度量框架。核心功能包括：（1）几何布朗运动(GBM)路径模拟；（2）欧式/美式期权定价；（3）在险价值(VaR)和条件VaR计算；（4）希腊字母灵敏度分析；（5）方差减少技术（对偶变量法、控制变量法）。代码基于NumPy实现，支持并行计算加速。文档包含完整的数学推导和数值实验结果。",
  },
  {
    id: "13",
    title: "2024 MCM C题 Outstanding Winner",
    description: "渔业气候影响分析的SEIR-CA混合模型，时空耦合建模方法创新。贝叶斯参数推断与模型验证完整。",
    tags: ["MCM", "C题", "SEIR", "元胞自动机", "渔业"],
    year: "2024",
    competition: "MCM",
    award: "特等奖",
    category: "微分方程",
    content: "该论文针对2024年MCM-C题渔业气候影响分析问题，提出了SEIR-CA混合模型。将渔业资源状态映射为SEIR框架（健康-退化-枯竭-恢复），利用元胞自动机处理海域间的空间扩散效应。模型采用贝叶斯MCMC方法进行参数推断，通过交叉验证评估模型泛化能力。论文的创新点在于将传染病建模方法创造性地应用于渔业资源管理领域。R²达到0.947，模型拟合效果优秀。",
  },
  {
    id: "14",
    title: "模糊综合评价方法",
    description: "多层次模糊综合评价方法实现，适用于多指标决策问题。包含隶属度函数设计和一致性检验。",
    tags: ["模糊数学", "综合评价", "多指标决策"],
    year: "2023",
    competition: "CUMCM",
    award: "二等奖",
    category: "统计分析",
    content: "该方法实现了多层次模糊综合评价模型，适用于多指标、多层次的决策评价问题。核心功能包括：（1）因素集和评语集的构建；（2）隶属度函数设计（三角型、梯型、高斯型）；（3）权重确定（层次分析法、熵权法）；（4）模糊矩阵合成运算；（5）评价结果分析。代码包含完整的示例案例，展示了从指标体系构建到最终评价结果输出的全过程。",
  },
  {
    id: "15",
    title: "2023 MCM C题 Finalist",
    description: "Wordle游戏策略优化的马尔可夫决策过程模型。信息论与博弈论结合的精彩案例。",
    tags: ["MCM", "C题", "MDP", "信息论", "博弈论"],
    year: "2023",
    competition: "MCM",
    award: "一等奖",
    category: "优化算法",
    content: "该论文将Wordle游戏策略优化建模为马尔可夫决策过程(MDP)。利用信息论方法计算每个猜测词的期望信息增益，结合博弈论考虑对手的最优策略。模型创新性地提出了基于互信息的启发式策略，在保证计算效率的同时接近最优解。论文数学推导严谨，模型验证充分，是MDP应用的优秀案例。代码实现了完整的策略搜索和评估流程。",
  },
  {
    id: "16",
    title: "支持向量机分类与回归",
    description: "SVM分类与SVR回归的完整实现与调参指南。包含核函数选择、交叉验证和超参数优化。",
    tags: ["SVM", "机器学习", "分类", "回归"],
    year: "2024",
    competition: "CUMCM",
    award: "一等奖",
    category: "机器学习",
    content: "该方法提供了支持向量机(SVM)在分类和回归任务中的完整实现指南。内容包括：（1）线性可分SVM与软间隔SVM的理论推导；（2）常用核函数（线性、多项式、RBF、Sigmoid）的对比分析；（3）网格搜索与交叉验证的超参数调优策略；（4）SVR回归模型的参数选择建议；（5）多分类问题的处理方法（OvO、OvR）。代码基于scikit-learn实现，包含多个实际应用案例。",
  },
  {
    id: "17",
    title: "2024 CUMCM C题 国家一等奖",
    description: "跨境电商物流配送路径优化，采用改进的禁忌搜索算法。多约束条件处理方法值得学习。",
    tags: ["CUMCM", "C题", "物流优化", "禁忌搜索"],
    year: "2024",
    competition: "CUMCM",
    award: "一等奖",
    category: "优化算法",
    content: "该论文研究跨境电商物流配送路径优化问题，提出了改进的禁忌搜索算法。模型考虑了时间窗约束、车辆容量约束、多配送中心等实际因素。算法创新点包括：自适应邻域结构设计、动态禁忌长度调整、基于插入和交换的多样化策略。实验在多个规模的算例上验证了算法的有效性，与已知最优解的偏差在3%以内。论文还进行了详细的参数灵敏度分析。",
  },
  {
    id: "18",
    title: "层次分析法(AHP)完整指南",
    description: "AHP从理论到实践的完整指南，含判断矩阵构建、一致性检验和软件实现。数学建模必备方法。",
    tags: ["AHP", "层次分析", "决策方法", "权重计算"],
    year: "2023",
    competition: "MCM",
    award: "二等奖",
    category: "统计分析",
    content: "该方法提供了层次分析法(AHP)的完整实现指南，是数学建模中最常用的决策方法之一。内容包括：（1）层次结构模型的构建原则；（2）判断矩阵的构造方法（1-9标度法）；（3）权重计算方法（特征向量法、几何平均法、最小二乘法）；（4）一致性比率(CR)的计算与检验标准；（5）群决策AHP的扩展方法。代码实现了完整的AHP计算流程，包含自动一致性检验功能。",
  },
]

/* ============================================================
   筛选选项
   ============================================================ */
const yearOptions = ["2024", "2023", "2022"]
const competitionOptions = ["MCM", "ICM", "CUMCM"]
const awardOptions = ["特等奖", "一等奖", "二等奖"]
const categoryOptions = ["微分方程", "优化算法", "统计分析", "图论", "机器学习"]

/* ============================================================
   高亮匹配文字
   ============================================================ */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

/* ============================================================
   主页面组件
   ============================================================ */
export default function KnowledgePage() {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([])
  const [selectedAwards, setSelectedAwards] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [detailDialog, setDetailDialog] = useState<KnowledgeItem | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter logic
  const filteredItems = useMemo(() => {
    return knowledgeItems.filter((item) => {
      // Search filter
      if (debouncedQuery.trim()) {
        const query = debouncedQuery.toLowerCase()
        const searchableText = [
          item.title,
          item.description,
          ...item.tags,
          item.category,
          item.competition,
          item.award,
        ].join(" ").toLowerCase()

        if (!searchableText.includes(query)) return false
      }

      // Year filter (AND)
      if (selectedYears.length > 0 && !selectedYears.includes(item.year)) return false

      // Competition filter (AND)
      if (selectedCompetitions.length > 0 && !selectedCompetitions.includes(item.competition)) return false

      // Award filter (AND)
      if (selectedAwards.length > 0 && !selectedAwards.includes(item.award)) return false

      // Category filter (AND)
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false

      return true
    })
  }, [debouncedQuery, selectedYears, selectedCompetitions, selectedAwards, selectedCategories])

  const toggleFilter = useCallback((
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedYears([])
    setSelectedCompetitions([])
    setSelectedAwards([])
    setSelectedCategories([])
  }, [])

  const hasActiveFilters = selectedYears.length > 0 || selectedCompetitions.length > 0 ||
    selectedAwards.length > 0 || selectedCategories.length > 0

  const awardBadgeColor = (award: string) => {
    if (award === "特等奖") return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm"
    if (award === "一等奖") return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-sm"
    return "bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0 shadow-sm"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-cyan-400/15 to-pink-400/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">智能知识引擎</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            知识库系统
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            让所有Agent更聪明，持续学习和进化
          </p>
        </div>

        {/* 搜索区域 */}
        <Card className="mb-8 border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-blue-500/5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-6">
            {/* 搜索框 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="搜索论文、思路、案例..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white/80 border-blue-100 focus:border-blue-300 rounded-xl text-sm"
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 px-4 text-xs text-muted-foreground"
                  onClick={clearAllFilters}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  清除筛选
                </Button>
              )}
            </div>

            {/* 筛选条件 */}
            <div className="space-y-3">
              {/* 年份 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">年份</span>
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    onClick={() => toggleFilter(year, selectedYears, setSelectedYears)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                      selectedYears.includes(year)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/25"
                        : "bg-white/80 text-muted-foreground hover:bg-blue-50 border border-blue-100"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* 竞赛 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">竞赛</span>
                {competitionOptions.map((comp) => (
                  <button
                    key={comp}
                    onClick={() => toggleFilter(comp, selectedCompetitions, setSelectedCompetitions)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                      selectedCompetitions.includes(comp)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/25"
                        : "bg-white/80 text-muted-foreground hover:bg-blue-50 border border-blue-100"
                    )}
                  >
                    {comp}
                  </button>
                ))}
              </div>

              {/* 奖项 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">奖项</span>
                {awardOptions.map((award) => (
                  <button
                    key={award}
                    onClick={() => toggleFilter(award, selectedAwards, setSelectedAwards)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                      selectedAwards.includes(award)
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25"
                        : "bg-white/80 text-muted-foreground hover:bg-amber-50 border border-amber-100"
                    )}
                  >
                    {award}
                  </button>
                ))}
              </div>

              {/* 分类 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">分类</span>
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                      selectedCategories.includes(cat)
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25"
                        : "bg-white/80 text-muted-foreground hover:bg-purple-50 border border-purple-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索结果统计 */}
            <div className="mt-4 pt-3 border-t border-blue-50">
              <p className="text-xs text-muted-foreground">
                共找到 <span className="font-semibold text-foreground">{filteredItems.length}</span> 条结果
                {debouncedQuery && (
                  <span>
                    ，搜索关键词: <span className="font-semibold text-blue-600">&quot;{debouncedQuery}&quot;</span>
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 搜索结果网格 */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">没有找到匹配的结果</h3>
            <p className="text-sm text-muted-foreground mb-4">请尝试调整搜索关键词或筛选条件</p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-blue-200 hover:bg-blue-50 text-blue-600"
            >
              清除所有筛选条件
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item, index) => (
              <Card
                key={item.id}
                className="group border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                onClick={() => setDetailDialog(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={cn("text-[10px]", awardBadgeColor(item.award))}>
                      {item.award}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      {item.year}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {highlightText(item.title, debouncedQuery)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">
                    {highlightText(item.description, debouncedQuery)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100">
                      {item.competition}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-600 hover:bg-purple-100">
                      {item.category}
                    </Badge>
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] bg-slate-50 text-slate-500 hover:bg-slate-100"
                      >
                        {highlightText(tag, debouncedQuery)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI学习能力 */}
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Card className="border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden shadow-2xl shadow-purple-500/25">
            <CardContent className="relative p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI 智能学习能力</h3>
                  <p className="text-white/70 text-sm">知识库持续为AI Agent提供学习素材</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  {[
                    { name: "论文结构分析", progress: 92 },
                    { name: "建模方法识别", progress: 87 },
                    { name: "代码模式学习", progress: 85 },
                    { name: "图表生成优化", progress: 85 },
                    { name: "评价标准理解", progress: 82 },
                  ].map((area) => (
                    <div key={area.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{area.name}</span>
                        <span className="text-white/80">{area.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full transition-all duration-1000"
                          style={{ width: `${area.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="w-5 h-5 text-cyan-300" />
                      <span className="font-medium">知识更新频率</span>
                    </div>
                    <div className="text-3xl font-bold">实时</div>
                    <p className="text-white/60 text-sm mt-1">每次竞赛结束后自动提取新知识</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="w-5 h-5 text-pink-300" />
                      <span className="font-medium">Agent能力提升</span>
                    </div>
                    <div className="text-3xl font-bold">+34.7%</div>
                    <p className="text-white/60 text-sm mt-1">接入知识库后Agent综合能力平均提升</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 详情对话框 */}
      <Dialog open={!!detailDialog} onOpenChange={(open) => !open && setDetailDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5 text-blue-500" />
              {detailDialog?.title}
            </DialogTitle>
            <DialogDescription>详细信息</DialogDescription>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              {/* 标签信息 */}
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("text-xs", awardBadgeColor(detailDialog.award))}>
                  {detailDialog.award}
                </Badge>
                <Badge variant="outline" className="text-xs">{detailDialog.year}</Badge>
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600">{detailDialog.competition}</Badge>
                <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-600">{detailDialog.category}</Badge>
              </div>

              {/* 描述 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">概述</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{detailDialog.description}</p>
              </div>

              {/* 详细内容 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">详细内容</h4>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {detailDialog.content}
                  </p>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">标签</h4>
                <div className="flex flex-wrap gap-1.5">
                  {detailDialog.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
