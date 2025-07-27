import React, { useState, useCallback, useMemo, memo } from 'react';
import { PlusCircle, TrendingDown, TrendingUp, Calendar, DollarSign, PieChart, BarChart3, Filter, Search, LogOut, User } from 'lucide-react';

interface DashboardPageProps {
    setIsAuthenticated: (auth: boolean) => void;
}

// AddTransactionModal을 별도 컴포넌트로 분리하고 memo로 최적화
const AddTransactionModal = memo(({
                                      showAddModal,
                                      setShowAddModal,
                                      transactionType,
                                      setTransactionType,
                                      amount,
                                      setAmount,
                                      category,
                                      setCategory,
                                      description,
                                      setDescription,
                                      date,
                                      setDate,
                                      onAddTransaction,
                                      categories
                                  }: {
    showAddModal: boolean;
    setShowAddModal: (show: boolean) => void;
    transactionType: string;
    setTransactionType: (type: string) => void;
    amount: string;
    setAmount: (amount: string) => void;
    category: string;
    setCategory: (category: string) => void;
    description: string;
    setDescription: (description: string) => void;
    date: string;
    setDate: (date: string) => void;
    onAddTransaction: () => void;
    categories: { [key: string]: string[] };
}) => {
    if (!showAddModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">거래 추가</h3>
                    <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* 수입/지출 탭 */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setTransactionType('expense')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            transactionType === 'expense'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        지출
                    </button>
                    <button
                        onClick={() => setTransactionType('income')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            transactionType === 'income'
                                ? 'bg-green-500 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        수입
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">금액</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="금액을 입력하세요"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">카테고리 선택</option>
                            {categories[transactionType]?.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="거래 내용을 입력하세요"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            취소
                        </button>
                        <button
                            onClick={onAddTransaction}
                            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
                                transactionType === 'expense'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                            }`}
                        >
                            추가
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Dashboard 컴포넌트를 memo로 최적화
const Dashboard = memo(({ monthlyStats }: { monthlyStats: any }) => (
    <div className="space-y-6">
        {/* 월별 요약 카드 */}
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

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">월별 지출 추이</h3>
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                </div>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">차트 영역 (Chart.js 연동)</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">카테고리별 지출</h3>
                    <PieChart className="h-5 w-5 text-gray-500" />
                </div>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">파이 차트 영역</p>
                </div>
            </div>
        </div>
    </div>
));

// TransactionList 컴포넌트를 memo로 최적화
const TransactionList = memo(({ transactions, searchTerm, setSearchTerm }: {
    transactions: any[],
    searchTerm: string,
    setSearchTerm: (term: string) => void
}) => (
    <div className="space-y-4">
        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="거래 내용 검색..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="h-4 w-4" />
                <span>필터</span>
            </button>
        </div>

        {/* 거래 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                            <p className="font-medium text-gray-800">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                        </div>
                    </div>
                    <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {transaction.type === 'income' ? '+' : '-'}₩{transaction.amount.toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    </div>
));

const ExpenseTracker: React.FC<DashboardPageProps> = ({ setIsAuthenticated }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddModal, setShowAddModal] = useState(false);
    const [transactionType, setTransactionType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    // 샘플 데이터
    const [transactions, setTransactions] = useState([
        { id: 1, type: 'expense', category: '식비', amount: 15000, description: '점심 식사', date: '2024-01-15' },
        { id: 2, type: 'income', category: '급여', amount: 3000000, description: '1월 급여', date: '2024-01-01' },
        { id: 3, type: 'expense', category: '교통비', amount: 5000, description: '지하철', date: '2024-01-14' },
        { id: 4, type: 'expense', category: '쇼핑', amount: 85000, description: '의류 구매', date: '2024-01-13' },
    ]);

    // categories를 useMemo로 최적화 (변경되지 않는 데이터)
    const categories = useMemo(() => ({
        expense: ['식비', '교통비', '쇼핑', '의료비', '문화생활', '기타'],
        income: ['급여', '부업', '용돈', '기타']
    }), []);

    // monthlyStats를 useMemo로 최적화
    const monthlyStats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    }, [transactions]);

    // 검색된 거래 목록을 useMemo로 최적화
    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions;
        return transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    // 이벤트 핸들러들을 useCallback으로 최적화
    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
    }, [setIsAuthenticated]);

    const handleAddTransaction = useCallback(() => {
        if (!amount || !description || !date) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            type: transactionType,
            category: category,
            amount: parseInt(amount),
            description,
            date
        };

        setTransactions(prev => [newTransaction, ...prev]);

        // 폼 초기화
        setAmount('');
        setCategory('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setShowAddModal(false);
    }, [amount, description, date, transactionType, category]);

    const handleShowAddModal = useCallback(() => {
        setShowAddModal(true);
    }, []);

    const handleSetActiveTab = useCallback((tab: string) => {
        setActiveTab(tab);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <DollarSign className="h-8 w-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-800">가계부</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* 사용자 인사말 */}
                            <div className="flex items-center space-x-2 text-gray-700">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">사용자님 안녕하세요!</span>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>2024년 1월</span>
                            </div>

                            <button
                                onClick={handleShowAddModal}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>추가</span>
                            </button>

                            {/* 로그아웃 버튼 */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>로그아웃</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 네비게이션 */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => handleSetActiveTab('dashboard')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'dashboard'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            대시보드
                        </button>
                        <button
                            onClick={() => handleSetActiveTab('transactions')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'transactions'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            거래 내역
                        </button>
                    </div>
                </div>
            </nav>

            {/* 메인 컨텐츠 */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' ? (
                    <Dashboard monthlyStats={monthlyStats} />
                ) : (
                    <TransactionList
                        transactions={filteredTransactions}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                )}
            </main>

            {/* 거래 추가 모달 */}
            <AddTransactionModal
                showAddModal={showAddModal}
                setShowAddModal={setShowAddModal}
                transactionType={transactionType}
                setTransactionType={setTransactionType}
                amount={amount}
                setAmount={setAmount}
                category={category}
                setCategory={setCategory}
                description={description}
                setDescription={setDescription}
                date={date}
                setDate={setDate}
                onAddTransaction={handleAddTransaction}
                categories={categories}
            />
        </div>
    );
};

export default ExpenseTracker;
