import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    memo,
    useLayoutEffect
} from 'react';
import {
    PlusCircle,
    TrendingDown,
    TrendingUp,
    Calendar,
    DollarSign,
    PieChart,
    BarChart3,
    Filter,
    Search,
    LogOut,
    User
} from 'lucide-react';
import { transactionAPI, ApiTransaction } from '../api/transactionAPI';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/userApi';
import Chart from 'chart.js/auto';
import type { TooltipItem } from 'chart.js';

/* ---------- Types ---------- */
interface DashboardPageProps {
    setIsAuthenticated?: (auth: boolean) => void;
}

interface Transaction {
    id: number;
    type: 'expense' | 'income';
    category: string;
    amount: number;
    description: string;
    date: string; // YYYY-MM-DD
}

/* ---------- Helpers ---------- */
const mapApiToTransaction = (api: ApiTransaction): Transaction => {
    const typeMap: Record<string, 'expense' | 'income'> = {
        EXPENSE: 'expense',
        INCOME: 'income',
        expense: 'expense',
        income: 'income'
    };

    const type = typeMap[api.type] ?? 'expense';
    const date = api.transactionDate?.split('T')[0] ?? api.transactionDate ?? new Date().toISOString().split('T')[0];

    return {
        id: api.id,
        type,
        category: api.category ?? '기타',
        amount: Number(api.amount ?? 0),
        description: api.description ?? '',
        date
    };
};

/* ---------- MonthlyExpenseChart (chart 생성 1회, 데이터만 업데이트) ---------- */
const MonthlyExpenseChart = memo(({ transactions }: { transactions: Transaction[] }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);

    // 최근 6개월 레이블 + 데이터 (memoized)
    const monthlyData = useMemo(() => {
        const months: { label: string; key: string; expense: number; income: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({ label: `${d.getMonth() + 1}월`, key, expense: 0, income: 0 });
        }

        const map = Object.fromEntries(months.map(m => [m.key, m]));

        transactions.forEach(t => {
            const td = new Date(t.date);
            const k = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}`;
            if (map[k]) {
                if (t.type === 'expense') map[k].expense += t.amount;
                else map[k].income += t.amount;
            }
        });

        return months.map(m => ({ label: m.label, expense: map[m.key].expense, income: map[m.key].income }));
    }, [transactions]);

    // 최초 차트 생성 (useLayoutEffect로 DOM 보장)
    useLayoutEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.map(m => m.label),
                datasets: [
                    {
                        label: '지출',
                        data: monthlyData.map(m => m.expense),
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: '수입',
                        data: monthlyData.map(m => m.income),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label(ctx: TooltipItem<'bar'>) {
                                return `${String(ctx.dataset.label)}: ₩${Number(ctx.parsed.y).toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                        }
                    }
                }
            }
        });

        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 한 번만 생성

    // 데이터 변경 시 update
    useEffect(() => {
        if (!chartRef.current) return;
        const chart = chartRef.current;
        chart.data.labels = monthlyData.map(m => m.label);
        chart.data.datasets[0].data = monthlyData.map(m => m.expense);
        chart.data.datasets[1].data = monthlyData.map(m => m.income);
        chart.update();
    }, [monthlyData]);

    return <canvas ref={canvasRef} />;
});

/* ---------- CategoryExpenseChart (doughnut) ---------- */
const CategoryExpenseChart = memo(({ transactions }: { transactions: Transaction[] }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);

    const categoryData = useMemo(() => {
        const map = new Map<string, number>();
        transactions.filter(t => t.type === 'expense').forEach(t => {
            map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
        });
        const arr = Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
        arr.sort((a, b) => b.amount - a.amount);
        return arr;
    }, [transactions]);

    useLayoutEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        if (categoryData.length === 0) return;

        const colors = [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)'
        ];

        chartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.map(c => c.category),
                datasets: [
                    {
                        data: categoryData.map(c => c.amount),
                        backgroundColor: colors.slice(0, categoryData.length),
                        borderColor: colors.slice(0, categoryData.length).map(c => c.replace('0.8', '1')),
                        borderWidth: 2,
                        hoverOffset: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
                    tooltip: {
                        callbacks: {
                            label(ctx: TooltipItem<'bar'>) {
                                const total = categoryData.reduce((s, it) => s + it.amount, 0);
                                const value = Number(ctx.parsed);
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${String(ctx.label)}: ₩${value.toLocaleString()} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 한 번 생성

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = chartRef.current;
        if (categoryData.length === 0) {
            chart.destroy();
            chartRef.current = null;
            return;
        }
        chart.data.labels = categoryData.map(c => c.category);
        chart.data.datasets[0].data = categoryData.map(c => c.amount);
        chart.update();
    }, [categoryData]);

    return <canvas ref={canvasRef} />;
});

/* ---------- AddTransactionModal ---------- */
const AddTransactionModal = memo(({
                                      show,
                                      onClose,
                                      onSubmit,
                                      defaultType,
                                      categories
                                  }: {
    show: boolean;
    onClose: () => void;
    onSubmit: (payload: { type: 'expense' | 'income'; category: string; amount: number; description: string; date: string }) => Promise<void>;
    defaultType?: 'expense' | 'income';
    categories: { expense: string[]; income: string[] };
}) => {
    const [type, setType] = useState<'expense' | 'income'>(defaultType ?? 'expense');
    const [amount, setAmount] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (show) {
            // reset when opened
            setType(defaultType ?? 'expense');
            setAmount('');
            setCategory('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [show, defaultType]);

    const handleSubmit = useCallback(async () => {
        if (!amount || !category || !description || !date) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        const numeric = Number(amount);
        if (Number.isNaN(numeric) || numeric <= 0) {
            alert('금액은 0보다 큰 숫자여야 합니다.');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({ type, category, amount: numeric, description, date });
            onClose();
        } catch (err) {
            console.error(err);
            alert('거래 추가에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    }, [amount, category, description, date, onSubmit, onClose, type]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">거래 추가</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>

                <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setType('expense')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-600'}`}>지출</button>
                    <button onClick={() => setType('income')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${type === 'income' ? 'bg-green-500 text-white' : 'text-gray-600'}`}>수입</button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded">
                            <option value="">선택</option>
                            {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-2 px-3 border rounded">취소</button>
                        <button onClick={handleSubmit} className={`flex-1 py-2 px-3 rounded text-white ${type === 'expense' ? 'bg-red-500' : 'bg-green-500'}`} disabled={submitting}>
                            {submitting ? '추가중...' : '추가'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

/* ---------- Dashboard (summary + charts) ---------- */
const Dashboard = memo(({ monthlyStats, transactions }: { monthlyStats: { totalIncome: number; totalExpense: number; balance: number }; transactions: Transaction[] }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">총 수입</p>
                            <p className="text-2xl font-bold">₩{monthlyStats.totalIncome.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">총 지출</p>
                            <p className="text-2xl font-bold">₩{monthlyStats.totalExpense.toLocaleString()}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">잔액</p>
                            <p className="text-2xl font-bold">₩{monthlyStats.balance.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">월별 수입/지출 추이</h3>
                        <BarChart3 className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="h-64"><MonthlyExpenseChart transactions={transactions} /></div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">카테고리별 지출</h3>
                        <PieChart className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="h-64">
                        {transactions.some(t => t.type === 'expense') ? <CategoryExpenseChart transactions={transactions} /> : <div className="h-full flex items-center justify-center text-gray-500">지출 데이터가 없습니다</div>}
                    </div>
                </div>
            </div>
        </div>
    );
});

/* ---------- TransactionList ---------- */
const TransactionList = memo(({ transactions, searchTerm, setSearchTerm, loading }: {
    transactions: Transaction[];
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    loading: boolean;
}) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="거래 내용 검색..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg" />
                </div>
                <button className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg">
                    <Filter className="h-4 w-4" />
                    <span>필터</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-500">거래 내역을 불러오는 중...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">거래 내역이 없습니다.</div>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-medium text-gray-800">{t.description}</p>
                                    <p className="text-sm text-gray-500">{t.category} • {t.date}</p>
                                </div>
                            </div>
                            <div className={`text-lg font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'}₩{t.amount.toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

/* ---------- Main Page Component ---------- */
const DashboardPage: React.FC<DashboardPageProps> = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
    const [showAdd, setShowAdd] = useState(false);
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const categories = useMemo(() => ({
        expense: ['식비', '교통비', '쇼핑', '의료비', '문화생활', '기타'],
        income: ['급여', '부업', '용돈', '기타']
    }), []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await transactionAPI.getAll();
            // response.content 가 ApiTransaction[] 라고 가정
            const data = Array.isArray(res.content) ? res.content.map(mapApiToTransaction) : [];
            setTransactions(data);
        } catch (err) {
            console.error('거래 조회 실패', err);
            alert('거래 내역을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const monthlyStats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions;
        const q = searchTerm.toLowerCase();
        return transactions.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }, [transactions, searchTerm]);

    const handleLogout = useCallback(async () => {
        try {
            await userAPI.logout();
        } catch (err) {
            console.warn('logout api failed', err);
        } finally {
            logout();
        }
    }, [logout]);

    const handleAddTransaction = useCallback(async (payload: { type: 'expense' | 'income'; category: string; amount: number; description: string; date: string }) => {
        try {
            const body = {
                type: payload.type === 'expense' ? 'EXPENSE' : 'INCOME',
                category: payload.category,
                amount: payload.amount,
                description: payload.description,
                transactionDate: payload.date
            };
            await transactionAPI.create(body);
            await fetchTransactions();
            alert('거래가 추가되었습니다.');
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [fetchTransactions]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <DollarSign className="h-8 w-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-800">가계부</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-700">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">{user?.name ?? '사용자'}님 안녕하세요!</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</span>
                            </div>
                            <button onClick={() => { setShowAdd(true); setTransactionType('expense'); }} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                                <PlusCircle className="h-4 w-4" /><span>추가</span>
                            </button>
                            <button onClick={handleLogout} className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg">
                                <LogOut className="h-4 w-4" /><span>로그아웃</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button onClick={() => setActiveTab('dashboard')} className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>대시보드</button>
                        <button onClick={() => setActiveTab('transactions')} className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'transactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>거래 내역</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' ? (
                    <Dashboard monthlyStats={monthlyStats} transactions={transactions} />
                ) : (
                    <TransactionList transactions={filteredTransactions} searchTerm={searchTerm} setSearchTerm={setSearchTerm} loading={loading} />
                )}
            </main>

            <AddTransactionModal
                show={showAdd}
                onClose={() => setShowAdd(false)}
                onSubmit={handleAddTransaction}
                defaultType={transactionType}
                categories={categories}
            />
        </div>
    );
};

export default DashboardPage;
