package com.devji.account_book.expense.service;

import com.devji.account_book.expense.dto.TransactionDto;
import com.devji.account_book.expense.entity.Transaction;
import com.devji.account_book.expense.entity.TransactionType;
import com.devji.account_book.expense.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TransactionService {
    
    private final TransactionRepository transactionRepository;

    // 거래 생성
    public TransactionDto createTransaction(long userId, TransactionDto transactionDto) {
        log.info("Creating transaction for user: {}", userId);
        
        Transaction transaction = Transaction.builder()
                .userId(userId)
                .type(transactionDto.getType())
                .category(transactionDto.getCategory())
                .amount(transactionDto.getAmount())
                .description(transactionDto.getDescription())
                .transactionDate(transactionDto.getTransactionDate())
                .build();
        
        Transaction saved = transactionRepository.save(transaction);
        return convertToDto(saved);
    }
    
    // 거래 수정
    public TransactionDto updateTransaction(long userId, Long id, TransactionDto transactionDto) {
        log.info("Updating transaction {} for user: {}", id, userId);

        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));

        transaction.setType(transactionDto.getType());
        transaction.setCategory(transactionDto.getCategory());
        transaction.setAmount(transactionDto.getAmount());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setTransactionDate(transactionDto.getTransactionDate());

        Transaction updated = transactionRepository.save(transaction);
        return convertToDto(updated);
    }
//
//    // 거래 삭제
//    public void deleteTransaction(Long id) {
//        String userId = getCurrentUserId();
//        log.info("Deleting transaction {} for user: {}", id, userId);
//
//        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
//                .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
//
//        transactionRepository.delete(transaction);
//    }
//
//    // 거래 단일 조회
//    @Transactional(readOnly = true)
//    public TransactionDto getTransaction(Long id) {
//        String userId = getCurrentUserId();
//
//        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
//                .orElseThrow(() -> new RuntimeException("거래를 찾을 수 없습니다."));
//
//        return convertToDto(transaction);
//    }
//
//    // 거래 목록 조회 (페이징)
//    @Transactional(readOnly = true)
//    public Page<TransactionDto> getTransactions(int page, int size) {
//        String userId = getCurrentUserId();
//        Pageable pageable = PageRequest.of(page, size);
//
//        Page<Transaction> transactions = transactionRepository
//                .findByUserIdOrderByTransactionDateDescCreatedAtDesc(userId, pageable);
//
//        return transactions.map(this::convertToDto);
//    }
//
//    // 거래 검색
//    @Transactional(readOnly = true)
//    public Page<TransactionDto> searchTransactions(String keyword, int page, int size) {
//        String userId = getCurrentUserId();
//        Pageable pageable = PageRequest.of(page, size);
//
//        Page<Transaction> transactions = transactionRepository
//                .findByUserIdAndSearch(userId, keyword, pageable);
//
//        return transactions.map(this::convertToDto);
//    }
//
//    // 기간별 거래 조회
//    @Transactional(readOnly = true)
//    public Page<TransactionDto> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate, int page, int size) {
//        String userId = getCurrentUserId();
//        Pageable pageable = PageRequest.of(page, size);
//
//        Page<Transaction> transactions = transactionRepository
//                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
//                        userId, startDate, endDate, pageable);
//
//        return transactions.map(this::convertToDto);
//    }
//
//    // 월별 통계
//    @Transactional(readOnly = true)
//    public Map<String, Object> getMonthlyStats(int year, int month) {
//        String userId = getCurrentUserId();
//
//        BigDecimal totalIncome = transactionRepository.getTotalIncomeByMonth(userId, year, month);
//        BigDecimal totalExpense = transactionRepository.getTotalExpenseByMonth(userId, year, month);
//
//        if (totalIncome == null) {
//            totalIncome = BigDecimal.ZERO;
//        }
//        if (totalExpense == null) {
//            totalExpense = BigDecimal.ZERO;
//        }
//
//        BigDecimal balance = totalIncome.subtract(totalExpense);
//
//        Map<String, Object> stats = new HashMap<>();
//        stats.put("totalIncome", totalIncome);
//        stats.put("totalExpense", totalExpense);
//        stats.put("balance", balance);
//
//        // 카테고리별 통계
//        List<Object[]> expenseStats = transactionRepository.getCategoryStatsByMonth(
//                userId, TransactionType.EXPENSE, year, month);
//        List<Object[]> incomeStats = transactionRepository.getCategoryStatsByMonth(
//                userId, TransactionType.INCOME, year, month);
//
//        stats.put("expenseByCategory", expenseStats);
//        stats.put("incomeByCategory", incomeStats);
//
//        return stats;
//    }
//
    // Entity -> DTO 변환
    private TransactionDto convertToDto(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .category(transaction.getCategory())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
